import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AthletesResolver } from './athletes.resolver'
import { AthletesService } from './athletes.service'

const mockUser = { id: 'user-1', email: 'athlete@example.com', role: 'ATHLETE' }

const mockProfile = {
  id: 'profile-1',
  userId: 'user-1',
  beltRank: 'Black',
  weightClass: '-80kg',
  bio: 'Experienced judoka',
  disciplines: ['Judo'],
  achievements: null,
  dateOfBirth: null,
  user: mockUser,
}

const mockList = { profiles: [mockProfile], total: 1, page: 1, limit: 20 }

const mockAthletesService = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  search: jest.fn(),
  upsert: jest.fn(),
  deleteProfile: jest.fn(),
}

describe('AthletesResolver', () => {
  let resolver: AthletesResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AthletesResolver,
        { provide: AthletesService, useValue: mockAthletesService },
      ],
    }).compile()

    resolver = module.get<AthletesResolver>(AthletesResolver)
    jest.clearAllMocks()
  })

  // ─── athleteProfiles ─────────────────────────────────────────────────────────

  describe('athleteProfiles', () => {
    it('returns paginated profiles', async () => {
      mockAthletesService.findAll.mockResolvedValue(mockList)
      const result = await resolver.athleteProfiles(1, 20)
      expect(result).toEqual(mockList)
      expect(mockAthletesService.findAll).toHaveBeenCalledWith(1, 20)
    })
  })

  // ─── athleteProfile ──────────────────────────────────────────────────────────

  describe('athleteProfile', () => {
    it('returns profile by id', async () => {
      mockAthletesService.findById.mockResolvedValue(mockProfile)
      const result = await resolver.athleteProfile('profile-1')
      expect(result).toEqual(mockProfile)
    })

    it('propagates NotFoundException', async () => {
      mockAthletesService.findById.mockRejectedValue(new NotFoundException())
      await expect(resolver.athleteProfile('ghost')).rejects.toThrow(NotFoundException)
    })
  })

  // ─── athleteProfileByUserId ───────────────────────────────────────────────────

  describe('athleteProfileByUserId', () => {
    it('returns profile by userId', async () => {
      mockAthletesService.findByUserId.mockResolvedValue(mockProfile)
      const result = await resolver.athleteProfileByUserId('user-1')
      expect(result).toEqual(mockProfile)
    })

    it('propagates NotFoundException', async () => {
      mockAthletesService.findByUserId.mockRejectedValue(new NotFoundException())
      await expect(resolver.athleteProfileByUserId('ghost')).rejects.toThrow(NotFoundException)
    })
  })

  // ─── searchAthletes ──────────────────────────────────────────────────────────

  describe('searchAthletes', () => {
    it('returns matching profiles', async () => {
      mockAthletesService.search.mockResolvedValue(mockList)
      const result = await resolver.searchAthletes('judo', 1, 20)
      expect(result).toEqual(mockList)
      expect(mockAthletesService.search).toHaveBeenCalledWith('judo', 1, 20)
    })
  })

  // ─── upsertAthleteProfile ─────────────────────────────────────────────────────

  describe('upsertAthleteProfile', () => {
    it('creates or updates own profile', async () => {
      mockAthletesService.upsert.mockResolvedValue(mockProfile)
      const result = await resolver.upsertAthleteProfile(mockUser as never, {
        beltRank: 'Black',
        disciplines: ['Judo'],
      })
      expect(result).toEqual(mockProfile)
      expect(mockAthletesService.upsert).toHaveBeenCalledWith('user-1', {
        beltRank: 'Black',
        disciplines: ['Judo'],
      })
    })
  })

  // ─── deleteAthleteProfile ─────────────────────────────────────────────────────

  describe('deleteAthleteProfile', () => {
    it('deletes own profile and returns true', async () => {
      mockAthletesService.deleteProfile.mockResolvedValue(true)
      const result = await resolver.deleteAthleteProfile(mockUser as never)
      expect(result).toBe(true)
      expect(mockAthletesService.deleteProfile).toHaveBeenCalledWith('user-1')
    })

    it('propagates NotFoundException when profile does not exist', async () => {
      mockAthletesService.deleteProfile.mockRejectedValue(new NotFoundException())
      await expect(resolver.deleteAthleteProfile(mockUser as never)).rejects.toThrow(NotFoundException)
    })
  })
})
