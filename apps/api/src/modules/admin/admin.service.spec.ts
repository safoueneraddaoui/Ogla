import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { AdminService } from './admin.service'
import { PrismaService } from '../../prisma/prisma.service'
import { Role } from '@ogla/shared-types'

const mockPrisma = {
  user: {
    count: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
  athleteProfile: { count: jest.fn() },
  clubProfile: { count: jest.fn() },
  competition: { count: jest.fn(), findMany: jest.fn() },
  affiliation: { count: jest.fn() },
  match: { count: jest.fn() },
  message: { count: jest.fn() },
}

const baseUser = {
  id: 'user-1',
  email: 'admin@ogla.com',
  firstName: 'Super',
  lastName: 'Admin',
  role: Role.SUPER_ADMIN,
  avatar: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('AdminService', () => {
  let service: AdminService

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile()
    service = module.get<AdminService>(AdminService)
  })

  // ── getDashboardStats ────────────────────────────────────────────────────────

  it('getDashboardStats — returns aggregated counts', async () => {
    mockPrisma.user.count.mockResolvedValue(100)
    mockPrisma.athleteProfile.count.mockResolvedValue(60)
    mockPrisma.clubProfile.count.mockResolvedValue(20)
    mockPrisma.competition.count.mockResolvedValue(5)
    mockPrisma.affiliation.count.mockResolvedValue(40)
    mockPrisma.match.count.mockResolvedValue(15)
    mockPrisma.message.count.mockResolvedValue(200)

    const result = await service.getDashboardStats()

    expect(result.totalUsers).toBe(100)
    expect(result.totalAthletes).toBe(60)
    expect(result.totalClubs).toBe(20)
    expect(result.totalCompetitions).toBe(5)
    expect(result.totalAffiliations).toBe(40)
    expect(result.totalMatches).toBe(15)
    expect(result.totalMessages).toBe(200)
  })

  // ── getUsers ─────────────────────────────────────────────────────────────────

  it('getUsers — returns all users without filters', async () => {
    mockPrisma.user.findMany.mockResolvedValue([baseUser])
    const result = await service.getUsers()
    expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} }),
    )
    expect(result).toEqual([baseUser])
  })

  it('getUsers — filters by role', async () => {
    mockPrisma.user.findMany.mockResolvedValue([baseUser])
    await service.getUsers(Role.ATHLETE)
    expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ role: Role.ATHLETE }),
      }),
    )
  })

  it('getUsers — applies search filter', async () => {
    mockPrisma.user.findMany.mockResolvedValue([baseUser])
    await service.getUsers(undefined, 'john')
    expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ OR: expect.any(Array) }) }),
    )
  })

  // ── getUser ──────────────────────────────────────────────────────────────────

  it('getUser — returns user by id', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(baseUser)
    const result = await service.getUser('user-1')
    expect(result).toBe(baseUser)
  })

  it('getUser — throws NotFoundException when not found', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    await expect(service.getUser('ghost')).rejects.toBeInstanceOf(NotFoundException)
  })

  // ── deleteUser ───────────────────────────────────────────────────────────────

  it('deleteUser — deletes user and returns true', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(baseUser)
    mockPrisma.user.delete.mockResolvedValue(baseUser)
    const result = await service.deleteUser('user-1')
    expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: 'user-1' } })
    expect(result).toBe(true)
  })

  it('deleteUser — throws NotFoundException if user missing', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    await expect(service.deleteUser('ghost')).rejects.toBeInstanceOf(NotFoundException)
  })

  // ── getCompetitions ──────────────────────────────────────────────────────────

  it('getCompetitions — returns competitions with counts', async () => {
    const comp = { id: 'comp-1', name: 'Open 2026', _count: { entries: 10, matches: 5 } }
    mockPrisma.competition.findMany.mockResolvedValue([comp])
    const result = await service.getCompetitions()
    expect(result).toEqual([comp])
  })
})
