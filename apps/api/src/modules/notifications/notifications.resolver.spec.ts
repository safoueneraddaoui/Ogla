import { Test, TestingModule } from '@nestjs/testing'
import { NotificationsResolver } from './notifications.resolver'
import { NotificationsService } from './notifications.service'
import { NotificationType } from '@ogla/shared-types'

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

const mockService = {
  findForUser: jest.fn(),
  unreadCount: jest.fn(),
  markRead: jest.fn(),
  markAllRead: jest.fn(),
  deleteNotification: jest.fn(),
  pubSub: { asyncIterator: jest.fn() },
}

describe('NotificationsResolver', () => {
  let resolver: NotificationsResolver

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsResolver,
        { provide: NotificationsService, useValue: mockService },
      ],
    }).compile()
    resolver = module.get<NotificationsResolver>(NotificationsResolver)
  })

  const user = { userId: 'user-1' }

  // ── myNotifications ─────────────────────────────────────────────────────────

  it('myNotifications — returns all notifications', async () => {
    mockService.findForUser.mockResolvedValue([baseNotif])
    const result = await resolver.myNotifications(user, false)
    expect(mockService.findForUser).toHaveBeenCalledWith('user-1', false)
    expect(result).toEqual([baseNotif])
  })

  it('myNotifications — passes unreadOnly=true to service', async () => {
    mockService.findForUser.mockResolvedValue([baseNotif])
    await resolver.myNotifications(user, true)
    expect(mockService.findForUser).toHaveBeenCalledWith('user-1', true)
  })

  // ── unreadNotificationsCount ─────────────────────────────────────────────────

  it('unreadNotificationsCount — returns count', async () => {
    mockService.unreadCount.mockResolvedValue(4)
    const result = await resolver.unreadNotificationsCount(user)
    expect(result).toBe(4)
  })

  // ── markNotificationRead ─────────────────────────────────────────────────────

  it('markNotificationRead — delegates to service', async () => {
    mockService.markRead.mockResolvedValue({ ...baseNotif, read: true })
    const result = await resolver.markNotificationRead('notif-1', user)
    expect(mockService.markRead).toHaveBeenCalledWith('notif-1', 'user-1')
    expect(result).toMatchObject({ read: true })
  })

  // ── markAllNotificationsRead ─────────────────────────────────────────────────

  it('markAllNotificationsRead — returns true', async () => {
    mockService.markAllRead.mockResolvedValue(true)
    const result = await resolver.markAllNotificationsRead(user)
    expect(result).toBe(true)
  })

  // ── deleteNotification ───────────────────────────────────────────────────────

  it('deleteNotification — returns true', async () => {
    mockService.deleteNotification.mockResolvedValue(true)
    const result = await resolver.deleteNotification('notif-1', user)
    expect(mockService.deleteNotification).toHaveBeenCalledWith('notif-1', 'user-1')
    expect(result).toBe(true)
  })

  // ── newNotification subscription ─────────────────────────────────────────────

  it('newNotification — returns pubSub asyncIterator', () => {
    const fakeIter = Symbol('iter')
    mockService.pubSub.asyncIterator.mockReturnValue(fakeIter)
    const result = resolver.newNotification()
    expect(mockService.pubSub.asyncIterator).toHaveBeenCalledWith('newNotification')
    expect(result).toBe(fakeIter)
  })
})
