import type { NotificationType } from '../enums'

export interface INotification {
  id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  payload?: Record<string, unknown> | null
  read: boolean
  createdAt: Date
}
