import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql'
import { ChatRoomType } from '@ogla/shared-types'

registerEnumType(ChatRoomType, { name: 'ChatRoomType' })

@ObjectType()
export class MessageObjectType {
  @Field(() => ID)
  id!: string

  @Field()
  roomId!: string

  @Field()
  senderId!: string

  @Field()
  content!: string

  @Field()
  createdAt!: Date

  @Field()
  updatedAt!: Date
}

@ObjectType()
export class ChatRoomParticipantObjectType {
  @Field(() => ID)
  id!: string

  @Field()
  chatRoomId!: string

  @Field()
  userId!: string

  @Field()
  joinedAt!: Date
}

@ObjectType()
export class ChatRoomObjectType {
  @Field(() => ID)
  id!: string

  @Field(() => ChatRoomType)
  type!: ChatRoomType

  @Field({ nullable: true })
  name?: string

  @Field(() => [ChatRoomParticipantObjectType])
  participants!: ChatRoomParticipantObjectType[]

  @Field(() => [MessageObjectType])
  messages!: MessageObjectType[]

  @Field()
  createdAt!: Date

  @Field()
  updatedAt!: Date
}
