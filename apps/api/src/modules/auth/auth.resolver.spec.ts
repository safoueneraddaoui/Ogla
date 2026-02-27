import { ConflictException, UnauthorizedException } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import { type User } from '@prisma/client'
import { AuthProvider, Role } from '@ogla/shared-types'
import { AuthResolver } from './auth.resolver'
import { AuthService } from './auth.service'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mockUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-id-1',
  email: 'test@example.com',
  password: '$2b$10$hashed',
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

const mockAuthPayload = (user = mockUser()) => ({
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  user,
})

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockAuthService = {
  register: jest.fn(),
  validateUser: jest.fn(),
  login: jest.fn(),
  refreshTokens: jest.fn(),
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AuthResolver', () => {
  let resolver: AuthResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile()

    resolver = module.get<AuthResolver>(AuthResolver)
    jest.clearAllMocks()
  })

  // ─── register ──────────────────────────────────────────────────────────────

  describe('register', () => {
    const input = {
      email: 'new@example.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Doe',
    }

    it('returns AuthPayload on successful registration', async () => {
      const payload = mockAuthPayload()
      mockAuthService.register.mockResolvedValue(payload)

      const result = await resolver.register(input)

      expect(mockAuthService.register).toHaveBeenCalledWith(input)
      expect(result).toEqual(payload)
    })

    it('propagates ConflictException when email is already taken', async () => {
      mockAuthService.register.mockRejectedValue(new ConflictException('Email already in use'))

      await expect(resolver.register(input)).rejects.toThrow(ConflictException)
    })
  })

  // ─── login ─────────────────────────────────────────────────────────────────

  describe('login', () => {
    const input = { email: 'test@example.com', password: 'password123' }

    it('returns AuthPayload for valid credentials', async () => {
      const user = mockUser()
      const payload = mockAuthPayload(user)
      mockAuthService.validateUser.mockResolvedValue(user)
      mockAuthService.login.mockResolvedValue(payload)

      const result = await resolver.login(input)

      expect(mockAuthService.validateUser).toHaveBeenCalledWith(input.email, input.password)
      expect(mockAuthService.login).toHaveBeenCalledWith(user)
      expect(result).toEqual(payload)
    })

    it('throws UnauthorizedException for invalid credentials', async () => {
      mockAuthService.validateUser.mockResolvedValue(null)

      await expect(resolver.login(input)).rejects.toThrow(UnauthorizedException)
      expect(mockAuthService.login).not.toHaveBeenCalled()
    })
  })

  // ─── refreshTokens ─────────────────────────────────────────────────────────

  describe('refreshTokens', () => {
    it('returns new AuthPayload for a valid refresh token', async () => {
      const payload = mockAuthPayload()
      mockAuthService.refreshTokens.mockResolvedValue(payload)

      const result = await resolver.refreshTokens('valid-refresh-token')

      expect(mockAuthService.refreshTokens).toHaveBeenCalledWith('valid-refresh-token')
      expect(result).toEqual(payload)
    })

    it('propagates UnauthorizedException for an invalid refresh token', async () => {
      mockAuthService.refreshTokens.mockRejectedValue(
        new UnauthorizedException('Invalid refresh token'),
      )

      await expect(resolver.refreshTokens('bad-token')).rejects.toThrow(UnauthorizedException)
    })
  })

  // ─── logout ────────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('returns true (client-side token discard)', () => {
      const user = mockUser()
      const result = resolver.logout(user)
      expect(result).toBe(true)
    })
  })

  // ─── authHealth ────────────────────────────────────────────────────────────

  describe('authHealth', () => {
    it('returns true', () => {
      expect(resolver.authHealth()).toBe(true)
    })
  })
})
