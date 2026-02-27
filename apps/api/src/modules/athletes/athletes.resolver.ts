import { Query, Resolver } from '@nestjs/graphql'
import { AthletesService } from './athletes.service'

// TODO: Define AthleteProfile ObjectType and full CRUD mutations
@Resolver()
export class AthletesResolver {
  constructor(private readonly athletesService: AthletesService) {}

  @Query(() => String)
  athletesHealth(): string {
    return 'ok'
  }
}
