import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { CompetitionStatus, CompetitionEntryStatus } from '@ogla/shared-types'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateCompetitionInput } from './dto/create-competition.input'
import { UpdateCompetitionInput } from './dto/update-competition.input'
import { UpdateCompetitionStatusInput } from './dto/update-competition-status.input'
import { RegisterEntryInput } from './dto/register-entry.input'
import { UpdateEntryStatusInput } from './dto/update-entry-status.input'
import { CreateMatchInput } from './dto/create-match.input'
import { UpdateMatchInput } from './dto/update-match.input'

const COMPETITION_INCLUDE = { createdBy: true, entries: false, matches: false }
const ENTRY_INCLUDE = { athlete: true, competition: true }
const MATCH_INCLUDE = { athleteRed: true, athleteBlue: true, winner: true, competition: false }

@Injectable()
export class CompetitionsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Competitions ────────────────────────────────────────────────────────────

  async createCompetition(input: CreateCompetitionInput, createdById: string) {
    return this.prisma.competition.create({
      data: {
        name: input.name,
        description: input.description,
        discipline: input.discipline,
        location: input.location,
        startDate: new Date(input.startDate),
        endDate: input.endDate ? new Date(input.endDate) : undefined,
        maxParticipants: input.maxParticipants,
        createdById,
      },
      include: COMPETITION_INCLUDE,
    })
  }

  async updateCompetition(input: UpdateCompetitionInput) {
    await this.findById(input.id)
    return this.prisma.competition.update({
      where: { id: input.id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.discipline !== undefined && { discipline: input.discipline }),
        ...(input.location !== undefined && { location: input.location }),
        ...(input.startDate !== undefined && { startDate: new Date(input.startDate) }),
        ...(input.endDate !== undefined && { endDate: new Date(input.endDate) }),
        ...(input.maxParticipants !== undefined && { maxParticipants: input.maxParticipants }),
      },
      include: COMPETITION_INCLUDE,
    })
  }

  async updateCompetitionStatus(input: UpdateCompetitionStatusInput) {
    await this.findById(input.id)
    return this.prisma.competition.update({
      where: { id: input.id },
      data: { status: input.status },
      include: COMPETITION_INCLUDE,
    })
  }

  async deleteCompetition(id: string) {
    const competition = await this.findById(id)
    if (competition.status !== CompetitionStatus.DRAFT) {
      throw new ConflictException('Only DRAFT competitions can be deleted')
    }
    return this.prisma.competition.delete({ where: { id }, include: COMPETITION_INCLUDE })
  }

  async findAll(status?: CompetitionStatus) {
    return this.prisma.competition.findMany({
      where: status ? { status } : undefined,
      include: COMPETITION_INCLUDE,
      orderBy: { startDate: 'asc' },
    })
  }

  async findById(id: string) {
    const competition = await this.prisma.competition.findUnique({
      where: { id },
      include: COMPETITION_INCLUDE,
    })
    if (!competition) throw new NotFoundException(`Competition ${id} not found`)
    return competition
  }

  // ─── Entries ─────────────────────────────────────────────────────────────────

  async registerEntry(input: RegisterEntryInput, athleteId: string) {
    const competition = await this.findById(input.competitionId)
    if (competition.status !== CompetitionStatus.OPEN) {
      throw new ConflictException('Competition is not open for registration')
    }
    const existing = await this.prisma.competitionEntry.findUnique({
      where: { competitionId_athleteId: { competitionId: input.competitionId, athleteId } },
    })
    if (existing && existing.status !== CompetitionEntryStatus.WITHDRAWN) {
      throw new ConflictException('Already registered for this competition')
    }
    if (existing) {
      return this.prisma.competitionEntry.update({
        where: { id: existing.id },
        data: { status: CompetitionEntryStatus.REGISTERED, weightClass: input.weightClass },
        include: ENTRY_INCLUDE,
      })
    }
    return this.prisma.competitionEntry.create({
      data: { competitionId: input.competitionId, athleteId, weightClass: input.weightClass },
      include: ENTRY_INCLUDE,
    })
  }

  async withdrawEntry(entryId: string, athleteId: string) {
    const entry = await this.prisma.competitionEntry.findUnique({
      where: { id: entryId },
      include: ENTRY_INCLUDE,
    })
    if (!entry) throw new NotFoundException(`Entry ${entryId} not found`)
    if (entry.athleteId !== athleteId) throw new ForbiddenException('Cannot withdraw another athlete\'s entry')
    if (entry.status === CompetitionEntryStatus.WITHDRAWN) {
      throw new ConflictException('Entry is already withdrawn')
    }
    return this.prisma.competitionEntry.update({
      where: { id: entryId },
      data: { status: CompetitionEntryStatus.WITHDRAWN },
      include: ENTRY_INCLUDE,
    })
  }

  async updateEntryStatus(input: UpdateEntryStatusInput) {
    const entry = await this.prisma.competitionEntry.findUnique({ where: { id: input.entryId } })
    if (!entry) throw new NotFoundException(`Entry ${input.entryId} not found`)
    return this.prisma.competitionEntry.update({
      where: { id: input.entryId },
      data: { status: input.status },
      include: ENTRY_INCLUDE,
    })
  }

  async findEntries(competitionId: string, status?: CompetitionEntryStatus) {
    return this.prisma.competitionEntry.findMany({
      where: { competitionId, ...(status && { status }) },
      include: ENTRY_INCLUDE,
      orderBy: { registeredAt: 'asc' },
    })
  }

  async findMyEntries(athleteId: string, status?: CompetitionEntryStatus) {
    return this.prisma.competitionEntry.findMany({
      where: { athleteId, ...(status && { status }) },
      include: ENTRY_INCLUDE,
      orderBy: { registeredAt: 'desc' },
    })
  }

  // ─── Matches ─────────────────────────────────────────────────────────────────

  async createMatch(input: CreateMatchInput) {
    await this.findById(input.competitionId)
    return this.prisma.match.create({
      data: {
        competitionId: input.competitionId,
        athleteRedId: input.athleteRedId,
        athleteBlueId: input.athleteBlueId,
        round: input.round,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
      },
      include: MATCH_INCLUDE,
    })
  }

  async updateMatch(input: UpdateMatchInput) {
    const match = await this.prisma.match.findUnique({ where: { id: input.matchId } })
    if (!match) throw new NotFoundException(`Match ${input.matchId} not found`)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {}
    if (input.status !== undefined) data.status = input.status
    if (input.score !== undefined) data.score = input.score
    if (input.winnerId !== undefined) data.winnerId = input.winnerId
    if (input.scheduledAt !== undefined) data.scheduledAt = new Date(input.scheduledAt)
    if (input.completedAt !== undefined) data.completedAt = new Date(input.completedAt)
    return this.prisma.match.update({ where: { id: input.matchId }, data, include: MATCH_INCLUDE })
  }

  async findMatches(competitionId: string) {
    return this.prisma.match.findMany({
      where: { competitionId },
      include: MATCH_INCLUDE,
      orderBy: [{ round: 'asc' }, { scheduledAt: 'asc' }],
    })
  }
}
