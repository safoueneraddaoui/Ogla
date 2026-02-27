import { Field, InputType } from '@nestjs/graphql'
import { CompetitionEntryStatus } from '@ogla/shared-types'
import { IsEnum, IsString } from 'class-validator'

@InputType()
export class UpdateEntryStatusInput {
  @Field()
  @IsString()
  entryId!: string

  @Field(() => CompetitionEntryStatus)
  @IsEnum(CompetitionEntryStatus)
  status!: CompetitionEntryStatus
}
