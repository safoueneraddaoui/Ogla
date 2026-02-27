import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { ClubsResolver } from './clubs.resolver'
import { ClubsService } from './clubs.service'

const mockUser = { id: 'user-1', email: 'club@example.com', role: 'CLUB' }

const mockProfile = {
  id: 'profile-1',
  userId: 'user-1',
  name: 'Tigers MMA Club',
  description: 'Elite MMA training',
  address: 'Tunis, Tunisia',
  logo: null,
  disciplines: ['MMA', 'Boxing'],
  foundedYear: 2010,
  website: 'https://tigers.tn',
  user: mockUser,
}

const mockList = { profiles: [mockProfile], total: 1, page: 1, limit: 20 }

const mockClubsService = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  search: jest.fn(),
  upsert: jest.fn(),
  deleteProfile: jest.fn(),
}

describe('ClubsResolver', () => {
  let resolver: ClubsResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClubsResolver,
        { provide: ClubsService, useValue: mockClubsService },
      ],
    }).compile()

    resolver = module.get<ClubsResolver>(ClubsResolver)
    jest.clearAllMocks()
  })

  // ─── clubProfiles ─────────────────────────────────────────────────────────────

  describe('clubProfiles', () => {
    it('returns paginated club profiles', async () => {
      mockClubsService.findAll.mockResolvedValue(mockList)
      const result = await resolver.clubProfiles(1, 20)
      expect(result).toEqual(mockList)
      expect(mockClubsService.findAll).toHaveBeenCalledWith(1, 20)
    })
  })

  // ─── clubProfile ──────────────────────────────────────────────────────────────

  describe('clubProfile', () => {
    it('returns profile by id', async () => {
      mockClubsService.findById.mockResolvedValue(mockProfile)
      const result = await resolver.clubProfile('profile-1')
      expect(result).toEqual(mockProfile)
    })

    it('propagates NotFoundException', async () => {
      mockClubsService.findById.mockRejectedValue(new NotFoundException())
      await expect(resolver.clubProfile('ghost')).rejects.toThrow(NotFoundException)
    })
  })

  // ─── clubProfileByUserId ──────────────────────────────────────────────────────

  describe('clubProfileByUserId', () => {
    it('returns profile by userId', async () => {
      mockClubsService.findByUserId.mockResolvedValue(mockProfile)
      const result = await resolver.clubProfileByUserId('user-1')
      expect(result).toEqual(mockProfile)
    })

    it('propagates NotFoundException', async () => {
      mockClubsService.findByUserId.mockRejectedValue(new NotFoundException())
      await expect(resolver.clubProfileByUserId('ghost')).rejects.toThrow(NotFoundException)
    })
  })

  // ─── searchClubs ──────────────────────────────────────────────────────────────

  describe('searchClubs', () => {
    it('returns matching club profiles', async () => {
      mockClubsService.search.mockResolvedValue(mockList)
      const result = await resolver.searchClubs('tigers', 1, 20)
      expect(result).toEqual(mockList)
      expect(mockClubsService.search).toHaveBeenCalledWith('tigers', 1, 20)
    })
  })

  // ─── upsertClubProfile ────────────────────────────────────────────────────────

  describe('upsertClubProfile', () => {
    it('creates or updates own club profile', async () => {
      mockClubsService.upsert.mockResolvedValue(mockProfile)
      const result = await resolver.upsertClubProfile(mockUser as never, {
        name: 'Tigers MMA Club',
        disciplines: ['MMA'],
      })
      expect(result).toEqual(mockProfile)
      expect(mockClubsService.upsert).toHaveBeenCalledWith('user-1', {
        name: 'Tigers MMA Club',
        disciplines: ['MMA'],
      })
    })
  })

  // ─── deleteClubProfile ────────────────────────────────────────────────────────

  describe('deleteClubProfile', () => {
    it('deletes own profile and returns true', async () => {
      mockClubsService.deleteProfile.mockResolvedValue(true)
      const result = await resolver.deleteClubProfile(mockUser as never)
      expect(result).toBe(true)
      expect(mockClubsService.deleteProfile).toHaveBeenCalledWith('user-1')
    })

    it('propagates NotFoundException when profile does not exist', async () => {
      mockClubsService.deleteProfile.mockRejectedValue(new NotFoundException())
      await expect(resolver.deleteClubProfile(mockUser as never)).rejects.toThrow(NotFoundException)
    })
  })
})
