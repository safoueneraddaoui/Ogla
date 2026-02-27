import { Field, InputType } from '@nestjs/graphql'
import { IsOptional, IsString } from 'class-validator'

@InputType()
export class RegisterEntryInput {
  @Field()
  @IsString()
  competitionId!: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  weightClass?: string
}
