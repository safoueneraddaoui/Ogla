import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AthletesService } from './athletes.service'
import { PrismaService } from '../../prisma/prisma.service'

const mockUser = {
  id: 'user-1',
  email: 'athlete@example.com',
  firstName: 'Ali',
  lastName: 'Hassan',
  role: 'ATHLETE',
}

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

const mockPrisma = {
  athleteProfile: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(),
}

describe('AthletesService', () => {
  let service: AthletesService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AthletesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile()

    service = module.get<AthletesService>(AthletesService)
    jest.clearAllMocks()
  })

  // ─── findAll ─────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns paginated profiles with total count', async () => {
      mockPrisma.$transaction.mockResolvedValue([[mockProfile], 1])
      const result = await service.findAll(1, 20)
      expect(result).toEqual({ profiles: [mockProfile], total: 1, page: 1, limit: 20 })
    })
  })

  // ─── findById ────────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('returns profile when found', async () => {
      mockPrisma.athleteProfile.findUnique.mockResolvedValue(mockProfile)
      const result = await service.findById('profile-1')
      expect(result).toEqual(mockProfile)
      expect(mockPrisma.athleteProfile.findUnique).toHaveBeenCalledWith({
        where: { id: 'profile-1' },
        include: { user: true },
      })
    })

    it('throws NotFoundException when not found', async () => {
      mockPrisma.athleteProfile.findUnique.mockResolvedValue(null)
      await expect(service.findById('ghost')).rejects.toThrow(NotFoundException)
    })
  })

  // ─── findByUserId ─────────────────────────────────────────────────────────────

  describe('findByUserId', () => {
    it('returns profile when found', async () => {
      mockPrisma.athleteProfile.findUnique.mockResolvedValue(mockProfile)
      const result = await service.findByUserId('user-1')
      expect(result).toEqual(mockProfile)
    })

    it('throws NotFoundException when not found', async () => {
      mockPrisma.athleteProfile.findUnique.mockResolvedValue(null)
      await expect(service.findByUserId('ghost')).rejects.toThrow(NotFoundException)
    })
  })

  // ─── search ──────────────────────────────────────────────────────────────────

  describe('search', () => {
    it('returns matching profiles and total', async () => {
      mockPrisma.$transaction.mockResolvedValue([[mockProfile], 1])
      const result = await service.search('ali', 1, 20)
      expect(result.profiles).toHaveLength(1)
      expect(result.total).toBe(1)
    })
  })

  // ─── upsert ──────────────────────────────────────────────────────────────────

  describe('upsert', () => {
    it('creates profile when it does not exist', async () => {
      mockPrisma.athleteProfile.upsert.mockResolvedValue(mockProfile)
      const result = await service.upsert('user-1', { beltRank: 'Black', disciplines: ['Judo'] })
      expect(result).toEqual(mockProfile)
      expect(mockPrisma.athleteProfile.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1' },
          create: expect.objectContaining({ userId: 'user-1' }),
        }),
      )
    })

    it('updates existing profile', async () => {
      const updated = { ...mockProfile, beltRank: 'Red', weightClass: '-90kg' }
      mockPrisma.athleteProfile.upsert.mockResolvedValue(updated)
      const result = await service.upsert('user-1', { beltRank: 'Red', weightClass: '-90kg' })
      expect(result.beltRank).toBe('Red')
    })
  })

  // ─── deleteProfile ────────────────────────────────────────────────────────────

  describe('deleteProfile', () => {
    it('deletes profile and returns true', async () => {
      mockPrisma.athleteProfile.findUnique.mockResolvedValue(mockProfile)
      mockPrisma.athleteProfile.delete.mockResolvedValue(mockProfile)
      const result = await service.deleteProfile('user-1')
      expect(result).toBe(true)
      expect(mockPrisma.athleteProfile.delete).toHaveBeenCalledWith({ where: { userId: 'user-1' } })
    })

    it('throws NotFoundException when profile does not exist', async () => {
      mockPrisma.athleteProfile.findUnique.mockResolvedValue(null)
      await expect(service.deleteProfile('ghost')).rejects.toThrow(NotFoundException)
    })
  })
})
