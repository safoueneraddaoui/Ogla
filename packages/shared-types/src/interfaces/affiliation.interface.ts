import type { AffiliationStatus } from '../enums'

export interface IAffiliation {
  id: string
  athleteId: string
  clubId: string
  status: AffiliationStatus
  message?: string | null
  reviewedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}
