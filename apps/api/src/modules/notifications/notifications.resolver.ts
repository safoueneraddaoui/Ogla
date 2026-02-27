import { Query, Resolver } from '@nestjs/graphql'
import { NotificationsService } from './notifications.service'

// TODO: Add Notification ObjectType and Subscription for real-time notifications
@Resolver()
export class NotificationsResolver {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Query(() => String)
  notificationsHealth(): string {
    return 'ok'
  }
}
