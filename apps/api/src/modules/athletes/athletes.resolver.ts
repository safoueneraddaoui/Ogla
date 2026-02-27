import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { AthletesService } from './athletes.service'
import { AthleteProfileType } from './entities/athlete-profile.entity'
import { AthleteProfileListType } from './dto/athlete-profile-list.type'
import { UpsertAthleteProfileInput } from './dto/upsert-athlete-profile.input'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Role } from '@ogla/shared-types'
import type { User } from '@prisma/client'

@Resolver(() => AthleteProfileType)
@UseGuards(JwtAuthGuard, RolesGuard)
export class AthletesResolver {
  constructor(private readonly athletesService: AthletesService) {}

  // ─── Discovery (any authenticated user) ─────────────────────────────────────

  @Query(() => AthleteProfileListType, { description: 'Paginated list of all athlete profiles' })
  async athleteProfiles(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
  ): Promise<AthleteProfileListType> {
    return this.athletesService.findAll(page, limit) as unknown as Promise<AthleteProfileListType>
  }

  @Query(() => AthleteProfileType, { description: 'Get athlete profile by profile ID' })
  async athleteProfile(@Args('id') id: string): Promise<AthleteProfileType> {
    return this.athletesService.findById(id) as unknown as Promise<AthleteProfileType>
  }

  @Query(() => AthleteProfileType, { description: 'Get athlete profile by user ID' })
  async athleteProfileByUserId(@Args('userId') userId: string): Promise<AthleteProfileType> {
    return this.athletesService.findByUserId(userId) as unknown as Promise<AthleteProfileType>
  }

  @Query(() => AthleteProfileListType, { description: 'Search athletes by name, belt rank, weight class or discipline' })
  async searchAthletes(
    @Args('query') query: string,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
  ): Promise<AthleteProfileListType> {
    return this.athletesService.search(query, page, limit) as unknown as Promise<AthleteProfileListType>
  }

  // ─── Own profile management (ATHLETE role) ──────────────────────────────────

  @Mutation(() => AthleteProfileType, { description: 'Create or update own athlete profile' })
  @Roles(Role.ATHLETE, Role.SUPER_ADMIN)
  async upsertAthleteProfile(
    @CurrentUser() user: User,
    @Args('input') input: UpsertAthleteProfileInput,
  ): Promise<AthleteProfileType> {
    return this.athletesService.upsert(user.id, input) as unknown as Promise<AthleteProfileType>
  }

  @Mutation(() => Boolean, { description: 'Delete own athlete profile' })
  @Roles(Role.ATHLETE, Role.SUPER_ADMIN)
  async deleteAthleteProfile(@CurrentUser() user: User): Promise<boolean> {
    return this.athletesService.deleteProfile(user.id)
  }
}
