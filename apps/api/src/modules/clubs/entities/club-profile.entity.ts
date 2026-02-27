import { Field, ID, Int, ObjectType } from '@nestjs/graphql'
import { UserType } from '../../users/entities/user.entity'

@ObjectType()
export class ClubProfileType {
  @Field(() => ID)
  id!: string

  @Field()
  userId!: string

  @Field(() => UserType, { nullable: true })
  user?: UserType

  @Field()
  name!: string

  @Field({ nullable: true })
  description?: string

  @Field({ nullable: true })
  address?: string

  @Field({ nullable: true })
  logo?: string

  @Field(() => [String])
  disciplines!: string[]

  @Field(() => Int, { nullable: true })
  foundedYear?: number

  @Field({ nullable: true })
  website?: string
}
