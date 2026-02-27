import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PubSub } from 'graphql-subscriptions'
import { PrismaService } from '../../prisma/prisma.service'
import { RedisService } from '../../common/redis/redis.service'
import { ChatRoomType } from '@ogla/shared-types'
import { CreateRoomInput, SendMessageInput } from './dto/chat.input'
import { CHAT_CHANNEL_PREFIX } from './chat.gateway'

export const NEW_CHAT_MESSAGE = 'newChatMessage'

export interface MessagePayload {
  id: string
  roomId: string
  senderId: string
  content: string
  createdAt: Date
  updatedAt: Date
}

@Injectable()
export class ChatService {
  readonly pubSub = new PubSub()
  private readonly logger = new Logger(ChatService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async createRoom(input: CreateRoomInput, creatorId: string) {
    const participantIds = Array.from(
      new Set([creatorId, ...input.participantIds]),
    )
    return this.prisma.chatRoom.create({
      data: {
        type: input.type,
        name: input.name,
        participants: {
          create: participantIds.map((userId) => ({ userId })),
        },
      },
      include: {
        participants: true,
        messages: false,
      },
    })
  }

  async createDm(userAId: string, userBId: string) {
    // Return existing DM if both users already share one
    const existing = await this.prisma.chatRoom.findFirst({
      where: {
        type: ChatRoomType.DM,
        AND: [
          { participants: { some: { userId: userAId } } },
          { participants: { some: { userId: userBId } } },
        ],
      },
      include: { participants: true, messages: false },
    })
    if (existing) return existing

    return this.prisma.chatRoom.create({
      data: {
        type: ChatRoomType.DM,
        participants: { create: [{ userId: userAId }, { userId: userBId }] },
      },
      include: { participants: true, messages: false },
    })
  }

  async getRoomsForUser(userId: string) {
    return this.prisma.chatRoom.findMany({
      where: { participants: { some: { userId } } },
      include: {
        participants: true,
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    })
  }

  async getRoom(roomId: string) {
    const room = await this.prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: { participants: true, messages: false },
    })
    if (!room) throw new NotFoundException(`ChatRoom ${roomId} not found`)
    return room
  }

  async getMessages(
    roomId: string,
    limit = 50,
    cursor?: string,
  ) {
    return this.prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    })
  }

  async sendMessage(input: SendMessageInput, senderId: string): Promise<MessagePayload> {
    // Ensure room exists
    await this.getRoom(input.roomId)

    const msg = await this.prisma.message.create({
      data: { roomId: input.roomId, senderId, content: input.content },
    })

    const payload: MessagePayload = {
      id: msg.id,
      roomId: msg.roomId,
      senderId: msg.senderId,
      content: msg.content,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
    }

    // Redis fan-out (non-fatal)
    try {
      await this.redisService.publish(
        `${CHAT_CHANNEL_PREFIX}${input.roomId}`,
        payload,
      )
    } catch (err) {
      this.logger.warn('Redis publish failed — continuing', err)
    }

    // GraphQL subscription
    await this.pubSub.publish(NEW_CHAT_MESSAGE, { newChatMessage: payload })

    return payload
  }

  async joinRoom(roomId: string, userId: string) {
    await this.getRoom(roomId)
    return this.prisma.chatRoomParticipant.upsert({
      where: { chatRoomId_userId: { chatRoomId: roomId, userId } },
      create: { chatRoomId: roomId, userId },
      update: {},
    })
  }

  async leaveRoom(roomId: string, userId: string) {
    await this.getRoom(roomId)
    await this.prisma.chatRoomParticipant.deleteMany({
      where: { chatRoomId: roomId, userId },
    })
    return true
  }

  async markRead(messageId: string, userId: string) {
    await this.prisma.messageRead.upsert({
      where: { messageId_userId: { messageId, userId } },
      create: { messageId, userId },
      update: {},
    })
    return true
  }
}
