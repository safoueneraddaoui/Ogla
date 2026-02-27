import { Field, GraphQLISODateTime, ID, ObjectType, registerEnumType } from '@nestjs/graphql'
import { AffiliationStatus } from '@ogla/shared-types'
import { UserType } from '../../users/entities/user.entity'

registerEnumType(AffiliationStatus, { name: 'AffiliationStatus' })

@ObjectType()
export class AffiliationType {
  @Field(() => ID)
  id!: string

  @Field()
  athleteId!: string

  @Field()
  clubId!: string

  @Field(() => UserType, { nullable: true })
  athlete?: UserType

  @Field(() => UserType, { nullable: true })
  club?: UserType

  @Field(() => AffiliationStatus)
  status!: AffiliationStatus

  @Field({ nullable: true })
  message?: string

  @Field(() => GraphQLISODateTime, { nullable: true })
  reviewedAt?: Date

  @Field(() => GraphQLISODateTime)
  createdAt!: Date

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date
}
