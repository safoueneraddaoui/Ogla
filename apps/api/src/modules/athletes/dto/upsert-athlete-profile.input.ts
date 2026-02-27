import { Field, GraphQLISODateTime, InputType } from '@nestjs/graphql'
import { GraphQLJSON } from 'graphql-scalars'
import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator'

@InputType()
export class UpsertAthleteProfileInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  beltRank?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  weightClass?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  bio?: string

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  disciplines?: string[]

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  achievements?: unknown

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: Date
}
