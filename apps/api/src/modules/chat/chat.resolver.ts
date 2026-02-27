import { UseGuards } from '@nestjs/common'
import {
  Args,
  Mutation,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { ChatService, NEW_CHAT_MESSAGE } from './chat.service'
import {
  ChatRoomObjectType,
  MessageObjectType,
} from './entities/chat.entity'
import { CreateRoomInput, JoinRoomInput, SendMessageInput } from './dto/chat.input'

@Resolver(() => ChatRoomObjectType)
@UseGuards(JwtAuthGuard)
export class ChatResolver {
  constructor(private readonly chatService: ChatService) {}

  // ── Queries ──────────────────────────────────────────────────────────────

  @Query(() => [ChatRoomObjectType])
  async myChatRooms(
    @CurrentUser() user: { userId: string },
  ): Promise<ChatRoomObjectType[]> {
    return this.chatService.getRoomsForUser(user.userId) as unknown as Promise<
      ChatRoomObjectType[]
    >
  }

  @Query(() => [MessageObjectType])
  async chatMessages(
    @Args('roomId') roomId: string,
    @Args('limit', { nullable: true, defaultValue: 50 }) limit: number,
    @Args('cursor', { nullable: true }) cursor?: string,
  ): Promise<MessageObjectType[]> {
    return this.chatService.getMessages(
      roomId,
      limit,
      cursor,
    ) as unknown as Promise<MessageObjectType[]>
  }

  // ── Mutations ────────────────────────────────────────────────────────────

  @Mutation(() => ChatRoomObjectType)
  async createChatRoom(
    @Args('input') input: CreateRoomInput,
    @CurrentUser() user: { userId: string },
  ): Promise<ChatRoomObjectType> {
    return this.chatService.createRoom(
      input,
      user.userId,
    ) as unknown as Promise<ChatRoomObjectType>
  }

  @Mutation(() => MessageObjectType)
  async sendChatMessage(
    @Args('input') input: SendMessageInput,
    @CurrentUser() user: { userId: string },
  ): Promise<MessageObjectType> {
    return this.chatService.sendMessage(
      input,
      user.userId,
    ) as unknown as Promise<MessageObjectType>
  }

  @Mutation(() => Boolean)
  async joinChatRoom(
    @Args('input') input: JoinRoomInput,
    @CurrentUser() user: { userId: string },
  ): Promise<boolean> {
    await this.chatService.joinRoom(input.roomId, user.userId)
    return true
  }

  @Mutation(() => Boolean)
  async leaveChatRoom(
    @Args('roomId') roomId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<boolean> {
    return this.chatService.leaveRoom(roomId, user.userId)
  }

  @Mutation(() => Boolean)
  async markMessageRead(
    @Args('messageId') messageId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<boolean> {
    return this.chatService.markRead(messageId, user.userId)
  }

  // ── Subscription ─────────────────────────────────────────────────────────

  @Subscription(() => MessageObjectType, {
    filter: (
      payload: { newChatMessage: MessageObjectType },
      variables: { roomId: string },
    ) => payload.newChatMessage.roomId === variables.roomId,
  })
  newChatMessage(
    @Args('roomId') _roomId: string,
  ): AsyncIterator<MessageObjectType> {
    return this.chatService.pubSub.asyncIterator(NEW_CHAT_MESSAGE)
  }
}
