import { Test, TestingModule } from '@nestjs/testing'
import { AdminResolver } from './admin.resolver'
import { AdminService } from './admin.service'
import { Role } from '@ogla/shared-types'

const mockStats = {
  totalUsers: 100,
  totalAthletes: 60,
  totalClubs: 20,
  totalCompetitions: 5,
  totalAffiliations: 40,
  totalMatches: 15,
  totalMessages: 200,
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

const mockService = {
  getDashboardStats: jest.fn(),
  getUsers: jest.fn(),
  getUser: jest.fn(),
  deleteUser: jest.fn(),
  getCompetitions: jest.fn(),
}

describe('AdminResolver', () => {
  let resolver: AdminResolver

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminResolver,
        { provide: AdminService, useValue: mockService },
      ],
    }).compile()
    resolver = module.get<AdminResolver>(AdminResolver)
  })

  // ── adminDashboardStats ──────────────────────────────────────────────────────

  it('adminDashboardStats — returns stats from service', async () => {
    mockService.getDashboardStats.mockResolvedValue(mockStats)
    const result = await resolver.adminDashboardStats()
    expect(result).toEqual(mockStats)
  })

  // ── adminUsers ───────────────────────────────────────────────────────────────

  it('adminUsers — returns all users without filters', async () => {
    mockService.getUsers.mockResolvedValue([baseUser])
    const result = await resolver.adminUsers()
    expect(mockService.getUsers).toHaveBeenCalledWith(undefined, undefined)
    expect(result).toEqual([baseUser])
  })

  it('adminUsers — passes role and search filters', async () => {
    mockService.getUsers.mockResolvedValue([baseUser])
    await resolver.adminUsers(Role.ATHLETE, 'john')
    expect(mockService.getUsers).toHaveBeenCalledWith(Role.ATHLETE, 'john')
  })

  // ── adminUser ────────────────────────────────────────────────────────────────

  it('adminUser — returns single user by id', async () => {
    mockService.getUser.mockResolvedValue(baseUser)
    const result = await resolver.adminUser('user-1')
    expect(mockService.getUser).toHaveBeenCalledWith('user-1')
    expect(result).toEqual(baseUser)
  })

  // ── adminDeleteUser ───────────────────────────────────────────────────────────

  it('adminDeleteUser — returns true on success', async () => {
    mockService.deleteUser.mockResolvedValue(true)
    const result = await resolver.adminDeleteUser('user-1')
    expect(mockService.deleteUser).toHaveBeenCalledWith('user-1')
    expect(result).toBe(true)
  })
})
