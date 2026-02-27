import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { AffiliationStatus } from '@ogla/shared-types'

@Injectable()
export class AffiliationsService {
  constructor(private readonly prisma: PrismaService) {}

  async requestAffiliation(athleteId: string, clubId: string, message?: string) {
    return this.prisma.affiliation.create({ data: { athleteId, clubId, message, status: AffiliationStatus.PENDING } })
  }

  async reviewAffiliation(id: string, status: AffiliationStatus) {
    return this.prisma.affiliation.update({ where: { id }, data: { status, reviewedAt: new Date() } })
  }

  async findByAthlete(athleteId: string) {
    return this.prisma.affiliation.findMany({ where: { athleteId } })
  }

  async findByClub(clubId: string) {
    return this.prisma.affiliation.findMany({ where: { clubId } })
  }
}
