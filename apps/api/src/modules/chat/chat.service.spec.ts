import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { ChatService } from './chat.service'
import { PrismaService } from '../../prisma/prisma.service'
import { RedisService } from '../../common/redis/redis.service'
import { ChatRoomType } from '@ogla/shared-types'
import { SendMessageInput, CreateRoomInput } from './dto/chat.input'

const mockPrisma = {
  chatRoom: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  chatRoomParticipant: {
    upsert: jest.fn(),
    deleteMany: jest.fn(),
  },
  message: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  messageRead: {
    upsert: jest.fn(),
  },
}

const mockRedis = {
  publish: jest.fn(),
  psubscribe: jest.fn(),
  subscribe: jest.fn(),
}

const baseRoom = {
  id: 'room-1',
  type: ChatRoomType.DM,
  name: null,
  participants: [],
  messages: [],
  createdAt: new Date(),
  updatedAt: new Date(),
}

const baseMsg = {
  id: 'msg-1',
  roomId: 'room-1',
  senderId: 'user-1',
  content: 'Hello',
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('ChatService', () => {
  let service: ChatService

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
      ],
    }).compile()
    service = module.get<ChatService>(ChatService)
  })

  // ── createRoom ─────────────────────────────────────────────────────────────

  it('createRoom — creates a GROUP room with deduped participants', async () => {
    mockPrisma.chatRoom.create.mockResolvedValue(baseRoom)
    const input: CreateRoomInput = {
      type: ChatRoomType.GROUP,
      name: 'Fighters',
      participantIds: ['user-2', 'user-3'],
    }
    const result = await service.createRoom(input, 'user-1')
    expect(mockPrisma.chatRoom.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ type: ChatRoomType.GROUP }) }),
    )
    expect(result).toBe(baseRoom)
  })

  // ── createDm ───────────────────────────────────────────────────────────────

  it('createDm — returns existing DM when one already exists', async () => {
    mockPrisma.chatRoom.findFirst.mockResolvedValue(baseRoom)
    const result = await service.createDm('user-1', 'user-2')
    expect(mockPrisma.chatRoom.create).not.toHaveBeenCalled()
    expect(result).toBe(baseRoom)
  })

  it('createDm — creates a new DM when none exists', async () => {
    mockPrisma.chatRoom.findFirst.mockResolvedValue(null)
    mockPrisma.chatRoom.create.mockResolvedValue(baseRoom)
    const result = await service.createDm('user-1', 'user-2')
    expect(mockPrisma.chatRoom.create).toHaveBeenCalled()
    expect(result).toBe(baseRoom)
  })

  // ── getRoom ────────────────────────────────────────────────────────────────

  it('getRoom — throws NotFoundException when room missing', async () => {
    mockPrisma.chatRoom.findUnique.mockResolvedValue(null)
    await expect(service.getRoom('ghost')).rejects.toBeInstanceOf(NotFoundException)
  })

  // ── sendMessage ────────────────────────────────────────────────────────────

  it('sendMessage — creates message, publishes to Redis and PubSub', async () => {
    mockPrisma.chatRoom.findUnique.mockResolvedValue(baseRoom)
    mockPrisma.message.create.mockResolvedValue(baseMsg)
    mockRedis.publish.mockResolvedValue(undefined)

    const input: SendMessageInput = { roomId: 'room-1', content: 'Hello' }
    const result = await service.sendMessage(input, 'user-1')

    expect(mockPrisma.message.create).toHaveBeenCalled()
    expect(mockRedis.publish).toHaveBeenCalledWith('chat:room:room-1', expect.any(Object))
    expect(result.content).toBe('Hello')
  })

  it('sendMessage — continues when Redis publish fails', async () => {
    mockPrisma.chatRoom.findUnique.mockResolvedValue(baseRoom)
    mockPrisma.message.create.mockResolvedValue(baseMsg)
    mockRedis.publish.mockRejectedValue(new Error('Redis down'))

    const input: SendMessageInput = { roomId: 'room-1', content: 'Hello' }
    const result = await service.sendMessage(input, 'user-1')
    expect(result.content).toBe('Hello')
  })

  // ── leaveRoom ──────────────────────────────────────────────────────────────

  it('leaveRoom — deletes participant and returns true', async () => {
    mockPrisma.chatRoom.findUnique.mockResolvedValue(baseRoom)
    mockPrisma.chatRoomParticipant.deleteMany.mockResolvedValue({ count: 1 })
    const result = await service.leaveRoom('room-1', 'user-1')
    expect(result).toBe(true)
  })

  // ── markRead ───────────────────────────────────────────────────────────────

  it('markRead — upserts MessageRead and returns true', async () => {
    mockPrisma.messageRead.upsert.mockResolvedValue({})
    const result = await service.markRead('msg-1', 'user-1')
    expect(result).toBe(true)
  })
})
