import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { type User } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../../prisma/prisma.service'
import { AuthProvider, Role, type IJwtPayload } from '@ogla/shared-types'
import type { RegisterInput } from './dto/register.input'

interface OAuthUserData {
  email: string
  firstName: string
  lastName: string
  avatar?: string
  provider: AuthProvider
  providerId: string
}

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(input: RegisterInput): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const existing = await this.prisma.user.findUnique({ where: { email: input.email } })
    if (existing) throw new ConflictException('Email already in use')

    const hashed = await bcrypt.hash(input.password, this.SALT_ROUNDS)
    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        password: hashed,
        firstName: input.firstName,
        lastName: input.lastName,
        role: Role.ATHLETE,
        provider: AuthProvider.LOCAL,
      },
    })

    return this.issueTokens(user)
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user?.password) return null
    const valid = await bcrypt.compare(password, user.password)
    return valid ? user : null
  }

  async login(user: User): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    return this.issueTokens(user)
  }

  async findOrCreateOAuthUser(data: OAuthUserData): Promise<User> {
    const existing = await this.prisma.user.findFirst({
      where: { provider: data.provider, providerId: data.providerId },
    })
    if (existing) return existing

    const byEmail = await this.prisma.user.findUnique({ where: { email: data.email } })
    if (byEmail) {
      return this.prisma.user.update({
        where: { id: byEmail.id },
        data: { provider: data.provider, providerId: data.providerId },
      })
    }

    return this.prisma.user.create({
      data: {
        ...data,
        role: Role.ATHLETE,
      },
    })
  }

  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    try {
      const payload = this.jwtService.verify<IJwtPayload>(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      })
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } })
      if (!user) throw new UnauthorizedException()
      return this.issueTokens(user)
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  private issueTokens(user: User) {
    const payload: IJwtPayload = { sub: user.id, email: user.email, role: user.role as Role }
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn', '7d'),
      }),
      user,
    }
  }
}
