import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthPayload } from './dto/auth-payload.type'
import { RegisterInput } from './dto/register.input'
import { LoginInput } from './dto/login.input'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import type { User } from '@prisma/client'

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthPayload)
  async register(@Args('input') input: RegisterInput): Promise<AuthPayload> {
    return this.authService.register(input)
  }

  @Mutation(() => AuthPayload)
  async login(@Args('input') input: LoginInput): Promise<AuthPayload> {
    const user = await this.authService.validateUser(input.email, input.password)
    if (!user) throw new Error('Invalid credentials')
    return this.authService.login(user)
  }

  @Mutation(() => AuthPayload)
  async refreshTokens(@Args('refreshToken') refreshToken: string): Promise<AuthPayload> {
    return this.authService.refreshTokens(refreshToken)
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  logout(@CurrentUser() _user: User): boolean {
    // JWT is stateless; client discards tokens.
    // Future: add token to a Redis denylist here.
    return true
  }
}
