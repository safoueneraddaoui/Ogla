import { Field, InputType, Int } from '@nestjs/graphql'
import { IsArray, IsInt, IsOptional, IsString, IsUrl, Max, Min } from 'class-validator'

@InputType()
export class UpsertClubProfileInput {
  @Field()
  @IsString()
  name!: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  address?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  logo?: string

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  disciplines?: string[]

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1800)
  @Max(2100)
  foundedYear?: number

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  website?: string
}
