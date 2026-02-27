import type { CompetitionEntryStatus, CompetitionStatus } from '../enums'

export interface ICompetition {
  id: string
  name: string
  description?: string | null
  discipline: string
  location: string
  startDate: Date
  endDate?: Date | null
  status: CompetitionStatus
  maxParticipants?: number | null
  createdById: string
  createdAt: Date
  updatedAt: Date
}

export interface ICompetitionEntry {
  id: string
  competitionId: string
  athleteId: string
  status: CompetitionEntryStatus
  weightClass?: string | null
  registeredAt: Date
  updatedAt: Date
}
