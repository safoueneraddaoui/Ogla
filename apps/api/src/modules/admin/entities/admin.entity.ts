import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Role } from '@ogla/shared-types'

@ObjectType()
export class DashboardStatsType {
  @Field(() => Int)
  totalUsers!: number

  @Field(() => Int)
  totalAthletes!: number

  @Field(() => Int)
  totalClubs!: number

  @Field(() => Int)
  totalCompetitions!: number

  @Field(() => Int)
  totalAffiliations!: number

  @Field(() => Int)
  totalMatches!: number

  @Field(() => Int)
  totalMessages!: number
}

@ObjectType()
export class AdminUserObjectType {
  @Field()
  id!: string

  @Field()
  email!: string

  @Field()
  firstName!: string

  @Field()
  lastName!: string

  @Field(() => Role)
  role!: Role

  @Field({ nullable: true })
  avatar?: string

  @Field()
  createdAt!: Date

  @Field()
  updatedAt!: Date
}
