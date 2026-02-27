import { Field, Int, ObjectType } from '@nestjs/graphql'
import { ClubProfileType } from '../entities/club-profile.entity'

@ObjectType()
export class ClubProfileListType {
  @Field(() => [ClubProfileType])
  profiles!: ClubProfileType[]

  @Field(() => Int)
  total!: number

  @Field(() => Int)
  page!: number

  @Field(() => Int)
  limit!: number
}
