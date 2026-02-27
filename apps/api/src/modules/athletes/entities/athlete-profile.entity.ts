import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql'
import { GraphQLJSON } from 'graphql-scalars'
import { UserType } from '../../users/entities/user.entity'

@ObjectType()
export class AthleteProfileType {
  @Field(() => ID)
  id!: string

  @Field()
  userId!: string

  @Field(() => UserType, { nullable: true })
  user?: UserType

  @Field({ nullable: true })
  beltRank?: string

  @Field({ nullable: true })
  weightClass?: string

  @Field({ nullable: true })
  bio?: string

  @Field(() => [String])
  disciplines!: string[]

  @Field(() => GraphQLJSON, { nullable: true })
  achievements?: unknown

  @Field(() => GraphQLISODateTime, { nullable: true })
  dateOfBirth?: Date
}
