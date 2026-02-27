import { Query, Resolver } from '@nestjs/graphql'
import { LiveScoresService } from './live-scores.service'

// TODO: Add GraphQL Subscriptions for real-time score updates
@Resolver()
export class LiveScoresResolver {
  constructor(private readonly liveScoresService: LiveScoresService) {}

  @Query(() => String)
  liveScoresHealth(): string {
    return 'ok'
  }
}
