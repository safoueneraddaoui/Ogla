import { Field, InputType, Int } from '@nestjs/graphql'
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator'

@InputType()
export class CreateCompetitionInput {
  @Field()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string

  @Field()
  @IsString()
  @MinLength(2)
  discipline!: string

  @Field()
  @IsString()
  @MinLength(2)
  location!: string

  @Field()
  @IsDateString()
  startDate!: string

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(2)
  maxParticipants?: number
}
