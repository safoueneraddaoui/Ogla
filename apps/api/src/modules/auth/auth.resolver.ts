import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UnauthorizedException, UseGuards } from '@nestjs/common'
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

  @Mutation(() => AuthPayload, { description: 'Register a new user with email and password' })
  async register(@Args('input') input: RegisterInput): Promise<AuthPayload> {
    return this.authService.register(input) as unknown as Promise<AuthPayload>
  }

  @Mutation(() => AuthPayload, { description: 'Login with email and password' })
  async login(@Args('input') input: LoginInput): Promise<AuthPayload> {
    const user = await this.authService.validateUser(input.email, input.password)
    if (!user) throw new UnauthorizedException('Invalid email or password')
    return this.authService.login(user) as unknown as AuthPayload
  }

  @Mutation(() => AuthPayload, { description: 'Issue new token pair using a valid refresh token' })
  async refreshTokens(@Args('refreshToken') refreshToken: string): Promise<AuthPayload> {
    return this.authService.refreshTokens(refreshToken) as unknown as Promise<AuthPayload>
  }

  @Mutation(() => Boolean, { description: 'Invalidate the current session (client must discard tokens)' })
  @UseGuards(JwtAuthGuard)
  logout(@CurrentUser() _user: User): boolean {
    // JWT is stateless — client discards tokens.
    // TODO Phase 5: add jti to Redis denylist for true server-side invalidation.
    return true
  }

  @Query(() => Boolean, { description: 'Health check for the auth module' })
  authHealth(): boolean {
    return true
  }
}
