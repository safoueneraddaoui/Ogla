import { Field, InputType } from '@nestjs/graphql'
import { MatchStatus } from '@ogla/shared-types'
import { GraphQLJSON } from 'graphql-scalars'
import { IsEnum, IsOptional, IsString } from 'class-validator'

@InputType()
export class UpdateScoreInput {
  @Field()
  @IsString()
  matchId!: string

  @Field(() => GraphQLJSON, { nullable: true, description: 'Arbitrary score JSON (e.g. { red: 3, blue: 1 })' })
  @IsOptional()
  score?: unknown

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  winnerId?: string
}
