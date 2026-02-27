import { Query, Resolver } from '@nestjs/graphql'
import { AffiliationsService } from './affiliations.service'

// TODO: Define Affiliation ObjectType and full mutations
@Resolver()
export class AffiliationsResolver {
  constructor(private readonly affiliationsService: AffiliationsService) {}

  @Query(() => String)
  affiliationsHealth(): string {
    return 'ok'
  }
}
