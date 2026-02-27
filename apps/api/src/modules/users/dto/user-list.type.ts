import { Field, Int, ObjectType } from '@nestjs/graphql'
import { UserType } from '../entities/user.entity'

@ObjectType()
export class UserListType {
  @Field(() => [UserType])
  users!: UserType[]

  @Field(() => Int)
  total!: number

  @Field(() => Int)
  page!: number

  @Field(() => Int)
  limit!: number
}
