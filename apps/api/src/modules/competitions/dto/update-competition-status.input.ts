import { Field, InputType } from '@nestjs/graphql'
import { CompetitionStatus } from '@ogla/shared-types'
import { IsEnum, IsString } from 'class-validator'

@InputType()
export class UpdateCompetitionStatusInput {
  @Field()
  @IsString()
  id!: string

  @Field(() => CompetitionStatus)
  @IsEnum(CompetitionStatus)
  status!: CompetitionStatus
}
