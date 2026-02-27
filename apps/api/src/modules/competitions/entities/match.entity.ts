import { Field, GraphQLISODateTime, Int, ObjectType, registerEnumType } from '@nestjs/graphql'
import { MatchStatus } from '@ogla/shared-types'
import { GraphQLJSON } from 'graphql-scalars'
import { UserType } from '../../users/entities/user.entity'
import { CompetitionType } from './competition.entity'

registerEnumType(MatchStatus, { name: 'MatchStatus' })

@ObjectType()
export class MatchType {
  @Field()
  id!: string

  @Field()
  competitionId!: string

  @Field()
  athleteRedId!: string

  @Field()
  athleteBlueId!: string

  @Field(() => CompetitionType, { nullable: true })
  competition?: CompetitionType

  @Field(() => UserType, { nullable: true })
  athleteRed?: UserType

  @Field(() => UserType, { nullable: true })
  athleteBlue?: UserType

  @Field(() => Int)
  round!: number

  @Field(() => MatchStatus)
  status!: MatchStatus

  @Field(() => GraphQLJSON, { nullable: true })
  score?: unknown

  @Field({ nullable: true })
  winnerId?: string

  @Field(() => UserType, { nullable: true })
  winner?: UserType

  @Field(() => GraphQLISODateTime, { nullable: true })
  scheduledAt?: Date

  @Field(() => GraphQLISODateTime, { nullable: true })
  completedAt?: Date

  @Field()
  createdAt!: Date

  @Field()
  updatedAt!: Date
}
