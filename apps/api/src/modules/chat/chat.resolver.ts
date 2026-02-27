import { Query, Resolver } from '@nestjs/graphql'
import { ChatService } from './chat.service'

// TODO: Add WebSocket gateway + GraphQL subscriptions for real-time messaging
@Resolver()
export class ChatResolver {
  constructor(private readonly chatService: ChatService) {}

  @Query(() => String)
  chatHealth(): string {
    return 'ok'
  }
}
