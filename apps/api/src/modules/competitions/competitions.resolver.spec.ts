import { Test, TestingModule } from '@nestjs/testing'
import { CompetitionEntryStatus, CompetitionStatus, MatchStatus, Role } from '@ogla/shared-types'
import { CompetitionsResolver } from './competitions.resolver'
import { CompetitionsService } from './competitions.service'

const mockAdmin = { id: 'admin-1', email: 'admin@ogla.app', role: Role.SUPER_ADMIN }
const mockAthlete = { id: 'athlete-1', email: 'athlete@ogla.app', role: Role.ATHLETE }

const mockCompetition = {
  id: 'comp-1',
  name: 'Karate Open 2025',
  discipline: 'Karate',
  location: 'Tunis',
  startDate: new Date('2025-06-01'),
  status: CompetitionStatus.DRAFT,
  createdById: 'admin-1',
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockEntry = {
  id: 'entry-1',
  competitionId: 'comp-1',
  athleteId: 'athlete-1',
  status: CompetitionEntryStatus.REGISTERED,
  registeredAt: new Date(),
  updatedAt: new Date(),
}

const mockMatch = {
  id: 'match-1',
  competitionId: 'comp-1',
  athleteRedId: 'athlete-1',
  athleteBlueId: 'athlete-2',
  round: 1,
  status: MatchStatus.SCHEDULED,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockService = {
  createCompetition: jest.fn(),
  updateCompetition: jest.fn(),
  updateCompetitionStatus: jest.fn(),
  deleteCompetition: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  registerEntry: jest.fn(),
  withdrawEntry: jest.fn(),
  updateEntryStatus: jest.fn(),
  findEntries: jest.fn(),
  findMyEntries: jest.fn(),
  createMatch: jest.fn(),
  updateMatch: jest.fn(),
  findMatches: jest.fn(),
}

describe('CompetitionsResolver', () => {
  let resolver: CompetitionsResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompetitionsResolver,
        { provide: CompetitionsService, useValue: mockService },
      ],
    }).compile()

    resolver = module.get<CompetitionsResolver>(CompetitionsResolver)
    jest.clearAllMocks()
  })

  // ─── Queries ──────────────────────────────────────────────────────────────────

  describe('competitions', () => {
    it('returns all competitions', async () => {
      mockService.findAll.mockResolvedValue([mockCompetition])
      const result = await resolver.competitions()
      expect(result).toHaveLength(1)
      expect(mockService.findAll).toHaveBeenCalledWith(undefined)
    })

    it('filters by status', async () => {
      mockService.findAll.mockResolvedValue([mockCompetition])
      await resolver.competitions(CompetitionStatus.OPEN)
      expect(mockService.findAll).toHaveBeenCalledWith(CompetitionStatus.OPEN)
    })
  })

  describe('competition', () => {
    it('returns competition by id', async () => {
      mockService.findById.mockResolvedValue(mockCompetition)
      const result = await resolver.competition('comp-1')
      expect(result).toEqual(mockCompetition)
      expect(mockService.findById).toHaveBeenCalledWith('comp-1')
    })
  })

  describe('competitionEntries', () => {
    it('returns entries for a competition', async () => {
      mockService.findEntries.mockResolvedValue([mockEntry])
      const result = await resolver.competitionEntries('comp-1')
      expect(result).toHaveLength(1)
      expect(mockService.findEntries).toHaveBeenCalledWith('comp-1', undefined)
    })
  })

  describe('competitionMatches', () => {
    it('returns matches for a competition', async () => {
      mockService.findMatches.mockResolvedValue([mockMatch])
      const result = await resolver.competitionMatches('comp-1')
      expect(result).toHaveLength(1)
      expect(mockService.findMatches).toHaveBeenCalledWith('comp-1')
    })
  })

  describe('myEntries', () => {
    it("returns the current athlete's entries", async () => {
      mockService.findMyEntries.mockResolvedValue([mockEntry])
      const result = await resolver.myEntries(mockAthlete as any)
      expect(result).toHaveLength(1)
      expect(mockService.findMyEntries).toHaveBeenCalledWith(mockAthlete.id, undefined)
    })
  })

  // ─── SuperAdmin competition mutations ─────────────────────────────────────────

  describe('createCompetition', () => {
    it('creates a competition', async () => {
      mockService.createCompetition.mockResolvedValue(mockCompetition)
      const result = await resolver.createCompetition(mockAdmin as any, {
        name: 'Karate Open 2025',
        discipline: 'Karate',
        location: 'Tunis',
        startDate: '2025-06-01',
      })
      expect(result.status).toBe(CompetitionStatus.DRAFT)
      expect(mockService.createCompetition).toHaveBeenCalledWith(expect.any(Object), mockAdmin.id)
    })
  })

  describe('updateCompetition', () => {
    it('updates a competition', async () => {
      mockService.updateCompetition.mockResolvedValue({ ...mockCompetition, name: 'Updated' })
      const result = await resolver.updateCompetition({ id: 'comp-1', name: 'Updated' } as any)
      expect(result.name).toBe('Updated')
    })
  })

  describe('updateCompetitionStatus', () => {
    it('transitions competition status', async () => {
      mockService.updateCompetitionStatus.mockResolvedValue({ ...mockCompetition, status: CompetitionStatus.OPEN })
      const result = await resolver.updateCompetitionStatus({ id: 'comp-1', status: CompetitionStatus.OPEN })
      expect(result.status).toBe(CompetitionStatus.OPEN)
    })
  })

  describe('deleteCompetition', () => {
    it('deletes a DRAFT competition', async () => {
      mockService.deleteCompetition.mockResolvedValue(mockCompetition)
      const result = await resolver.deleteCompetition('comp-1')
      expect(result.id).toBe('comp-1')
      expect(mockService.deleteCompetition).toHaveBeenCalledWith('comp-1')
    })

    it('propagates ConflictException from service', async () => {
      const { ConflictException } = await import('@nestjs/common')
      mockService.deleteCompetition.mockRejectedValue(new ConflictException())
      await expect(resolver.deleteCompetition('comp-1')).rejects.toThrow(ConflictException)
    })
  })

  // ─── Athlete entry mutations ──────────────────────────────────────────────────

  describe('registerForCompetition', () => {
    it('registers athlete for competition', async () => {
      mockService.registerEntry.mockResolvedValue(mockEntry)
      const result = await resolver.registerForCompetition(mockAthlete as any, { competitionId: 'comp-1' } as any)
      expect(result.status).toBe(CompetitionEntryStatus.REGISTERED)
      expect(mockService.registerEntry).toHaveBeenCalledWith({ competitionId: 'comp-1' }, mockAthlete.id)
    })
  })

  describe('withdrawFromCompetition', () => {
    it('withdraws athlete from competition', async () => {
      mockService.withdrawEntry.mockResolvedValue({ ...mockEntry, status: CompetitionEntryStatus.WITHDRAWN })
      const result = await resolver.withdrawFromCompetition(mockAthlete as any, 'entry-1')
      expect(result.status).toBe(CompetitionEntryStatus.WITHDRAWN)
      expect(mockService.withdrawEntry).toHaveBeenCalledWith('entry-1', mockAthlete.id)
    })
  })

  describe('updateEntryStatus', () => {
    it('confirms an entry', async () => {
      mockService.updateEntryStatus.mockResolvedValue({ ...mockEntry, status: CompetitionEntryStatus.CONFIRMED })
      const result = await resolver.updateEntryStatus({ entryId: 'entry-1', status: CompetitionEntryStatus.CONFIRMED })
      expect(result.status).toBe(CompetitionEntryStatus.CONFIRMED)
    })
  })

  // ─── SuperAdmin match mutations ───────────────────────────────────────────────

  describe('createMatch', () => {
    it('creates a match', async () => {
      mockService.createMatch.mockResolvedValue(mockMatch)
      const result = await resolver.createMatch({
        competitionId: 'comp-1',
        athleteRedId: 'athlete-1',
        athleteBlueId: 'athlete-2',
        round: 1,
      })
      expect(result.status).toBe(MatchStatus.SCHEDULED)
    })
  })

  describe('updateMatch', () => {
    it('updates a match to COMPLETED with winner', async () => {
      mockService.updateMatch.mockResolvedValue({
        ...mockMatch, status: MatchStatus.COMPLETED, winnerId: 'athlete-1',
      })
      const result = await resolver.updateMatch({ matchId: 'match-1', status: MatchStatus.COMPLETED, winnerId: 'athlete-1' })
      expect(result.status).toBe(MatchStatus.COMPLETED)
    })
  })
})
