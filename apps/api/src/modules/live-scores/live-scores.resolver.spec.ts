import { Test, TestingModule } from '@nestjs/testing'
import { MatchStatus } from '@ogla/shared-types'
import { LiveScoresResolver } from './live-scores.resolver'
import { LiveScoresService } from './live-scores.service'

const mockScorePayload = {
  matchId: 'match-1',
  score: { red: 2, blue: 1 },
  status: MatchStatus.LIVE,
  winnerId: undefined,
  updatedAt: new Date(),
}

const mockService = {
  getMatchScore: jest.fn(),
  updateScore: jest.fn(),
  pubSub: {
    asyncIterator: jest.fn().mockReturnValue({} as AsyncIterableIterator<unknown>),
  },
}

describe('LiveScoresResolver', () => {
  let resolver: LiveScoresResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LiveScoresResolver,
        { provide: LiveScoresService, useValue: mockService },
      ],
    }).compile()

    resolver = module.get<LiveScoresResolver>(LiveScoresResolver)
    jest.clearAllMocks()
  })

  // ─── matchScore query ─────────────────────────────────────────────────────────

  describe('matchScore', () => {
    it('returns current score snapshot for a match', async () => {
      mockService.getMatchScore.mockResolvedValue(mockScorePayload)
      const result = await resolver.matchScore('match-1')
      expect(result.matchId).toBe('match-1')
      expect(result.score).toEqual({ red: 2, blue: 1 })
      expect(mockService.getMatchScore).toHaveBeenCalledWith('match-1')
    })

    it('propagates NotFoundException from service', async () => {
      const { NotFoundException } = await import('@nestjs/common')
      mockService.getMatchScore.mockRejectedValue(new NotFoundException())
      await expect(resolver.matchScore('ghost')).rejects.toThrow(NotFoundException)
    })
  })

  // ─── updateMatchScore mutation ────────────────────────────────────────────────

  describe('updateMatchScore', () => {
    it('updates score and returns the payload', async () => {
      mockService.updateScore.mockResolvedValue({ ...mockScorePayload, score: { red: 3, blue: 1 } })
      const result = await resolver.updateMatchScore({
        matchId: 'match-1',
        score: { red: 3, blue: 1 },
      })
      expect(result.matchId).toBe('match-1')
      expect(result.score).toEqual({ red: 3, blue: 1 })
      expect(mockService.updateScore).toHaveBeenCalledWith({ matchId: 'match-1', score: { red: 3, blue: 1 } })
    })

    it('propagates NotFoundException from service', async () => {
      const { NotFoundException } = await import('@nestjs/common')
      mockService.updateScore.mockRejectedValue(new NotFoundException())
      await expect(resolver.updateMatchScore({ matchId: 'ghost' })).rejects.toThrow(NotFoundException)
    })

    it('marks match as COMPLETED with winner', async () => {
      mockService.updateScore.mockResolvedValue({
        ...mockScorePayload,
        status: MatchStatus.COMPLETED,
        winnerId: 'athlete-1',
      })
      const result = await resolver.updateMatchScore({
        matchId: 'match-1',
        status: MatchStatus.COMPLETED,
        winnerId: 'athlete-1',
      })
      expect(result.status).toBe(MatchStatus.COMPLETED)
      expect(result.winnerId).toBe('athlete-1')
    })
  })

  // ─── matchScoreUpdated subscription ──────────────────────────────────────────

  describe('matchScoreUpdated', () => {
    it('returns the pubSub async iterable for the match', () => {
      mockService.pubSub.asyncIterator.mockReturnValue({} as AsyncIterableIterator<unknown>)
      const result = resolver.matchScoreUpdated('match-1')
      expect(mockService.pubSub.asyncIterator).toHaveBeenCalledWith('matchScoreUpdated')
      expect(result).toBeDefined()
    })
  })
})
