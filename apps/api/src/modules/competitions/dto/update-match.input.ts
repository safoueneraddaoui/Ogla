import { Field, InputType } from '@nestjs/graphql'
import { MatchStatus } from '@ogla/shared-types'
import { GraphQLJSON } from 'graphql-scalars'
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator'

@InputType()
export class UpdateMatchInput {
  @Field()
  @IsString()
  matchId!: string

  @Field(() => MatchStatus, { nullable: true })
  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  score?: unknown

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  winnerId?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  completedAt?: string
}
