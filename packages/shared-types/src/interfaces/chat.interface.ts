import type { ChatRoomType } from '../enums'

export interface IChatRoom {
  id: string
  type: ChatRoomType
  name?: string | null
  participantIds: string[]
  createdAt: Date
  updatedAt: Date
}

export interface IMessage {
  id: string
  roomId: string
  senderId: string
  content: string
  readByIds: string[]
  createdAt: Date
  updatedAt: Date
}
