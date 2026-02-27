import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ConfigService } from '@nestjs/config'
import type { Request, Response } from 'express'
import type { User } from '@prisma/client'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  // ─── Google OAuth ─────────────────────────────────────────────────────────

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // Passport redirects to Google automatically — no body needed
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    return this.handleOAuthCallback(req.user as User, res)
  }

  // ─── Facebook OAuth ───────────────────────────────────────────────────────

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  facebookAuth() {
    // Passport redirects to Facebook automatically — no body needed
  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookCallback(@Req() req: Request, @Res() res: Response) {
    return this.handleOAuthCallback(req.user as User, res)
  }

  // ─── Shared ───────────────────────────────────────────────────────────────

  private async handleOAuthCallback(user: User, res: Response) {
    const frontendUrl = this.configService.get<string>('app.frontendUrl', 'http://localhost:3000')
    const { accessToken, refreshToken } = await this.authService.login(user)

    // Redirect to frontend with tokens as query params.
    // The frontend SPA stores them (httpOnly cookie preferred — wired via Apollo Link).
    const redirectUrl = new URL('/auth/callback', frontendUrl)
    redirectUrl.searchParams.set('accessToken', accessToken)
    redirectUrl.searchParams.set('refreshToken', refreshToken)

    return res.redirect(redirectUrl.toString())
  }
}
