import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PrismaService } from '../../../prisma/prisma.service'
import type { IJwtPayload } from '@ogla/shared-types'

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.refreshSecret'),
    })
  }

  async validate(payload: IJwtPayload) {
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user) throw new UnauthorizedException()
    return user
  }
}
