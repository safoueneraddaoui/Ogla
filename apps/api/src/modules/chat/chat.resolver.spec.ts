import { Test, TestingModule } from '@nestjs/testing'
import { ChatResolver } from './chat.resolver'
import { ChatService } from './chat.service'
import { ChatRoomType } from '@ogla/shared-types'
import { CreateRoomInput, SendMessageInput, JoinRoomInput } from './dto/chat.input'

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

const mockService = {
  getRoomsForUser: jest.fn(),
  getMessages: jest.fn(),
  createRoom: jest.fn(),
  sendMessage: jest.fn(),
  joinRoom: jest.fn(),
  leaveRoom: jest.fn(),
  markRead: jest.fn(),
  pubSub: { asyncIterator: jest.fn() },
}

describe('ChatResolver', () => {
  let resolver: ChatResolver

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatResolver,
        { provide: ChatService, useValue: mockService },
      ],
    }).compile()
    resolver = module.get<ChatResolver>(ChatResolver)
  })

  const user = { userId: 'user-1' }

  // ── myChatRooms ─────────────────────────────────────────────────────────────

  it('myChatRooms — returns rooms for current user', async () => {
    mockService.getRoomsForUser.mockResolvedValue([baseRoom])
    const result = await resolver.myChatRooms(user)
    expect(mockService.getRoomsForUser).toHaveBeenCalledWith('user-1')
    expect(result).toEqual([baseRoom])
  })

  // ── chatMessages ────────────────────────────────────────────────────────────

  it('chatMessages — returns messages for a room', async () => {
    mockService.getMessages.mockResolvedValue([baseMsg])
    const result = await resolver.chatMessages('room-1', 50, undefined)
    expect(mockService.getMessages).toHaveBeenCalledWith('room-1', 50, undefined)
    expect(result).toEqual([baseMsg])
  })

  // ── createChatRoom ──────────────────────────────────────────────────────────

  it('createChatRoom — delegates to service with creator userId', async () => {
    mockService.createRoom.mockResolvedValue(baseRoom)
    const input: CreateRoomInput = {
      type: ChatRoomType.GROUP,
      name: 'Fighters',
      participantIds: ['user-2'],
    }
    const result = await resolver.createChatRoom(input, user)
    expect(mockService.createRoom).toHaveBeenCalledWith(input, 'user-1')
    expect(result).toEqual(baseRoom)
  })

  // ── sendChatMessage ─────────────────────────────────────────────────────────

  it('sendChatMessage — delegates to service', async () => {
    mockService.sendMessage.mockResolvedValue(baseMsg)
    const input: SendMessageInput = { roomId: 'room-1', content: 'Hello' }
    const result = await resolver.sendChatMessage(input, user)
    expect(mockService.sendMessage).toHaveBeenCalledWith(input, 'user-1')
    expect(result).toEqual(baseMsg)
  })

  // ── joinChatRoom ────────────────────────────────────────────────────────────

  it('joinChatRoom — returns true on success', async () => {
    mockService.joinRoom.mockResolvedValue({})
    const input: JoinRoomInput = { roomId: 'room-1' }
    const result = await resolver.joinChatRoom(input, user)
    expect(result).toBe(true)
  })

  // ── leaveChatRoom ───────────────────────────────────────────────────────────

  it('leaveChatRoom — returns true', async () => {
    mockService.leaveRoom.mockResolvedValue(true)
    const result = await resolver.leaveChatRoom('room-1', user)
    expect(result).toBe(true)
  })

  // ── markMessageRead ─────────────────────────────────────────────────────────

  it('markMessageRead — returns true', async () => {
    mockService.markRead.mockResolvedValue(true)
    const result = await resolver.markMessageRead('msg-1', user)
    expect(result).toBe(true)
  })

  // ── newChatMessage subscription ─────────────────────────────────────────────

  it('newChatMessage — returns pubSub asyncIterator', () => {
    const fakeIter = Symbol('iter')
    mockService.pubSub.asyncIterator.mockReturnValue(fakeIter)
    const result = resolver.newChatMessage('room-1')
    expect(mockService.pubSub.asyncIterator).toHaveBeenCalledWith('newChatMessage')
    expect(result).toBe(fakeIter)
  })
})
