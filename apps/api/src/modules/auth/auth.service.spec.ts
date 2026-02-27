import { ConflictException, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Test, type TestingModule } from '@nestjs/testing'
import { type User } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { AuthProvider, Role } from '@ogla/shared-types'
import { PrismaService } from '../../prisma/prisma.service'
import { AuthService } from './auth.service'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mockUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-id-1',
  email: 'test@example.com',
  password: '$2b$10$hashedpassword',
  firstName: 'John',
  lastName: 'Doe',
  role: Role.ATHLETE,
  avatar: null,
  locale: 'EN' as User['locale'],
  provider: AuthProvider.LOCAL,
  providerId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
}

const mockConfigService = {
  get: jest.fn((key: string, fallback?: string) => {
    const config: Record<string, string> = {
      'jwt.secret': 'test-secret',
      'jwt.refreshSecret': 'test-refresh-secret',
      'jwt.expiresIn': '15m',
      'jwt.refreshExpiresIn': '7d',
    }
    return config[key] ?? fallback
  }),
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)

    // Default JWT mock — returns predictable tokens
    mockJwtService.sign.mockImplementation((_payload: unknown, options?: { expiresIn?: string }) =>
      options?.expiresIn ? 'mock-refresh-token' : 'mock-access-token',
    )

    jest.clearAllMocks()

    // Re-apply after clearAllMocks
    mockJwtService.sign.mockImplementation((_payload: unknown, options?: { expiresIn?: string }) =>
      options?.expiresIn ? 'mock-refresh-token' : 'mock-access-token',
    )
  })

  // ─── register ──────────────────────────────────────────────────────────────

  describe('register', () => {
    const registerInput = {
      email: 'new@example.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Doe',
    }

    it('creates a new user and returns tokens', async () => {
      const createdUser = mockUser({ email: registerInput.email })
      mockPrismaService.user.findUnique.mockResolvedValue(null)
      mockPrismaService.user.create.mockResolvedValue(createdUser)

      const result = await service.register(registerInput)

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerInput.email },
      })
      expect(mockPrismaService.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: registerInput.email,
            firstName: registerInput.firstName,
            lastName: registerInput.lastName,
            role: Role.ATHLETE,
            provider: AuthProvider.LOCAL,
          }),
        }),
      )
      expect(result.accessToken).toBe('mock-access-token')
      expect(result.refreshToken).toBe('mock-refresh-token')
      expect(result.user).toEqual(createdUser)
    })

    it('hashes the password before storing', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null)
      mockPrismaService.user.create.mockResolvedValue(mockUser())

      await service.register(registerInput)

      const createCall = mockPrismaService.user.create.mock.calls[0][0]
      const storedPassword: string = createCall.data.password

      // Must not store plain text
      expect(storedPassword).not.toBe(registerInput.password)
      // Must be a valid bcrypt hash
      const isHash = await bcrypt.compare(registerInput.password, storedPassword)
      expect(isHash).toBe(true)
    })

    it('throws ConflictException when email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser())

      await expect(service.register(registerInput)).rejects.toThrow(ConflictException)
      expect(mockPrismaService.user.create).not.toHaveBeenCalled()
    })
  })

  // ─── validateUser ──────────────────────────────────────────────────────────

  describe('validateUser', () => {
    it('returns user when credentials are valid', async () => {
      const plainPassword = 'correct-password'
      const hashed = await bcrypt.hash(plainPassword, 10)
      const user = mockUser({ password: hashed })

      mockPrismaService.user.findUnique.mockResolvedValue(user)

      const result = await service.validateUser(user.email, plainPassword)
      expect(result).toEqual(user)
    })

    it('returns null when password is wrong', async () => {
      const hashed = await bcrypt.hash('correct-password', 10)
      const user = mockUser({ password: hashed })

      mockPrismaService.user.findUnique.mockResolvedValue(user)

      const result = await service.validateUser(user.email, 'wrong-password')
      expect(result).toBeNull()
    })

    it('returns null when user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null)

      const result = await service.validateUser('nobody@example.com', 'any')
      expect(result).toBeNull()
    })

    it('returns null when user has no password (OAuth-only account)', async () => {
      const oauthUser = mockUser({ password: null })
      mockPrismaService.user.findUnique.mockResolvedValue(oauthUser)

      const result = await service.validateUser(oauthUser.email, 'any')
      expect(result).toBeNull()
    })
  })

  // ─── login ─────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('issues access and refresh tokens for a valid user', async () => {
      const user = mockUser()
      const result = await service.login(user)

      expect(result.accessToken).toBe('mock-access-token')
      expect(result.refreshToken).toBe('mock-refresh-token')
      expect(result.user).toEqual(user)
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2)
    })
  })

  // ─── refreshTokens ─────────────────────────────────────────────────────────

  describe('refreshTokens', () => {
    it('returns new token pair for a valid refresh token', async () => {
      const user = mockUser()
      mockJwtService.verify.mockReturnValue({ sub: user.id, email: user.email, role: user.role })
      mockPrismaService.user.findUnique.mockResolvedValue(user)

      const result = await service.refreshTokens('valid-refresh-token')

      expect(mockJwtService.verify).toHaveBeenCalledWith('valid-refresh-token', {
        secret: 'test-refresh-secret',
      })
      expect(result.accessToken).toBe('mock-access-token')
      expect(result.refreshToken).toBe('mock-refresh-token')
    })

    it('throws UnauthorizedException for an invalid refresh token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('jwt expired')
      })

      await expect(service.refreshTokens('expired-token')).rejects.toThrow(UnauthorizedException)
    })

    it('throws UnauthorizedException when user no longer exists', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 'deleted-user-id' })
      mockPrismaService.user.findUnique.mockResolvedValue(null)

      await expect(service.refreshTokens('token')).rejects.toThrow(UnauthorizedException)
    })
  })

  // ─── findOrCreateOAuthUser ─────────────────────────────────────────────────

  describe('findOrCreateOAuthUser', () => {
    const oauthData = {
      email: 'google@example.com',
      firstName: 'Google',
      lastName: 'User',
      provider: AuthProvider.GOOGLE,
      providerId: 'google-123',
    }

    it('returns existing user matched by provider + providerId', async () => {
      const existing = mockUser({ provider: AuthProvider.GOOGLE, providerId: 'google-123' })
      mockPrismaService.user.findFirst.mockResolvedValue(existing)

      const result = await service.findOrCreateOAuthUser(oauthData)
      expect(result).toEqual(existing)
      expect(mockPrismaService.user.create).not.toHaveBeenCalled()
    })

    it('links OAuth provider to existing email account', async () => {
      const emailUser = mockUser({ provider: AuthProvider.LOCAL })
      const updated = { ...emailUser, provider: AuthProvider.GOOGLE, providerId: 'google-123' }

      mockPrismaService.user.findFirst.mockResolvedValue(null)
      mockPrismaService.user.findUnique.mockResolvedValue(emailUser)
      mockPrismaService.user.update.mockResolvedValue(updated)

      const result = await service.findOrCreateOAuthUser(oauthData)

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: emailUser.id },
        data: { provider: AuthProvider.GOOGLE, providerId: 'google-123' },
      })
      expect(result).toEqual(updated)
    })

    it('creates a brand-new user when no match is found', async () => {
      const newUser = mockUser({ provider: AuthProvider.GOOGLE, providerId: 'google-123' })

      mockPrismaService.user.findFirst.mockResolvedValue(null)
      mockPrismaService.user.findUnique.mockResolvedValue(null)
      mockPrismaService.user.create.mockResolvedValue(newUser)

      const result = await service.findOrCreateOAuthUser(oauthData)

      expect(mockPrismaService.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: oauthData.email,
            provider: AuthProvider.GOOGLE,
            providerId: oauthData.providerId,
            role: Role.ATHLETE,
          }),
        }),
      )
      expect(result).toEqual(newUser)
    })
  })
})
