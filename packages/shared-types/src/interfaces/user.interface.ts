import type { AuthProvider, Locale, Role } from '../enums'

export interface IUser {
  id: string
  email: string
  role: Role
  firstName: string
  lastName: string
  avatar?: string | null
  locale: Locale
  provider: AuthProvider
  providerId?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface IAthleteProfile {
  id: string
  userId: string
  beltRank?: string | null
  weightClass?: string | null
  bio?: string | null
  disciplines: string[]
  achievements?: Record<string, unknown> | null
  dateOfBirth?: Date | null
}

export interface IClubProfile {
  id: string
  userId: string
  name: string
  description?: string | null
  address?: string | null
  logo?: string | null
  disciplines: string[]
  foundedYear?: number | null
  website?: string | null
}

export interface IJwtPayload {
  sub: string
  email: string
  role: Role
  iat?: number
  exp?: number
}

export interface IAuthTokens {
  accessToken: string
  refreshToken: string
}
