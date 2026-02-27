import { Query, Resolver } from '@nestjs/graphql'
import { CompetitionsService } from './competitions.service'

// TODO: Define Competition ObjectType and SuperAdmin mutations
@Resolver()
export class CompetitionsResolver {
  constructor(private readonly competitionsService: CompetitionsService) {}

  @Query(() => String)
  competitionsHealth(): string {
    return 'ok'
  }
}
