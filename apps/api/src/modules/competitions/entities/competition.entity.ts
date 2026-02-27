import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql'
import { CompetitionStatus } from '@ogla/shared-types'
import { UserType } from '../../users/entities/user.entity'

registerEnumType(CompetitionStatus, { name: 'CompetitionStatus' })

@ObjectType()
export class CompetitionType {
  @Field()
  id!: string

  @Field()
  name!: string

  @Field({ nullable: true })
  description?: string

  @Field()
  discipline!: string

  @Field()
  location!: string

  @Field()
  startDate!: Date

  @Field({ nullable: true })
  endDate?: Date

  @Field(() => CompetitionStatus)
  status!: CompetitionStatus

  @Field(() => Int, { nullable: true })
  maxParticipants?: number

  @Field()
  createdById!: string

  @Field(() => UserType, { nullable: true })
  createdBy?: UserType

  @Field()
  createdAt!: Date

  @Field()
  updatedAt!: Date
}
