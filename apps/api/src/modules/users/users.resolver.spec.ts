import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { Role } from '@ogla/shared-types'
import { UsersResolver } from './users.resolver'
import { UsersService } from './users.service'

const mockUser = {
  id: 'user-1',
  email: 'athlete@example.com',
  firstName: 'Ali',
  lastName: 'Hassan',
  role: Role.ATHLETE,
  avatar: null,
  locale: 'EN',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
}

const mockAdmin = { ...mockUser, id: 'admin-1', role: Role.SUPER_ADMIN, email: 'admin@example.com' }

const mockList = { users: [mockUser], total: 1, page: 1, limit: 20 }

const mockUsersService = {
  findById: jest.fn(),
  updateProfile: jest.fn(),
  deleteAccount: jest.fn(),
  search: jest.fn(),
  findAll: jest.fn(),
  changeRole: jest.fn(),
}

describe('UsersResolver', () => {
  let resolver: UsersResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersResolver,
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile()

    resolver = module.get<UsersResolver>(UsersResolver)
    jest.clearAllMocks()
  })

  // ─── me ──────────────────────────────────────────────────────────────────────

  describe('me', () => {
    it('returns the current user from JWT payload', async () => {
      const result = await resolver.me(mockUser as never)
      expect(result).toEqual(mockUser)
    })
  })

  // ─── user ────────────────────────────────────────────────────────────────────

  describe('user', () => {
    it('returns user by id', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser)
      const result = await resolver.user('user-1')
      expect(result).toEqual(mockUser)
      expect(mockUsersService.findById).toHaveBeenCalledWith('user-1')
    })

    it('propagates NotFoundException', async () => {
      mockUsersService.findById.mockRejectedValue(new NotFoundException('User not found'))
      await expect(resolver.user('ghost')).rejects.toThrow(NotFoundException)
    })
  })

  // ─── searchUsers ─────────────────────────────────────────────────────────────

  describe('searchUsers', () => {
    it('returns paginated search results', async () => {
      mockUsersService.search.mockResolvedValue(mockList)
      const result = await resolver.searchUsers('ali', 1, 20)
      expect(result).toEqual(mockList)
      expect(mockUsersService.search).toHaveBeenCalledWith('ali', 1, 20)
    })
  })

  // ─── updateProfile ────────────────────────────────────────────────────────────

  describe('updateProfile', () => {
    it('updates and returns the user profile', async () => {
      const updated = { ...mockUser, firstName: 'Ahmed' }
      mockUsersService.updateProfile.mockResolvedValue(updated)

      const result = await resolver.updateProfile(mockUser as never, { firstName: 'Ahmed' })
      expect(result).toEqual(updated)
      expect(mockUsersService.updateProfile).toHaveBeenCalledWith('user-1', { firstName: 'Ahmed' })
    })
  })

  // ─── deleteAccount ────────────────────────────────────────────────────────────

  describe('deleteAccount', () => {
    it('returns true after deletion', async () => {
      mockUsersService.deleteAccount.mockResolvedValue(true)
      const result = await resolver.deleteAccount(mockUser as never)
      expect(result).toBe(true)
    })
  })

  // ─── users (SuperAdmin) ───────────────────────────────────────────────────────

  describe('users', () => {
    it('returns paginated user list', async () => {
      mockUsersService.findAll.mockResolvedValue(mockList)
      const result = await resolver.users(1, 20)
      expect(result).toEqual(mockList)
      expect(mockUsersService.findAll).toHaveBeenCalledWith(1, 20)
    })
  })

  // ─── changeRole (SuperAdmin) ──────────────────────────────────────────────────

  describe('changeRole', () => {
    it('changes user role and returns updated user', async () => {
      const promoted = { ...mockUser, role: Role.SUPER_ADMIN }
      mockUsersService.changeRole.mockResolvedValue(promoted)

      const result = await resolver.changeRole(mockAdmin as never, { userId: 'user-1', role: Role.SUPER_ADMIN })
      expect(result.role).toBe(Role.SUPER_ADMIN)
      expect(mockUsersService.changeRole).toHaveBeenCalledWith('user-1', Role.SUPER_ADMIN, 'admin-1')
    })

    it('propagates ForbiddenException when changing own role', async () => {
      mockUsersService.changeRole.mockRejectedValue(new ForbiddenException('Cannot change your own role'))
      await expect(
        resolver.changeRole(mockAdmin as never, { userId: 'admin-1', role: Role.ATHLETE }),
      ).rejects.toThrow(ForbiddenException)
    })
  })
})
