import { Query, Resolver } from '@nestjs/graphql'

// TODO: Add file upload mutation using GraphQL Upload scalar
@Resolver()
export class MediaResolver {
  @Query(() => String)
  mediaHealth(): string {
    return 'ok'
  }
}
