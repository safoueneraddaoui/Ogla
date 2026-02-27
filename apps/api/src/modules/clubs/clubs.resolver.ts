import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { ClubsService } from './clubs.service'
import { ClubProfileType } from './entities/club-profile.entity'
import { ClubProfileListType } from './dto/club-profile-list.type'
import { UpsertClubProfileInput } from './dto/upsert-club-profile.input'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Role } from '@ogla/shared-types'
import type { User } from '@prisma/client'

@Resolver(() => ClubProfileType)
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClubsResolver {
  constructor(private readonly clubsService: ClubsService) {}

  // ─── Discovery (any authenticated user) ─────────────────────────────────────

  @Query(() => ClubProfileListType, { description: 'Paginated list of all club profiles' })
  async clubProfiles(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
  ): Promise<ClubProfileListType> {
    return this.clubsService.findAll(page, limit) as unknown as Promise<ClubProfileListType>
  }

  @Query(() => ClubProfileType, { description: 'Get club profile by profile ID' })
  async clubProfile(@Args('id') id: string): Promise<ClubProfileType> {
    return this.clubsService.findById(id) as unknown as Promise<ClubProfileType>
  }

  @Query(() => ClubProfileType, { description: 'Get club profile by user ID' })
  async clubProfileByUserId(@Args('userId') userId: string): Promise<ClubProfileType> {
    return this.clubsService.findByUserId(userId) as unknown as Promise<ClubProfileType>
  }

  @Query(() => ClubProfileListType, { description: 'Search clubs by name, description, address or discipline' })
  async searchClubs(
    @Args('query') query: string,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
  ): Promise<ClubProfileListType> {
    return this.clubsService.search(query, page, limit) as unknown as Promise<ClubProfileListType>
  }

  // ─── Own profile management (CLUB role) ──────────────────────────────────────

  @Mutation(() => ClubProfileType, { description: 'Create or update own club profile' })
  @Roles(Role.CLUB, Role.SUPER_ADMIN)
  async upsertClubProfile(
    @CurrentUser() user: User,
    @Args('input') input: UpsertClubProfileInput,
  ): Promise<ClubProfileType> {
    return this.clubsService.upsert(user.id, input) as unknown as Promise<ClubProfileType>
  }

  @Mutation(() => Boolean, { description: 'Delete own club profile' })
  @Roles(Role.CLUB, Role.SUPER_ADMIN)
  async deleteClubProfile(@CurrentUser() user: User): Promise<boolean> {
    return this.clubsService.deleteProfile(user.id)
  }
}
