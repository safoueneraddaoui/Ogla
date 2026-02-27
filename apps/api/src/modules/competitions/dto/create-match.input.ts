import { Field, InputType, Int } from '@nestjs/graphql'
import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator'

@InputType()
export class CreateMatchInput {
  @Field()
  @IsString()
  competitionId!: string

  @Field()
  @IsString()
  athleteRedId!: string

  @Field()
  @IsString()
  athleteBlueId!: string

  @Field(() => Int)
  @IsInt()
  @Min(1)
  round!: number

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string
}
