import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { ClubsService } from './clubs.service'
import { PrismaService } from '../../prisma/prisma.service'

const mockUser = {
  id: 'user-1',
  email: 'club@example.com',
  firstName: 'Tigers',
  lastName: 'Club',
  role: 'CLUB',
}

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

const mockPrisma = {
  clubProfile: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(),
}

describe('ClubsService', () => {
  let service: ClubsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClubsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile()

    service = module.get<ClubsService>(ClubsService)
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
      mockPrisma.clubProfile.findUnique.mockResolvedValue(mockProfile)
      const result = await service.findById('profile-1')
      expect(result).toEqual(mockProfile)
      expect(mockPrisma.clubProfile.findUnique).toHaveBeenCalledWith({
        where: { id: 'profile-1' },
        include: { user: true },
      })
    })

    it('throws NotFoundException when not found', async () => {
      mockPrisma.clubProfile.findUnique.mockResolvedValue(null)
      await expect(service.findById('ghost')).rejects.toThrow(NotFoundException)
    })
  })

  // ─── findByUserId ─────────────────────────────────────────────────────────────

  describe('findByUserId', () => {
    it('returns profile when found', async () => {
      mockPrisma.clubProfile.findUnique.mockResolvedValue(mockProfile)
      const result = await service.findByUserId('user-1')
      expect(result).toEqual(mockProfile)
    })

    it('throws NotFoundException when not found', async () => {
      mockPrisma.clubProfile.findUnique.mockResolvedValue(null)
      await expect(service.findByUserId('ghost')).rejects.toThrow(NotFoundException)
    })
  })

  // ─── search ──────────────────────────────────────────────────────────────────

  describe('search', () => {
    it('returns matching profiles and total', async () => {
      mockPrisma.$transaction.mockResolvedValue([[mockProfile], 1])
      const result = await service.search('tigers', 1, 20)
      expect(result.profiles).toHaveLength(1)
      expect(result.total).toBe(1)
    })
  })

  // ─── upsert ──────────────────────────────────────────────────────────────────

  describe('upsert', () => {
    it('creates profile when it does not exist', async () => {
      mockPrisma.clubProfile.upsert.mockResolvedValue(mockProfile)
      const result = await service.upsert('user-1', {
        name: 'Tigers MMA Club',
        disciplines: ['MMA'],
      })
      expect(result).toEqual(mockProfile)
      expect(mockPrisma.clubProfile.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1' },
          create: expect.objectContaining({ userId: 'user-1', name: 'Tigers MMA Club' }),
        }),
      )
    })

    it('updates existing profile', async () => {
      const updated = { ...mockProfile, name: 'Tigers Pro MMA', foundedYear: 2015 }
      mockPrisma.clubProfile.upsert.mockResolvedValue(updated)
      const result = await service.upsert('user-1', { name: 'Tigers Pro MMA', foundedYear: 2015 })
      expect(result.name).toBe('Tigers Pro MMA')
      expect(result.foundedYear).toBe(2015)
    })
  })

  // ─── deleteProfile ────────────────────────────────────────────────────────────

  describe('deleteProfile', () => {
    it('deletes profile and returns true', async () => {
      mockPrisma.clubProfile.findUnique.mockResolvedValue(mockProfile)
      mockPrisma.clubProfile.delete.mockResolvedValue(mockProfile)
      const result = await service.deleteProfile('user-1')
      expect(result).toBe(true)
      expect(mockPrisma.clubProfile.delete).toHaveBeenCalledWith({ where: { userId: 'user-1' } })
    })

    it('throws NotFoundException when profile does not exist', async () => {
      mockPrisma.clubProfile.findUnique.mockResolvedValue(null)
      await expect(service.deleteProfile('ghost')).rejects.toThrow(NotFoundException)
    })
  })
})
