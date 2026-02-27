import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { LiveScoresService, MATCH_SCORE_UPDATED } from './live-scores.service'
import { LiveScoreUpdateType } from './entities/live-score.entity'
import { UpdateScoreInput } from './dto/update-score.input'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { Role } from '@ogla/shared-types'

@Resolver(() => LiveScoreUpdateType)
@UseGuards(JwtAuthGuard, RolesGuard)
export class LiveScoresResolver {
  constructor(private readonly liveScoresService: LiveScoresService) {}

  // ─── Queries ──────────────────────────────────────────────────────────────────

  @Query(() => LiveScoreUpdateType, { description: 'Get the current score snapshot for a match' })
  async matchScore(@Args('matchId') matchId: string): Promise<LiveScoreUpdateType> {
    return this.liveScoresService.getMatchScore(matchId) as unknown as Promise<LiveScoreUpdateType>
  }

  // ─── Mutations ────────────────────────────────────────────────────────────────

  @Mutation(() => LiveScoreUpdateType, { description: 'SuperAdmin updates match score in real-time' })
  @Roles(Role.SUPER_ADMIN)
  async updateMatchScore(@Args('input') input: UpdateScoreInput): Promise<LiveScoreUpdateType> {
    return this.liveScoresService.updateScore(input) as unknown as Promise<LiveScoreUpdateType>
  }

  // ─── Subscriptions ────────────────────────────────────────────────────────────

  /**
   * GraphQL subscription — clients subscribe with a matchId filter and receive
   * live score payloads whenever the score is updated.
   *
   * Example (graphql-ws):
   *   subscription { matchScoreUpdated(matchId: "abc") { score status winnerId } }
   */
  @Subscription(() => LiveScoreUpdateType, {
    filter: (payload: { matchScoreUpdated: LiveScoreUpdateType }, variables: { matchId: string }) =>
      payload.matchScoreUpdated.matchId === variables.matchId,
    resolve: (payload: { matchScoreUpdated: LiveScoreUpdateType }) => payload.matchScoreUpdated,
    description: 'Subscribe to live score updates for a specific match',
  })
  matchScoreUpdated(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Args('matchId') _matchId: string,
  ) {
    return this.liveScoresService.pubSub.asyncIterator(MATCH_SCORE_UPDATED)
  }
}
