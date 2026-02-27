import { Field, InputType } from '@nestjs/graphql'
import { ChatRoomType } from '@ogla/shared-types'

@InputType()
export class CreateRoomInput {
  @Field(() => ChatRoomType)
  type!: ChatRoomType

  @Field({ nullable: true })
  name?: string

  @Field(() => [String])
  participantIds!: string[]
}

@InputType()
export class SendMessageInput {
  @Field()
  roomId!: string

  @Field()
  content!: string
}

@InputType()
export class JoinRoomInput {
  @Field()
  roomId!: string
}
