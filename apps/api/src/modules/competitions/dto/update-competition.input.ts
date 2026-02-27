import { Field, InputType, PartialType } from '@nestjs/graphql'
import { IsString } from 'class-validator'
import { CreateCompetitionInput } from './create-competition.input'

@InputType()
export class UpdateCompetitionInput extends PartialType(CreateCompetitionInput) {
  @Field()
  @IsString()
  id!: string
}
