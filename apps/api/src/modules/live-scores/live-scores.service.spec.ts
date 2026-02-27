import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { MatchStatus } from '@ogla/shared-types'
import { LiveScoresService } from './live-scores.service'
import { PrismaService } from '../../prisma/prisma.service'
import { RedisService } from '../../common/redis/redis.service'

const mockMatch = {
  id: 'match-1',
  score: { red: 2, blue: 1 },
  status: MatchStatus.LIVE,
  winnerId: null,
  updatedAt: new Date(),
}

const mockPrisma = {
  match: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
}

const mockRedis = {
  publish: jest.fn().mockResolvedValue(undefined),
}

describe('LiveScoresService', () => {
  let service: LiveScoresService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LiveScoresService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
      ],
    }).compile()

    service = module.get<LiveScoresService>(LiveScoresService)
    jest.clearAllMocks()
  })

  // ─── getMatchScore ────────────────────────────────────────────────────────────

  describe('getMatchScore', () => {
    it('returns score and status for a match', async () => {
      mockPrisma.match.findUnique.mockResolvedValue(mockMatch)
      const result = await service.getMatchScore('match-1')
      expect(result.score).toEqual({ red: 2, blue: 1 })
      expect(result.status).toBe(MatchStatus.LIVE)
      expect(mockPrisma.match.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'match-1' } }),
      )
    })

    it('throws NotFoundException when match not found', async () => {
      mockPrisma.match.findUnique.mockResolvedValue(null)
      await expect(service.getMatchScore('ghost')).rejects.toThrow(NotFoundException)
    })
  })

  // ─── updateScore ─────────────────────────────────────────────────────────────

  describe('updateScore', () => {
    it('updates score, publishes to Redis and GraphQL PubSub', async () => {
      mockPrisma.match.findUnique.mockResolvedValue(mockMatch)
      mockPrisma.match.update.mockResolvedValue({
        ...mockMatch,
        score: { red: 3, blue: 1 },
        status: MatchStatus.LIVE,
      })
      const pubSpy = jest.spyOn(service.pubSub, 'publish').mockResolvedValue(undefined)

      const result = await service.updateScore({
        matchId: 'match-1',
        score: { red: 3, blue: 1 },
        status: MatchStatus.LIVE,
      })

      expect(result.matchId).toBe('match-1')
      expect(result.score).toEqual({ red: 3, blue: 1 })
      expect(mockRedis.publish).toHaveBeenCalledWith(
        'match:score:match-1',
        expect.objectContaining({ matchId: 'match-1' }),
      )
      expect(pubSpy).toHaveBeenCalledWith(
        'matchScoreUpdated',
        expect.objectContaining({ matchScoreUpdated: expect.objectContaining({ matchId: 'match-1' }) }),
      )
    })

    it('still returns payload even when Redis publish fails', async () => {
      mockPrisma.match.findUnique.mockResolvedValue(mockMatch)
      mockPrisma.match.update.mockResolvedValue({ ...mockMatch, score: { red: 3, blue: 2 } })
      mockRedis.publish.mockRejectedValueOnce(new Error('Redis down'))
      jest.spyOn(service.pubSub, 'publish').mockResolvedValue(undefined)

      const result = await service.updateScore({ matchId: 'match-1', score: { red: 3, blue: 2 } })
      expect(result.matchId).toBe('match-1')
    })

    it('throws NotFoundException when match not found', async () => {
      mockPrisma.match.findUnique.mockResolvedValue(null)
      await expect(service.updateScore({ matchId: 'ghost' })).rejects.toThrow(NotFoundException)
    })

    it('updates status to COMPLETED and sets winnerId', async () => {
      mockPrisma.match.findUnique.mockResolvedValue(mockMatch)
      mockPrisma.match.update.mockResolvedValue({
        ...mockMatch,
        status: MatchStatus.COMPLETED,
        winnerId: 'athlete-1',
      })
      jest.spyOn(service.pubSub, 'publish').mockResolvedValue(undefined)

      const result = await service.updateScore({
        matchId: 'match-1',
        status: MatchStatus.COMPLETED,
        winnerId: 'athlete-1',
      })
      expect(result.status).toBe(MatchStatus.COMPLETED)
      expect(result.winnerId).toBe('athlete-1')
    })
  })
})
