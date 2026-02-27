import { Field, ObjectType } from '@nestjs/graphql'
import { GraphQLJSON } from 'graphql-scalars'
import { MatchStatus } from '@ogla/shared-types'

@ObjectType()
export class LiveScoreUpdateType {
  @Field()
  matchId!: string

  @Field(() => GraphQLJSON, { nullable: true, description: 'Current score payload (arbitrary JSON structure)' })
  score?: unknown

  @Field(() => String)
  status!: MatchStatus

  @Field({ nullable: true })
  winnerId?: string

  @Field()
  updatedAt!: Date
}
