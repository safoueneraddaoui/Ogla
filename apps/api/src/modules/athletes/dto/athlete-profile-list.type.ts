import { Field, Int, ObjectType } from '@nestjs/graphql'
import { AthleteProfileType } from '../entities/athlete-profile.entity'

@ObjectType()
export class AthleteProfileListType {
  @Field(() => [AthleteProfileType])
  profiles!: AthleteProfileType[]

  @Field(() => Int)
  total!: number

  @Field(() => Int)
  page!: number

  @Field(() => Int)
  limit!: number
}
