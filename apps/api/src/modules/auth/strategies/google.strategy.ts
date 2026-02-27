import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, type Profile, type VerifyCallback } from 'passport-google-oauth20'
import { AuthService } from '../auth.service'
import { AuthProvider } from '@ogla/shared-types'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('oauth.google.clientId') ?? '',
      clientSecret: configService.get<string>('oauth.google.clientSecret') ?? '',
      callbackURL: configService.get<string>('oauth.google.callbackUrl'),
      scope: ['email', 'profile'],
    })
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const { id, emails, name, photos } = profile
    const user = await this.authService.findOrCreateOAuthUser({
      email: emails?.[0]?.value ?? '',
      firstName: name?.givenName ?? '',
      lastName: name?.familyName ?? '',
      avatar: photos?.[0]?.value,
      provider: AuthProvider.GOOGLE,
      providerId: id,
    })
    done(null, user)
  }
}
