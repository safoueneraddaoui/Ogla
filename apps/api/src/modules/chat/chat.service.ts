import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { ChatRoomType } from '@ogla/shared-types'

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async createDm(userAId: string, userBId: string) {
    return this.prisma.chatRoom.create({
      data: {
        type: ChatRoomType.DM,
        participants: { create: [{ userId: userAId }, { userId: userBId }] },
      },
    })
  }

  async getRoomsForUser(userId: string) {
    return this.prisma.chatRoom.findMany({
      where: { participants: { some: { userId } } },
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
    })
  }

  async sendMessage(roomId: string, senderId: string, content: string) {
    return this.prisma.message.create({ data: { roomId, senderId, content } })
  }
}
