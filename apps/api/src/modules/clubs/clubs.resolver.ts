import { Query, Resolver } from '@nestjs/graphql'
import { ClubsService } from './clubs.service'

// TODO: Define ClubProfile ObjectType and full CRUD mutations
@Resolver()
export class ClubsResolver {
  constructor(private readonly clubsService: ClubsService) {}

  @Query(() => String)
  clubsHealth(): string {
    return 'ok'
  }
}
