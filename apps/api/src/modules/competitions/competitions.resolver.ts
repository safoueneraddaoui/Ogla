import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { CompetitionsService } from './competitions.service'
import { CompetitionType } from './entities/competition.entity'
import { CompetitionEntryType } from './entities/competition-entry.entity'
import { MatchType } from './entities/match.entity'
import { CreateCompetitionInput } from './dto/create-competition.input'
import { UpdateCompetitionInput } from './dto/update-competition.input'
import { UpdateCompetitionStatusInput } from './dto/update-competition-status.input'
import { RegisterEntryInput } from './dto/register-entry.input'
import { UpdateEntryStatusInput } from './dto/update-entry-status.input'
import { CreateMatchInput } from './dto/create-match.input'
import { UpdateMatchInput } from './dto/update-match.input'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { CompetitionEntryStatus, CompetitionStatus, Role } from '@ogla/shared-types'
import type { User } from '@prisma/client'

@Resolver(() => CompetitionType)
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompetitionsResolver {
  constructor(private readonly competitionsService: CompetitionsService) {}

  // ─── Queries ──────────────────────────────────────────────────────────────────

  @Query(() => [CompetitionType], { description: 'List all competitions, optionally filtered by status' })
  async competitions(
    @Args('status', { type: () => CompetitionStatus, nullable: true }) status?: CompetitionStatus,
  ): Promise<CompetitionType[]> {
    return this.competitionsService.findAll(status) as unknown as Promise<CompetitionType[]>
  }

  @Query(() => CompetitionType, { description: 'Get a competition by ID' })
  async competition(@Args('id') id: string): Promise<CompetitionType> {
    return this.competitionsService.findById(id) as unknown as Promise<CompetitionType>
  }

  @Query(() => [CompetitionEntryType], { description: 'List entries for a competition' })
  async competitionEntries(
    @Args('competitionId') competitionId: string,
    @Args('status', { type: () => CompetitionEntryStatus, nullable: true }) status?: CompetitionEntryStatus,
  ): Promise<CompetitionEntryType[]> {
    return this.competitionsService.findEntries(competitionId, status) as unknown as Promise<CompetitionEntryType[]>
  }

  @Query(() => [MatchType], { description: 'List matches for a competition' })
  async competitionMatches(@Args('competitionId') competitionId: string): Promise<MatchType[]> {
    return this.competitionsService.findMatches(competitionId) as unknown as Promise<MatchType[]>
  }

  @Query(() => [CompetitionEntryType], { description: "List the current athlete's competition entries" })
  @Roles(Role.ATHLETE, Role.SUPER_ADMIN)
  async myEntries(
    @CurrentUser() user: User,
    @Args('status', { type: () => CompetitionEntryStatus, nullable: true }) status?: CompetitionEntryStatus,
  ): Promise<CompetitionEntryType[]> {
    return this.competitionsService.findMyEntries(user.id, status) as unknown as Promise<CompetitionEntryType[]>
  }

  // ─── SuperAdmin competition mutations ─────────────────────────────────────────

  @Mutation(() => CompetitionType, { description: 'SuperAdmin creates a competition' })
  @Roles(Role.SUPER_ADMIN)
  async createCompetition(
    @CurrentUser() user: User,
    @Args('input') input: CreateCompetitionInput,
  ): Promise<CompetitionType> {
    return this.competitionsService.createCompetition(input, user.id) as unknown as Promise<CompetitionType>
  }

  @Mutation(() => CompetitionType, { description: 'SuperAdmin updates a competition' })
  @Roles(Role.SUPER_ADMIN)
  async updateCompetition(@Args('input') input: UpdateCompetitionInput): Promise<CompetitionType> {
    return this.competitionsService.updateCompetition(input) as unknown as Promise<CompetitionType>
  }

  @Mutation(() => CompetitionType, { description: 'SuperAdmin updates competition status' })
  @Roles(Role.SUPER_ADMIN)
  async updateCompetitionStatus(@Args('input') input: UpdateCompetitionStatusInput): Promise<CompetitionType> {
    return this.competitionsService.updateCompetitionStatus(input) as unknown as Promise<CompetitionType>
  }

  @Mutation(() => CompetitionType, { description: 'SuperAdmin deletes a DRAFT competition' })
  @Roles(Role.SUPER_ADMIN)
  async deleteCompetition(@Args('id') id: string): Promise<CompetitionType> {
    return this.competitionsService.deleteCompetition(id) as unknown as Promise<CompetitionType>
  }

  // ─── Athlete entry mutations ──────────────────────────────────────────────────

  @Mutation(() => CompetitionEntryType, { description: 'Athlete registers for an open competition' })
  @Roles(Role.ATHLETE, Role.SUPER_ADMIN)
  async registerForCompetition(
    @CurrentUser() user: User,
    @Args('input') input: RegisterEntryInput,
  ): Promise<CompetitionEntryType> {
    return this.competitionsService.registerEntry(input, user.id) as unknown as Promise<CompetitionEntryType>
  }

  @Mutation(() => CompetitionEntryType, { description: 'Athlete withdraws from a competition' })
  @Roles(Role.ATHLETE, Role.SUPER_ADMIN)
  async withdrawFromCompetition(
    @CurrentUser() user: User,
    @Args('entryId') entryId: string,
  ): Promise<CompetitionEntryType> {
    return this.competitionsService.withdrawEntry(entryId, user.id) as unknown as Promise<CompetitionEntryType>
  }

  @Mutation(() => CompetitionEntryType, { description: 'SuperAdmin updates an entry status (confirm/withdraw)' })
  @Roles(Role.SUPER_ADMIN)
  async updateEntryStatus(@Args('input') input: UpdateEntryStatusInput): Promise<CompetitionEntryType> {
    return this.competitionsService.updateEntryStatus(input) as unknown as Promise<CompetitionEntryType>
  }

  // ─── SuperAdmin match mutations ───────────────────────────────────────────────

  @Mutation(() => MatchType, { description: 'SuperAdmin creates a match bracket entry' })
  @Roles(Role.SUPER_ADMIN)
  async createMatch(@Args('input') input: CreateMatchInput): Promise<MatchType> {
    return this.competitionsService.createMatch(input) as unknown as Promise<MatchType>
  }

  @Mutation(() => MatchType, { description: 'SuperAdmin updates match result / status' })
  @Roles(Role.SUPER_ADMIN)
  async updateMatch(@Args('input') input: UpdateMatchInput): Promise<MatchType> {
    return this.competitionsService.updateMatch(input) as unknown as Promise<MatchType>
  }
}
