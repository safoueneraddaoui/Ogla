import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PubSub } from 'graphql-subscriptions'
import { PrismaService } from '../../prisma/prisma.service'
import { RedisService } from '../../common/redis/redis.service'
import { NotificationType } from '@ogla/shared-types'

export const NEW_NOTIFICATION = 'newNotification'
export const NOTIFICATION_CHANNEL_PREFIX = 'notifications:'

@Injectable()
export class NotificationsService {
  readonly pubSub = new PubSub()
  private readonly logger = new Logger(NotificationsService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Create and dispatch a notification (DB + Redis + GraphQL PubSub).
   * Called internally by other modules (e.g., affiliations, competitions).
   */
  async notify(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    payload?: Record<string, unknown>,
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body,
        payload: payload as Prisma.InputJsonValue | undefined,
      },
    })

    // Redis fan-out (non-fatal)
    try {
      await this.redisService.publish(
        `${NOTIFICATION_CHANNEL_PREFIX}${userId}`,
        notification,
      )
    } catch (err) {
      this.logger.warn('Redis publish failed — continuing', err)
    }

    // GraphQL subscription
    await this.pubSub.publish(NEW_NOTIFICATION, {
      newNotification: notification,
    })

    return notification
  }

  async findForUser(userId: string, unreadOnly = false) {
    return this.prisma.notification.findMany({
      where: { userId, ...(unreadOnly ? { read: false } : {}) },
      orderBy: { createdAt: 'desc' },
    })
  }

  async unreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({ where: { userId, read: false } })
  }

  async markRead(id: string, userId: string) {
    const n = await this.prisma.notification.findUnique({ where: { id } })
    if (!n || n.userId !== userId)
      throw new NotFoundException(`Notification ${id} not found`)
    return this.prisma.notification.update({ where: { id }, data: { read: true } })
  }

  async markAllRead(userId: string): Promise<boolean> {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    })
    return true
  }

  async deleteNotification(id: string, userId: string): Promise<boolean> {
    const n = await this.prisma.notification.findUnique({ where: { id } })
    if (!n || n.userId !== userId)
      throw new NotFoundException(`Notification ${id} not found`)
    await this.prisma.notification.delete({ where: { id } })
    return true
  }
}
