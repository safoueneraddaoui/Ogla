import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo'
import { ThrottlerModule } from '@nestjs/throttler'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { join } from 'path'
import configuration from './config/configuration'
import { PrismaModule } from './prisma/prisma.module'
import { JsonScalar } from './common/scalars/json.scalar'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { AthletesModule } from './modules/athletes/athletes.module'
import { ClubsModule } from './modules/clubs/clubs.module'
import { AffiliationsModule } from './modules/affiliations/affiliations.module'
import { CompetitionsModule } from './modules/competitions/competitions.module'
import { LiveScoresModule } from './modules/live-scores/live-scores.module'
import { ChatModule } from './modules/chat/chat.module'
import { NotificationsModule } from './modules/notifications/notifications.module'
import { MediaModule } from './modules/media/media.module'
import { AdminModule } from './modules/admin/admin.module'

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),

    // Domain events
    EventEmitterModule.forRoot(),

    // GraphQL
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      subscriptions: {
        'graphql-ws': true,
      },
      context: ({ req, res }: { req: Request; res: Response }) => ({ req, res }),
    }),

    // Database
    PrismaModule,

    // Feature modules
    AuthModule,
    UsersModule,
    AthletesModule,
    ClubsModule,
    AffiliationsModule,
    CompetitionsModule,
    LiveScoresModule,
    ChatModule,
    NotificationsModule,
    MediaModule,
    AdminModule,
  ],
  providers: [JsonScalar],
})
export class AppModule {}
