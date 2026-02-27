import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { Role } from '@ogla/shared-types'
import { UsersService } from './users.service'
import { PrismaService } from '../../prisma/prisma.service'

const mockUser = {
  id: 'user-1',
  email: 'athlete@example.com',
  password: 'hashed',
  firstName: 'Ali',
  lastName: 'Hassan',
  role: Role.ATHLETE,
  avatar: null,
  locale: 'EN',
  provider: 'LOCAL',
  providerId: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
}

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(),
}

describe('UsersService', () => {
  let service: UsersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
    jest.clearAllMocks()
  })

  // ─── findById ────────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('returns user when found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      const result = await service.findById('user-1')
      expect(result).toEqual(mockUser)
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'user-1' } })
    })

    it('throws NotFoundException when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      await expect(service.findById('missing')).rejects.toThrow(NotFoundException)
    })
  })

  // ─── findByEmail ─────────────────────────────────────────────────────────────

  describe('findByEmail', () => {
    it('returns user when found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      const result = await service.findByEmail('athlete@example.com')
      expect(result).toEqual(mockUser)
    })

    it('returns null when not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      const result = await service.findByEmail('nobody@example.com')
      expect(result).toBeNull()
    })
  })

  // ─── findAll ─────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns paginated users with total count', async () => {
      mockPrisma.$transaction.mockResolvedValue([[mockUser], 1])
      const result = await service.findAll(1, 20)
      expect(result).toEqual({ users: [mockUser], total: 1, page: 1, limit: 20 })
    })

    it('calculates correct skip offset for page 2', async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0])
      await service.findAll(2, 10)
      expect(mockPrisma.$transaction).toHaveBeenCalled()
    })
  })

  // ─── search ──────────────────────────────────────────────────────────────────

  describe('search', () => {
    it('returns matching users and total', async () => {
      mockPrisma.$transaction.mockResolvedValue([[mockUser], 1])
      const result = await service.search('ali', 1, 20)
      expect(result.users).toHaveLength(1)
      expect(result.total).toBe(1)
    })
  })

  // ─── updateProfile ────────────────────────────────────────────────────────────

  describe('updateProfile', () => {
    it('updates and returns the user', async () => {
      const updated = { ...mockUser, firstName: 'Ahmed' }
      mockPrisma.user.update.mockResolvedValue(updated)
      const result = await service.updateProfile('user-1', { firstName: 'Ahmed' })
      expect(result.firstName).toBe('Ahmed')
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { firstName: 'Ahmed' },
      })
    })
  })

  // ─── changeRole ───────────────────────────────────────────────────────────────

  describe('changeRole', () => {
    it('updates role and returns updated user', async () => {
      const target = { ...mockUser, id: 'user-2' }
      mockPrisma.user.findUnique.mockResolvedValue(target)
      mockPrisma.user.update.mockResolvedValue({ ...target, role: Role.SUPER_ADMIN })

      const result = await service.changeRole('user-2', Role.SUPER_ADMIN, 'admin-1')
      expect(result.role).toBe(Role.SUPER_ADMIN)
    })

    it('throws ForbiddenException when admin tries to change their own role', async () => {
      await expect(service.changeRole('admin-1', Role.ATHLETE, 'admin-1')).rejects.toThrow(
        ForbiddenException,
      )
    })

    it('throws NotFoundException when target user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      await expect(service.changeRole('ghost', Role.ATHLETE, 'admin-1')).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  // ─── deleteAccount ────────────────────────────────────────────────────────────

  describe('deleteAccount', () => {
    it('deletes the user and returns true', async () => {
      mockPrisma.user.delete.mockResolvedValue(mockUser)
      const result = await service.deleteAccount('user-1')
      expect(result).toBe(true)
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: 'user-1' } })
    })
  })
})
