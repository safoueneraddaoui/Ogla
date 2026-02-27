import { UseGuards } from '@nestjs/common'
import {
  Args,
  Int,
  Mutation,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import {
  NotificationsService,
  NEW_NOTIFICATION,
} from './notifications.service'
import { NotificationObjectType } from './entities/notification.entity'

@Resolver(() => NotificationObjectType)
@UseGuards(JwtAuthGuard)
export class NotificationsResolver {
  constructor(private readonly notificationsService: NotificationsService) {}

  // ── Queries ──────────────────────────────────────────────────────────────

  @Query(() => [NotificationObjectType])
  async myNotifications(
    @CurrentUser() user: { userId: string },
    @Args('unreadOnly', { nullable: true, defaultValue: false })
    unreadOnly: boolean,
  ): Promise<NotificationObjectType[]> {
    return this.notificationsService.findForUser(
      user.userId,
      unreadOnly,
    ) as unknown as Promise<NotificationObjectType[]>
  }

  @Query(() => Int)
  async unreadNotificationsCount(
    @CurrentUser() user: { userId: string },
  ): Promise<number> {
    return this.notificationsService.unreadCount(user.userId)
  }

  // ── Mutations ─────────────────────────────────────────────────────────────

  @Mutation(() => NotificationObjectType)
  async markNotificationRead(
    @Args('id') id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<NotificationObjectType> {
    return this.notificationsService.markRead(
      id,
      user.userId,
    ) as unknown as Promise<NotificationObjectType>
  }

  @Mutation(() => Boolean)
  async markAllNotificationsRead(
    @CurrentUser() user: { userId: string },
  ): Promise<boolean> {
    return this.notificationsService.markAllRead(user.userId)
  }

  @Mutation(() => Boolean)
  async deleteNotification(
    @Args('id') id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<boolean> {
    return this.notificationsService.deleteNotification(id, user.userId)
  }

  // ── Subscription ──────────────────────────────────────────────────────────

  @Subscription(() => NotificationObjectType, {
    filter: (
      payload: { newNotification: NotificationObjectType },
      _variables: unknown,
      context: { req: { user: { userId: string } } },
    ) => payload.newNotification.userId === context.req.user.userId,
  })
  newNotification(): AsyncIterator<NotificationObjectType> {
    return this.notificationsService.pubSub.asyncIterator(NEW_NOTIFICATION)
  }
}
