import { Logger } from '@nestjs/common'
import {
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { RedisService } from '../../common/redis/redis.service'

export const CHAT_CHANNEL_PREFIX = 'chat:room:'

export const WS_CHAT_EVENTS = {
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  SEND_MESSAGE: 'send_message',
  NEW_MESSAGE: 'new_message',
  ERROR: 'error',
} as const

@WebSocketGateway({ namespace: '/chat', cors: { origin: '*' } })
export class ChatGateway implements OnGatewayInit {
  @WebSocketServer()
  server!: Server

  private readonly logger = new Logger(ChatGateway.name)

  constructor(private readonly redisService: RedisService) {}

  afterInit(_server: Server): void {
    this.redisService.psubscribe(
      `${CHAT_CHANNEL_PREFIX}*`,
      (_pattern: string, channel: string, payload: unknown) => {
        const roomId = channel.replace(CHAT_CHANNEL_PREFIX, '')
        this.server.to(`room:${roomId}`).emit(WS_CHAT_EVENTS.NEW_MESSAGE, payload)
      },
    )
    this.logger.log('ChatGateway initialised — subscribed to chat:room:*')
  }

  @SubscribeMessage(WS_CHAT_EVENTS.JOIN_ROOM)
  handleJoinRoom(client: Socket, roomId: string): void {
    void client.join(`room:${roomId}`)
    this.logger.debug(`Client ${client.id} joined room:${roomId}`)
  }

  @SubscribeMessage(WS_CHAT_EVENTS.LEAVE_ROOM)
  handleLeaveRoom(client: Socket, roomId: string): void {
    void client.leave(`room:${roomId}`)
    this.logger.debug(`Client ${client.id} left room:${roomId}`)
  }
}
