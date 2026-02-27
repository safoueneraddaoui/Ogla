import type { MatchStatus } from '../enums'

export interface IMatch {
  id: string
  competitionId: string
  athleteRedId: string
  athleteBlueId: string
  round: number
  status: MatchStatus
  score?: Record<string, unknown> | null
  winnerId?: string | null
  scheduledAt?: Date | null
  completedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}
