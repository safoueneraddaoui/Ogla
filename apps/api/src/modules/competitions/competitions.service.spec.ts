import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { CompetitionEntryStatus, CompetitionStatus, MatchStatus } from '@ogla/shared-types'
import { CompetitionsService } from './competitions.service'
import { PrismaService } from '../../prisma/prisma.service'

const mockCompetition = {
  id: 'comp-1',
  name: 'Karate Open 2025',
  description: null,
  discipline: 'Karate',
  location: 'Tunis',
  startDate: new Date('2025-06-01'),
  endDate: null,
  status: CompetitionStatus.DRAFT,
  maxParticipants: 32,
  createdById: 'admin-1',
  createdBy: { id: 'admin-1', email: 'admin@ogla.app' },
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
}

const mockEntry = {
  id: 'entry-1',
  competitionId: 'comp-1',
  athleteId: 'athlete-1',
  competition: mockCompetition,
  athlete: { id: 'athlete-1', email: 'athlete@ogla.app' },
  status: CompetitionEntryStatus.REGISTERED,
  weightClass: '-75kg',
  registeredAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
}

const mockMatch = {
  id: 'match-1',
  competitionId: 'comp-1',
  athleteRedId: 'athlete-1',
  athleteBlueId: 'athlete-2',
  athleteRed: { id: 'athlete-1' },
  athleteBlue: { id: 'athlete-2' },
  winner: null,
  round: 1,
  status: MatchStatus.SCHEDULED,
  score: null,
  winnerId: null,
  scheduledAt: null,
  completedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockPrisma = {
  competition: {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  competitionEntry: {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  match: {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
}

describe('CompetitionsService', () => {
  let service: CompetitionsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompetitionsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile()

    service = module.get<CompetitionsService>(CompetitionsService)
    jest.clearAllMocks()
  })

  // ─── createCompetition ───────────────────────────────────────────────────────

  describe('createCompetition', () => {
    it('creates a competition with DRAFT status', async () => {
      mockPrisma.competition.create.mockResolvedValue(mockCompetition)
      const result = await service.createCompetition(
        { name: 'Karate Open 2025', discipline: 'Karate', location: 'Tunis', startDate: '2025-06-01' },
        'admin-1',
      )
      expect(result.status).toBe(CompetitionStatus.DRAFT)
      expect(mockPrisma.competition.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ createdById: 'admin-1' }) }),
      )
    })
  })

  // ─── updateCompetition ───────────────────────────────────────────────────────

  describe('updateCompetition', () => {
    it('updates a competition by id', async () => {
      mockPrisma.competition.findUnique.mockResolvedValue(mockCompetition)
      mockPrisma.competition.update.mockResolvedValue({ ...mockCompetition, name: 'New Name' })
      const result = await service.updateCompetition({ id: 'comp-1', name: 'New Name' })
      expect(result.name).toBe('New Name')
    })

    it('throws NotFoundException when competition not found', async () => {
      mockPrisma.competition.findUnique.mockResolvedValue(null)
      await expect(service.updateCompetition({ id: 'ghost', name: 'X' })).rejects.toThrow(NotFoundException)
    })
  })

  // ─── updateCompetitionStatus ─────────────────────────────────────────────────

  describe('updateCompetitionStatus', () => {
    it('updates competition status', async () => {
      mockPrisma.competition.findUnique.mockResolvedValue(mockCompetition)
      mockPrisma.competition.update.mockResolvedValue({ ...mockCompetition, status: CompetitionStatus.OPEN })
      const result = await service.updateCompetitionStatus({ id: 'comp-1', status: CompetitionStatus.OPEN })
      expect(result.status).toBe(CompetitionStatus.OPEN)
    })
  })

  // ─── deleteCompetition ───────────────────────────────────────────────────────

  describe('deleteCompetition', () => {
    it('deletes a DRAFT competition', async () => {
      mockPrisma.competition.findUnique.mockResolvedValue(mockCompetition)
      mockPrisma.competition.delete.mockResolvedValue(mockCompetition)
      const result = await service.deleteCompetition('comp-1')
      expect(result.id).toBe('comp-1')
    })

    it('throws ConflictException when competition is not DRAFT', async () => {
      mockPrisma.competition.findUnique.mockResolvedValue({ ...mockCompetition, status: CompetitionStatus.OPEN })
      await expect(service.deleteCompetition('comp-1')).rejects.toThrow(ConflictException)
    })

    it('throws NotFoundException when competition not found', async () => {
      mockPrisma.competition.findUnique.mockResolvedValue(null)
      await expect(service.deleteCompetition('ghost')).rejects.toThrow(NotFoundException)
    })
  })

  // ─── findAll ─────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns all competitions', async () => {
      mockPrisma.competition.findMany.mockResolvedValue([mockCompetition])
      const result = await service.findAll()
      expect(result).toHaveLength(1)
    })

    it('filters by status when provided', async () => {
      mockPrisma.competition.findMany.mockResolvedValue([mockCompetition])
      await service.findAll(CompetitionStatus.OPEN)
      expect(mockPrisma.competition.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: CompetitionStatus.OPEN } }),
      )
    })
  })

  // ─── findById ────────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('returns a competition by id', async () => {
      mockPrisma.competition.findUnique.mockResolvedValue(mockCompetition)
      const result = await service.findById('comp-1')
      expect(result.id).toBe('comp-1')
    })

    it('throws NotFoundException when not found', async () => {
      mockPrisma.competition.findUnique.mockResolvedValue(null)
      await expect(service.findById('ghost')).rejects.toThrow(NotFoundException)
    })
  })

  // ─── registerEntry ───────────────────────────────────────────────────────────

  describe('registerEntry', () => {
    it('registers athlete for an OPEN competition', async () => {
      mockPrisma.competition.findUnique.mockResolvedValue({ ...mockCompetition, status: CompetitionStatus.OPEN })
      mockPrisma.competitionEntry.findUnique.mockResolvedValue(null)
      mockPrisma.competitionEntry.create.mockResolvedValue(mockEntry)
      const result = await service.registerEntry({ competitionId: 'comp-1', weightClass: '-75kg' }, 'athlete-1')
      expect(result.status).toBe(CompetitionEntryStatus.REGISTERED)
    })

    it('throws ConflictException when competition is not OPEN', async () => {
      mockPrisma.competition.findUnique.mockResolvedValue(mockCompetition) // DRAFT
      await expect(
        service.registerEntry({ competitionId: 'comp-1' }, 'athlete-1'),
      ).rejects.toThrow(ConflictException)
    })

    it('throws ConflictException when already registered', async () => {
      mockPrisma.competition.findUnique.mockResolvedValue({ ...mockCompetition, status: CompetitionStatus.OPEN })
      mockPrisma.competitionEntry.findUnique.mockResolvedValue(mockEntry) // already REGISTERED
      await expect(
        service.registerEntry({ competitionId: 'comp-1' }, 'athlete-1'),
      ).rejects.toThrow(ConflictException)
    })

    it('re-registers after WITHDRAWN', async () => {
      mockPrisma.competition.findUnique.mockResolvedValue({ ...mockCompetition, status: CompetitionStatus.OPEN })
      mockPrisma.competitionEntry.findUnique.mockResolvedValue({
        ...mockEntry, status: CompetitionEntryStatus.WITHDRAWN,
      })
      mockPrisma.competitionEntry.update.mockResolvedValue({ ...mockEntry, status: CompetitionEntryStatus.REGISTERED })
      const result = await service.registerEntry({ competitionId: 'comp-1' }, 'athlete-1')
      expect(result.status).toBe(CompetitionEntryStatus.REGISTERED)
    })
  })

  // ─── withdrawEntry ───────────────────────────────────────────────────────────

  describe('withdrawEntry', () => {
    it('withdraws athlete entry', async () => {
      mockPrisma.competitionEntry.findUnique.mockResolvedValue(mockEntry)
      mockPrisma.competitionEntry.update.mockResolvedValue({ ...mockEntry, status: CompetitionEntryStatus.WITHDRAWN })
      const result = await service.withdrawEntry('entry-1', 'athlete-1')
      expect(result.status).toBe(CompetitionEntryStatus.WITHDRAWN)
    })

    it('throws NotFoundException when entry not found', async () => {
      mockPrisma.competitionEntry.findUnique.mockResolvedValue(null)
      await expect(service.withdrawEntry('ghost', 'athlete-1')).rejects.toThrow(NotFoundException)
    })

    it('throws ForbiddenException when athlete does not own the entry', async () => {
      mockPrisma.competitionEntry.findUnique.mockResolvedValue(mockEntry)
      await expect(service.withdrawEntry('entry-1', 'other-athlete')).rejects.toThrow(ForbiddenException)
    })

    it('throws ConflictException when entry is already withdrawn', async () => {
      mockPrisma.competitionEntry.findUnique.mockResolvedValue({
        ...mockEntry, status: CompetitionEntryStatus.WITHDRAWN,
      })
      await expect(service.withdrawEntry('entry-1', 'athlete-1')).rejects.toThrow(ConflictException)
    })
  })

  // ─── updateEntryStatus ────────────────────────────────────────────────────────

  describe('updateEntryStatus', () => {
    it('updates entry status', async () => {
      mockPrisma.competitionEntry.findUnique.mockResolvedValue(mockEntry)
      mockPrisma.competitionEntry.update.mockResolvedValue({ ...mockEntry, status: CompetitionEntryStatus.CONFIRMED })
      const result = await service.updateEntryStatus({ entryId: 'entry-1', status: CompetitionEntryStatus.CONFIRMED })
      expect(result.status).toBe(CompetitionEntryStatus.CONFIRMED)
    })

    it('throws NotFoundException when entry not found', async () => {
      mockPrisma.competitionEntry.findUnique.mockResolvedValue(null)
      await expect(
        service.updateEntryStatus({ entryId: 'ghost', status: CompetitionEntryStatus.CONFIRMED }),
      ).rejects.toThrow(NotFoundException)
    })
  })

  // ─── findEntries ─────────────────────────────────────────────────────────────

  describe('findEntries', () => {
    it('returns entries for a competition', async () => {
      mockPrisma.competitionEntry.findMany.mockResolvedValue([mockEntry])
      const result = await service.findEntries('comp-1')
      expect(result).toHaveLength(1)
    })

    it('filters by status when provided', async () => {
      mockPrisma.competitionEntry.findMany.mockResolvedValue([mockEntry])
      await service.findEntries('comp-1', CompetitionEntryStatus.REGISTERED)
      expect(mockPrisma.competitionEntry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { competitionId: 'comp-1', status: CompetitionEntryStatus.REGISTERED } }),
      )
    })
  })

  // ─── createMatch ─────────────────────────────────────────────────────────────

  describe('createMatch', () => {
    it('creates a match for a competition', async () => {
      mockPrisma.competition.findUnique.mockResolvedValue(mockCompetition)
      mockPrisma.match.create.mockResolvedValue(mockMatch)
      const result = await service.createMatch({
        competitionId: 'comp-1',
        athleteRedId: 'athlete-1',
        athleteBlueId: 'athlete-2',
        round: 1,
      })
      expect(result.status).toBe(MatchStatus.SCHEDULED)
    })

    it('throws NotFoundException when competition not found', async () => {
      mockPrisma.competition.findUnique.mockResolvedValue(null)
      await expect(
        service.createMatch({ competitionId: 'ghost', athleteRedId: 'a1', athleteBlueId: 'a2', round: 1 }),
      ).rejects.toThrow(NotFoundException)
    })
  })

  // ─── updateMatch ─────────────────────────────────────────────────────────────

  describe('updateMatch', () => {
    it('updates a match', async () => {
      mockPrisma.match.findUnique.mockResolvedValue(mockMatch)
      mockPrisma.match.update.mockResolvedValue({ ...mockMatch, status: MatchStatus.COMPLETED, winnerId: 'athlete-1' })
      const result = await service.updateMatch({ matchId: 'match-1', status: MatchStatus.COMPLETED, winnerId: 'athlete-1' })
      expect(result.status).toBe(MatchStatus.COMPLETED)
    })

    it('throws NotFoundException when match not found', async () => {
      mockPrisma.match.findUnique.mockResolvedValue(null)
      await expect(service.updateMatch({ matchId: 'ghost', status: MatchStatus.LIVE })).rejects.toThrow(NotFoundException)
    })
  })

  // ─── findMatches ─────────────────────────────────────────────────────────────

  describe('findMatches', () => {
    it('returns matches for a competition', async () => {
      mockPrisma.match.findMany.mockResolvedValue([mockMatch])
      const result = await service.findMatches('comp-1')
      expect(result).toHaveLength(1)
    })
  })
})
