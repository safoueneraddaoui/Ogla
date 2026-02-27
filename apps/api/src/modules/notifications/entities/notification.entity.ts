import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql'
import { NotificationType } from '@ogla/shared-types'
import { GraphQLJSON } from 'graphql-scalars'

registerEnumType(NotificationType, { name: 'NotificationType' })

@ObjectType()
export class NotificationObjectType {
  @Field(() => ID)
  id!: string

  @Field()
  userId!: string

  @Field(() => NotificationType)
  type!: NotificationType

  @Field()
  title!: string

  @Field()
  body!: string

  @Field(() => GraphQLJSON, { nullable: true })
  payload?: unknown

  @Field()
  read!: boolean

  @Field()
  createdAt!: Date
}
