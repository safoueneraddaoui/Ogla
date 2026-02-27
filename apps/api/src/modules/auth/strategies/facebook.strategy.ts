import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, type Profile } from 'passport-facebook'
import { AuthService } from '../auth.service'
import { AuthProvider } from '@ogla/shared-types'

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('oauth.facebook.appId') ?? '',
      clientSecret: configService.get<string>('oauth.facebook.appSecret') ?? '',
      callbackURL: configService.get<string>('oauth.facebook.callbackUrl'),
      profileFields: ['id', 'emails', 'name', 'photos'],
      scope: ['email'],
    })
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (error: Error | null, user?: Express.User | false) => void,
  ) {
    const { id, emails, name, photos } = profile
    const user = await this.authService.findOrCreateOAuthUser({
      email: emails?.[0]?.value ?? '',
      firstName: name?.givenName ?? '',
      lastName: name?.familyName ?? '',
      avatar: photos?.[0]?.value,
      provider: AuthProvider.FACEBOOK,
      providerId: id,
    })
    done(null, user)
  }
}
