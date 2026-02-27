import { Field, ObjectType, registerEnumType } from '@nestjs/graphql'
import { CompetitionEntryStatus } from '@ogla/shared-types'
import { UserType } from '../../users/entities/user.entity'
import { CompetitionType } from './competition.entity'

registerEnumType(CompetitionEntryStatus, { name: 'CompetitionEntryStatus' })

@ObjectType()
export class CompetitionEntryType {
  @Field()
  id!: string

  @Field()
  competitionId!: string

  @Field()
  athleteId!: string

  @Field(() => CompetitionType, { nullable: true })
  competition?: CompetitionType

  @Field(() => UserType, { nullable: true })
  athlete?: UserType

  @Field(() => CompetitionEntryStatus)
  status!: CompetitionEntryStatus

  @Field({ nullable: true })
  weightClass?: string

  @Field()
  registeredAt!: Date

  @Field()
  updatedAt!: Date
}
