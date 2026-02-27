import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { NotificationsService } from './notifications.service'
import { PrismaService } from '../../prisma/prisma.service'
import { RedisService } from '../../common/redis/redis.service'
import { NotificationType } from '@ogla/shared-types'

const mockPrisma = {
  notification: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
  },
}

const mockRedis = {
  publish: jest.fn(),
  psubscribe: jest.fn(),
}

const baseNotif = {
  id: 'notif-1',
  userId: 'user-1',
  type: NotificationType.SYSTEM,
  title: 'Hello',
  body: 'World',
  payload: null,
  read: false,
  createdAt: new Date(),
}

describe('NotificationsService', () => {
  let service: NotificationsService

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
      ],
    }).compile()
    service = module.get<NotificationsService>(NotificationsService)
  })

  // ── notify ──────────────────────────────────────────────────────────────────

  it('notify — creates notification, publishes to Redis and PubSub', async () => {
    mockPrisma.notification.create.mockResolvedValue(baseNotif)
    mockRedis.publish.mockResolvedValue(undefined)

    const result = await service.notify(
      'user-1',
      NotificationType.SYSTEM,
      'Hello',
      'World',
    )

    expect(mockPrisma.notification.create).toHaveBeenCalled()
    expect(mockRedis.publish).toHaveBeenCalledWith(
      'notifications:user-1',
      baseNotif,
    )
    expect(result).toBe(baseNotif)
  })

  it('notify — continues when Redis publish fails', async () => {
    mockPrisma.notification.create.mockResolvedValue(baseNotif)
    mockRedis.publish.mockRejectedValue(new Error('Redis down'))
    const result = await service.notify(
      'user-1',
      NotificationType.SYSTEM,
      'Hello',
      'World',
    )
    expect(result).toBe(baseNotif)
  })

  // ── findForUser ──────────────────────────────────────────────────────────────

  it('findForUser — returns all notifications for user', async () => {
    mockPrisma.notification.findMany.mockResolvedValue([baseNotif])
    const result = await service.findForUser('user-1')
    expect(mockPrisma.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' } }),
    )
    expect(result).toEqual([baseNotif])
  })

  it('findForUser — filters unread when unreadOnly=true', async () => {
    mockPrisma.notification.findMany.mockResolvedValue([baseNotif])
    await service.findForUser('user-1', true)
    expect(mockPrisma.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1', read: false },
      }),
    )
  })

  // ── unreadCount ──────────────────────────────────────────────────────────────

  it('unreadCount — returns count of unread notifications', async () => {
    mockPrisma.notification.count.mockResolvedValue(3)
    const result = await service.unreadCount('user-1')
    expect(result).toBe(3)
  })

  // ── markRead ─────────────────────────────────────────────────────────────────

  it('markRead — updates notification to read=true', async () => {
    mockPrisma.notification.findUnique.mockResolvedValue(baseNotif)
    mockPrisma.notification.update.mockResolvedValue({ ...baseNotif, read: true })
    const result = await service.markRead('notif-1', 'user-1')
    expect(result.read).toBe(true)
  })

  it('markRead — throws NotFoundException for wrong userId', async () => {
    mockPrisma.notification.findUnique.mockResolvedValue({ ...baseNotif, userId: 'other' })
    await expect(service.markRead('notif-1', 'user-1')).rejects.toBeInstanceOf(
      NotFoundException,
    )
  })

  // ── markAllRead ───────────────────────────────────────────────────────────────

  it('markAllRead — calls updateMany and returns true', async () => {
    mockPrisma.notification.updateMany.mockResolvedValue({ count: 5 })
    const result = await service.markAllRead('user-1')
    expect(result).toBe(true)
  })

  // ── deleteNotification ────────────────────────────────────────────────────────

  it('deleteNotification — deletes and returns true', async () => {
    mockPrisma.notification.findUnique.mockResolvedValue(baseNotif)
    mockPrisma.notification.delete.mockResolvedValue(baseNotif)
    const result = await service.deleteNotification('notif-1', 'user-1')
    expect(result).toBe(true)
  })

  it('deleteNotification — throws NotFoundException if not found', async () => {
    mockPrisma.notification.findUnique.mockResolvedValue(null)
    await expect(
      service.deleteNotification('ghost', 'user-1'),
    ).rejects.toBeInstanceOf(NotFoundException)
  })
})
