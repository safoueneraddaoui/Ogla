import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { AffiliationsService } from './affiliations.service'
import { AffiliationType } from './entities/affiliation.entity'
import { RequestAffiliationInput } from './dto/request-affiliation.input'
import { ReviewAffiliationInput } from './dto/review-affiliation.input'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { AffiliationStatus, Role } from '@ogla/shared-types'
import type { User } from '@prisma/client'

@Resolver(() => AffiliationType)
@UseGuards(JwtAuthGuard, RolesGuard)
export class AffiliationsResolver {
  constructor(private readonly affiliationsService: AffiliationsService) {}

  // ─── Queries ──────────────────────────────────────────────────────────────────

  @Query(() => [AffiliationType], { description: "List the current athlete's affiliations, optionally filtered by status" })
  @Roles(Role.ATHLETE, Role.SUPER_ADMIN)
  async myAffiliations(
    @CurrentUser() user: User,
    @Args('status', { type: () => AffiliationStatus, nullable: true }) status?: AffiliationStatus,
  ): Promise<AffiliationType[]> {
    return this.affiliationsService.findByAthlete(user.id, status) as unknown as Promise<AffiliationType[]>
  }

  @Query(() => [AffiliationType], { description: "List a club's affiliations, optionally filtered by status" })
  @Roles(Role.CLUB, Role.SUPER_ADMIN)
  async clubAffiliations(
    @CurrentUser() user: User,
    @Args('status', { type: () => AffiliationStatus, nullable: true }) status?: AffiliationStatus,
  ): Promise<AffiliationType[]> {
    return this.affiliationsService.findByClub(user.id, status) as unknown as Promise<AffiliationType[]>
  }

  @Query(() => [AffiliationType], { description: 'List all pending affiliation requests for the current club' })
  @Roles(Role.CLUB, Role.SUPER_ADMIN)
  async pendingAffiliations(@CurrentUser() user: User): Promise<AffiliationType[]> {
    return this.affiliationsService.findByClub(user.id, AffiliationStatus.PENDING) as unknown as Promise<AffiliationType[]>
  }

  @Query(() => AffiliationType, { description: 'Get a single affiliation by ID' })
  async affiliation(@Args('id') id: string): Promise<AffiliationType> {
    return this.affiliationsService.findOne(id) as unknown as Promise<AffiliationType>
  }

  // ─── Athlete mutations ────────────────────────────────────────────────────────

  @Mutation(() => AffiliationType, { description: 'Athlete requests to join a club' })
  @Roles(Role.ATHLETE, Role.SUPER_ADMIN)
  async requestAffiliation(
    @CurrentUser() user: User,
    @Args('input') input: RequestAffiliationInput,
  ): Promise<AffiliationType> {
    return this.affiliationsService.requestAffiliation(user.id, input) as unknown as Promise<AffiliationType>
  }

  @Mutation(() => AffiliationType, { description: 'Athlete leaves an active club affiliation' })
  @Roles(Role.ATHLETE, Role.SUPER_ADMIN)
  async leaveClub(
    @CurrentUser() user: User,
    @Args('affiliationId') affiliationId: string,
  ): Promise<AffiliationType> {
    return this.affiliationsService.leaveClub(affiliationId, user.id) as unknown as Promise<AffiliationType>
  }

  // ─── Club mutations ───────────────────────────────────────────────────────────

  @Mutation(() => AffiliationType, { description: 'Club approves or rejects a pending affiliation request' })
  @Roles(Role.CLUB, Role.SUPER_ADMIN)
  async reviewAffiliation(
    @CurrentUser() user: User,
    @Args('input') input: ReviewAffiliationInput,
  ): Promise<AffiliationType> {
    return this.affiliationsService.reviewAffiliation(input, user.id) as unknown as Promise<AffiliationType>
  }
}
