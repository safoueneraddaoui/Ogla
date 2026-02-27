import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { AuthResolver } from './auth.resolver'
import { AuthController } from './auth.controller'
import { JwtStrategy } from './strategies/jwt.strategy'
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy'
import { LocalStrategy } from './strategies/local.strategy'
import { GoogleStrategy } from './strategies/google.strategy'
import { FacebookStrategy } from './strategies/facebook.strategy'

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret'),
        signOptions: { expiresIn: config.get<string>('jwt.expiresIn', '15m') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthResolver,
    JwtStrategy,
    JwtRefreshStrategy,
    LocalStrategy,
    GoogleStrategy,
    FacebookStrategy,
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
