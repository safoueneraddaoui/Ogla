import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AffiliationStatus } from '@ogla/shared-types'
import { AffiliationsService } from './affiliations.service'
import { PrismaService } from '../../prisma/prisma.service'

const mockAthlete = { id: 'athlete-1', email: 'athlete@example.com', role: 'ATHLETE' }
const mockClub = { id: 'club-1', email: 'club@example.com', role: 'CLUB' }

const mockAffiliation = {
  id: 'aff-1',
  athleteId: 'athlete-1',
  clubId: 'club-1',
  status: AffiliationStatus.PENDING,
  message: 'Please accept me',
  reviewedAt: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  athlete: mockAthlete,
  club: mockClub,
}

const mockPrisma = {
  affiliation: {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
}

describe('AffiliationsService', () => {
  let service: AffiliationsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AffiliationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile()

    service = module.get<AffiliationsService>(AffiliationsService)
    jest.clearAllMocks()
  })

  // ─── requestAffiliation ───────────────────────────────────────────────────────

  describe('requestAffiliation', () => {
    it('creates a new PENDING affiliation when none exists', async () => {
      mockPrisma.affiliation.findUnique.mockResolvedValue(null)
      mockPrisma.affiliation.create.mockResolvedValue(mockAffiliation)

      const result = await service.requestAffiliation('athlete-1', { clubId: 'club-1', message: 'Please accept me' })
      expect(result.status).toBe(AffiliationStatus.PENDING)
      expect(mockPrisma.affiliation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ athleteId: 'athlete-1', clubId: 'club-1', status: AffiliationStatus.PENDING }),
        }),
      )
    })

    it('throws ConflictException when a PENDING request already exists', async () => {
      mockPrisma.affiliation.findUnique.mockResolvedValue(mockAffiliation)
      await expect(
        service.requestAffiliation('athlete-1', { clubId: 'club-1' }),
      ).rejects.toThrow(ConflictException)
    })

    it('throws ConflictException when already an ACTIVE member', async () => {
      mockPrisma.affiliation.findUnique.mockResolvedValue({ ...mockAffiliation, status: AffiliationStatus.ACTIVE })
      await expect(
        service.requestAffiliation('athlete-1', { clubId: 'club-1' }),
      ).rejects.toThrow(ConflictException)
    })

    it('re-activates request when previous was LEFT', async () => {
      const leftAff = { ...mockAffiliation, status: AffiliationStatus.LEFT }
      mockPrisma.affiliation.findUnique.mockResolvedValue(leftAff)
      mockPrisma.affiliation.update.mockResolvedValue({ ...leftAff, status: AffiliationStatus.PENDING })

      const result = await service.requestAffiliation('athlete-1', { clubId: 'club-1' })
      expect(result.status).toBe(AffiliationStatus.PENDING)
      expect(mockPrisma.affiliation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: AffiliationStatus.PENDING }),
        }),
      )
    })

    it('re-activates request when previous was REJECTED', async () => {
      const rejectedAff = { ...mockAffiliation, status: AffiliationStatus.REJECTED }
      mockPrisma.affiliation.findUnique.mockResolvedValue(rejectedAff)
      mockPrisma.affiliation.update.mockResolvedValue({ ...rejectedAff, status: AffiliationStatus.PENDING })

      const result = await service.requestAffiliation('athlete-1', { clubId: 'club-1' })
      expect(result.status).toBe(AffiliationStatus.PENDING)
    })
  })

  // ─── leaveClub ───────────────────────────────────────────────────────────────

  describe('leaveClub', () => {
    it('sets status to LEFT for an ACTIVE affiliation', async () => {
      const activeAff = { ...mockAffiliation, status: AffiliationStatus.ACTIVE }
      mockPrisma.affiliation.findUnique.mockResolvedValue(activeAff)
      mockPrisma.affiliation.update.mockResolvedValue({ ...activeAff, status: AffiliationStatus.LEFT })

      const result = await service.leaveClub('aff-1', 'athlete-1')
      expect(result.status).toBe(AffiliationStatus.LEFT)
    })

    it('throws NotFoundException when affiliation does not exist', async () => {
      mockPrisma.affiliation.findUnique.mockResolvedValue(null)
      await expect(service.leaveClub('ghost', 'athlete-1')).rejects.toThrow(NotFoundException)
    })

    it('throws ForbiddenException when athlete does not own the affiliation', async () => {
      mockPrisma.affiliation.findUnique.mockResolvedValue({ ...mockAffiliation, status: AffiliationStatus.ACTIVE })
      await expect(service.leaveClub('aff-1', 'other-athlete')).rejects.toThrow(ForbiddenException)
    })

    it('throws ConflictException when affiliation is not ACTIVE', async () => {
      mockPrisma.affiliation.findUnique.mockResolvedValue(mockAffiliation) // PENDING
      await expect(service.leaveClub('aff-1', 'athlete-1')).rejects.toThrow(ConflictException)
    })
  })

  // ─── reviewAffiliation ────────────────────────────────────────────────────────

  describe('reviewAffiliation', () => {
    it('approves a PENDING affiliation', async () => {
      mockPrisma.affiliation.findUnique.mockResolvedValue(mockAffiliation)
      mockPrisma.affiliation.update.mockResolvedValue({ ...mockAffiliation, status: AffiliationStatus.ACTIVE })

      const result = await service.reviewAffiliation(
        { affiliationId: 'aff-1', status: AffiliationStatus.ACTIVE },
        'club-1',
      )
      expect(result.status).toBe(AffiliationStatus.ACTIVE)
    })

    it('rejects a PENDING affiliation', async () => {
      mockPrisma.affiliation.findUnique.mockResolvedValue(mockAffiliation)
      mockPrisma.affiliation.update.mockResolvedValue({ ...mockAffiliation, status: AffiliationStatus.REJECTED })

      const result = await service.reviewAffiliation(
        { affiliationId: 'aff-1', status: AffiliationStatus.REJECTED },
        'club-1',
      )
      expect(result.status).toBe(AffiliationStatus.REJECTED)
    })

    it('throws NotFoundException when affiliation does not exist', async () => {
      mockPrisma.affiliation.findUnique.mockResolvedValue(null)
      await expect(
        service.reviewAffiliation({ affiliationId: 'ghost', status: AffiliationStatus.ACTIVE }, 'club-1'),
      ).rejects.toThrow(NotFoundException)
    })

    it('throws ForbiddenException when reviewer is not the club', async () => {
      mockPrisma.affiliation.findUnique.mockResolvedValue(mockAffiliation)
      await expect(
        service.reviewAffiliation({ affiliationId: 'aff-1', status: AffiliationStatus.ACTIVE }, 'other-club'),
      ).rejects.toThrow(ForbiddenException)
    })

    it('throws ConflictException when affiliation is not PENDING', async () => {
      mockPrisma.affiliation.findUnique.mockResolvedValue({ ...mockAffiliation, status: AffiliationStatus.ACTIVE })
      await expect(
        service.reviewAffiliation({ affiliationId: 'aff-1', status: AffiliationStatus.REJECTED }, 'club-1'),
      ).rejects.toThrow(ConflictException)
    })
  })

  // ─── findByAthlete ────────────────────────────────────────────────────────────

  describe('findByAthlete', () => {
    it('returns all affiliations for an athlete', async () => {
      mockPrisma.affiliation.findMany.mockResolvedValue([mockAffiliation])
      const result = await service.findByAthlete('athlete-1')
      expect(result).toHaveLength(1)
      expect(mockPrisma.affiliation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { athleteId: 'athlete-1' } }),
      )
    })

    it('filters by status when provided', async () => {
      mockPrisma.affiliation.findMany.mockResolvedValue([mockAffiliation])
      await service.findByAthlete('athlete-1', AffiliationStatus.PENDING)
      expect(mockPrisma.affiliation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { athleteId: 'athlete-1', status: AffiliationStatus.PENDING } }),
      )
    })
  })

  // ─── findByClub ───────────────────────────────────────────────────────────────

  describe('findByClub', () => {
    it('returns all affiliations for a club', async () => {
      mockPrisma.affiliation.findMany.mockResolvedValue([mockAffiliation])
      const result = await service.findByClub('club-1')
      expect(result).toHaveLength(1)
    })

    it('filters by status when provided', async () => {
      mockPrisma.affiliation.findMany.mockResolvedValue([mockAffiliation])
      await service.findByClub('club-1', AffiliationStatus.PENDING)
      expect(mockPrisma.affiliation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { clubId: 'club-1', status: AffiliationStatus.PENDING } }),
      )
    })
  })

  // ─── findOne ──────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('returns affiliation by id', async () => {
      mockPrisma.affiliation.findUnique.mockResolvedValue(mockAffiliation)
      const result = await service.findOne('aff-1')
      expect(result).toEqual(mockAffiliation)
    })

    it('throws NotFoundException when not found', async () => {
      mockPrisma.affiliation.findUnique.mockResolvedValue(null)
      await expect(service.findOne('ghost')).rejects.toThrow(NotFoundException)
    })
  })
})
