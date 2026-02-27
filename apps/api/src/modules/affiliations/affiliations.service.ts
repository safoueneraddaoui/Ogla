import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { AffiliationStatus } from '@ogla/shared-types'
import { PrismaService } from '../../prisma/prisma.service'
import type { RequestAffiliationInput } from './dto/request-affiliation.input'
import type { ReviewAffiliationInput } from './dto/review-affiliation.input'

const INCLUDE_RELATIONS = { athlete: true, club: true } as const

@Injectable()
export class AffiliationsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Athlete actions ─────────────────────────────────────────────────────────

  async requestAffiliation(athleteId: string, input: RequestAffiliationInput) {
    const existing = await this.prisma.affiliation.findUnique({
      where: { athleteId_clubId: { athleteId, clubId: input.clubId } },
    })

    if (existing) {
      if (existing.status === AffiliationStatus.PENDING) {
        throw new ConflictException('Affiliation request is already pending')
      }
      if (existing.status === AffiliationStatus.ACTIVE) {
        throw new ConflictException('Already an active member of this club')
      }
      // LEFT or REJECTED — re-activate the request
      return this.prisma.affiliation.update({
        where: { id: existing.id },
        data: { status: AffiliationStatus.PENDING, message: input.message, reviewedAt: null },
        include: INCLUDE_RELATIONS,
      })
    }

    return this.prisma.affiliation.create({
      data: { athleteId, clubId: input.clubId, message: input.message, status: AffiliationStatus.PENDING },
      include: INCLUDE_RELATIONS,
    })
  }

  async leaveClub(affiliationId: string, athleteId: string) {
    const affiliation = await this.prisma.affiliation.findUnique({ where: { id: affiliationId } })
    if (!affiliation) throw new NotFoundException('Affiliation not found')
    if (affiliation.athleteId !== athleteId) throw new ForbiddenException('Not your affiliation')
    if (affiliation.status !== AffiliationStatus.ACTIVE) {
      throw new ConflictException('Can only leave an active affiliation')
    }
    return this.prisma.affiliation.update({
      where: { id: affiliationId },
      data: { status: AffiliationStatus.LEFT, reviewedAt: new Date() },
      include: INCLUDE_RELATIONS,
    })
  }

  // ─── Club actions ─────────────────────────────────────────────────────────────

  async reviewAffiliation(input: ReviewAffiliationInput, reviewerId: string) {
    const affiliation = await this.prisma.affiliation.findUnique({ where: { id: input.affiliationId } })
    if (!affiliation) throw new NotFoundException('Affiliation not found')
    if (affiliation.clubId !== reviewerId) throw new ForbiddenException('Not your club request')
    if (affiliation.status !== AffiliationStatus.PENDING) {
      throw new ConflictException('Can only review a pending affiliation')
    }
    return this.prisma.affiliation.update({
      where: { id: input.affiliationId },
      data: { status: input.status, reviewedAt: new Date() },
      include: INCLUDE_RELATIONS,
    })
  }

  // ─── Queries ──────────────────────────────────────────────────────────────────

  async findByAthlete(athleteId: string, status?: AffiliationStatus) {
    return this.prisma.affiliation.findMany({
      where: { athleteId, ...(status ? { status } : {}) },
      include: INCLUDE_RELATIONS,
      orderBy: { createdAt: 'desc' },
    })
  }

  async findByClub(clubId: string, status?: AffiliationStatus) {
    return this.prisma.affiliation.findMany({
      where: { clubId, ...(status ? { status } : {}) },
      include: INCLUDE_RELATIONS,
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string) {
    const affiliation = await this.prisma.affiliation.findUnique({ where: { id }, include: INCLUDE_RELATIONS })
    if (!affiliation) throw new NotFoundException('Affiliation not found')
    return affiliation
  }
}
