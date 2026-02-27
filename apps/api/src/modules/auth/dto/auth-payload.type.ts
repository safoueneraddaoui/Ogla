import { Field, ObjectType } from '@nestjs/graphql'
import { UserType } from '../../users/entities/user.entity'

@ObjectType()
export class AuthPayload {
  @Field()
  accessToken: string

  @Field()
  refreshToken: string

  @Field(() => UserType)
  user: UserType
}
