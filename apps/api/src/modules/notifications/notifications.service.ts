import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { NotificationType } from '@ogla/shared-types'

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, type: NotificationType, title: string, body: string, payload?: Record<string, unknown>) {
    return this.prisma.notification.create({ data: { userId, type, title, body, payload } })
  }

  async findForUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async markRead(id: string) {
    return this.prisma.notification.update({ where: { id }, data: { read: true } })
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } })
    return true
  }
}
