import { Test, TestingModule } from '@nestjs/testing'
import { AffiliationStatus, Role } from '@ogla/shared-types'
import { AffiliationsResolver } from './affiliations.resolver'
import { AffiliationsService } from './affiliations.service'

const mockUser = { id: 'athlete-1', email: 'athlete@example.com', role: Role.ATHLETE }
const mockClubUser = { id: 'club-1', email: 'club@example.com', role: Role.CLUB }

const mockAffiliation = {
  id: 'aff-1',
  athleteId: 'athlete-1',
  clubId: 'club-1',
  status: AffiliationStatus.PENDING,
  message: 'Please accept me',
  reviewedAt: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
}

const mockAffiliationsService = {
  requestAffiliation: jest.fn(),
  leaveClub: jest.fn(),
  reviewAffiliation: jest.fn(),
  findByAthlete: jest.fn(),
  findByClub: jest.fn(),
  findOne: jest.fn(),
}

describe('AffiliationsResolver', () => {
  let resolver: AffiliationsResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AffiliationsResolver,
        { provide: AffiliationsService, useValue: mockAffiliationsService },
      ],
    }).compile()

    resolver = module.get<AffiliationsResolver>(AffiliationsResolver)
    jest.clearAllMocks()
  })

  // ─── Queries ──────────────────────────────────────────────────────────────────

  describe('myAffiliations', () => {
    it('returns affiliations for the current athlete', async () => {
      mockAffiliationsService.findByAthlete.mockResolvedValue([mockAffiliation])
      const result = await resolver.myAffiliations(mockUser as any)
      expect(result).toHaveLength(1)
      expect(mockAffiliationsService.findByAthlete).toHaveBeenCalledWith(mockUser.id, undefined)
    })

    it('filters by status when provided', async () => {
      mockAffiliationsService.findByAthlete.mockResolvedValue([mockAffiliation])
      await resolver.myAffiliations(mockUser as any, AffiliationStatus.PENDING)
      expect(mockAffiliationsService.findByAthlete).toHaveBeenCalledWith(mockUser.id, AffiliationStatus.PENDING)
    })
  })

  describe('clubAffiliations', () => {
    it('returns affiliations for the current club', async () => {
      mockAffiliationsService.findByClub.mockResolvedValue([mockAffiliation])
      const result = await resolver.clubAffiliations(mockClubUser as any)
      expect(result).toHaveLength(1)
      expect(mockAffiliationsService.findByClub).toHaveBeenCalledWith(mockClubUser.id, undefined)
    })

    it('filters by status when provided', async () => {
      mockAffiliationsService.findByClub.mockResolvedValue([{ ...mockAffiliation, status: AffiliationStatus.ACTIVE }])
      await resolver.clubAffiliations(mockClubUser as any, AffiliationStatus.ACTIVE)
      expect(mockAffiliationsService.findByClub).toHaveBeenCalledWith(mockClubUser.id, AffiliationStatus.ACTIVE)
    })
  })

  describe('pendingAffiliations', () => {
    it('returns PENDING affiliations for the current club', async () => {
      mockAffiliationsService.findByClub.mockResolvedValue([mockAffiliation])
      const result = await resolver.pendingAffiliations(mockClubUser as any)
      expect(result).toHaveLength(1)
      expect(mockAffiliationsService.findByClub).toHaveBeenCalledWith(mockClubUser.id, AffiliationStatus.PENDING)
    })
  })

  describe('affiliation', () => {
    it('returns a single affiliation by id', async () => {
      mockAffiliationsService.findOne.mockResolvedValue(mockAffiliation)
      const result = await resolver.affiliation('aff-1')
      expect(result).toEqual(mockAffiliation)
      expect(mockAffiliationsService.findOne).toHaveBeenCalledWith('aff-1')
    })

    it('propagates NotFoundException from service', async () => {
      const { NotFoundException } = await import('@nestjs/common')
      mockAffiliationsService.findOne.mockRejectedValue(new NotFoundException())
      await expect(resolver.affiliation('ghost')).rejects.toThrow(NotFoundException)
    })
  })

  // ─── Mutations ────────────────────────────────────────────────────────────────

  describe('requestAffiliation', () => {
    it('creates an affiliation request', async () => {
      mockAffiliationsService.requestAffiliation.mockResolvedValue(mockAffiliation)
      const result = await resolver.requestAffiliation(
        mockUser as any,
        { clubId: 'club-1', message: 'Please accept me' } as any,
      )
      expect(result.status).toBe(AffiliationStatus.PENDING)
      expect(mockAffiliationsService.requestAffiliation).toHaveBeenCalledWith(mockUser.id, {
        clubId: 'club-1',
        message: 'Please accept me',
      })
    })

    it('propagates ConflictException from service', async () => {
      const { ConflictException } = await import('@nestjs/common')
      mockAffiliationsService.requestAffiliation.mockRejectedValue(new ConflictException())
      await expect(
        resolver.requestAffiliation(mockUser as any, { clubId: 'club-1' } as any),
      ).rejects.toThrow(ConflictException)
    })
  })

  describe('leaveClub', () => {
    it('sets affiliation to LEFT', async () => {
      mockAffiliationsService.leaveClub.mockResolvedValue({ ...mockAffiliation, status: AffiliationStatus.LEFT })
      const result = await resolver.leaveClub(mockUser as any, 'aff-1')
      expect(result.status).toBe(AffiliationStatus.LEFT)
      expect(mockAffiliationsService.leaveClub).toHaveBeenCalledWith('aff-1', mockUser.id)
    })

    it('propagates ForbiddenException from service', async () => {
      const { ForbiddenException } = await import('@nestjs/common')
      mockAffiliationsService.leaveClub.mockRejectedValue(new ForbiddenException())
      await expect(resolver.leaveClub(mockUser as any, 'aff-1')).rejects.toThrow(ForbiddenException)
    })
  })

  describe('reviewAffiliation', () => {
    it('approves a pending affiliation', async () => {
      mockAffiliationsService.reviewAffiliation.mockResolvedValue({
        ...mockAffiliation,
        status: AffiliationStatus.ACTIVE,
      })
      const result = await resolver.reviewAffiliation(
        mockClubUser as any,
        { affiliationId: 'aff-1', status: AffiliationStatus.ACTIVE } as any,
      )
      expect(result.status).toBe(AffiliationStatus.ACTIVE)
      expect(mockAffiliationsService.reviewAffiliation).toHaveBeenCalledWith(
        { affiliationId: 'aff-1', status: AffiliationStatus.ACTIVE },
        mockClubUser.id,
      )
    })

    it('rejects a pending affiliation', async () => {
      mockAffiliationsService.reviewAffiliation.mockResolvedValue({
        ...mockAffiliation,
        status: AffiliationStatus.REJECTED,
      })
      const result = await resolver.reviewAffiliation(
        mockClubUser as any,
        { affiliationId: 'aff-1', status: AffiliationStatus.REJECTED } as any,
      )
      expect(result.status).toBe(AffiliationStatus.REJECTED)
    })

    it('propagates ForbiddenException from service', async () => {
      const { ForbiddenException } = await import('@nestjs/common')
      mockAffiliationsService.reviewAffiliation.mockRejectedValue(new ForbiddenException())
      await expect(
        resolver.reviewAffiliation(mockClubUser as any, { affiliationId: 'aff-1', status: AffiliationStatus.ACTIVE } as any),
      ).rejects.toThrow(ForbiddenException)
    })
  })
})
