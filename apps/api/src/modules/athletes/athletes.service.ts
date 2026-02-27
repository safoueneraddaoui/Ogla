import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class AthletesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.athleteProfile.findMany({ include: { user: true } })
  }

  async findByUserId(userId: string) {
    return this.prisma.athleteProfile.findUnique({ where: { userId }, include: { user: true } })
  }

  async upsert(userId: string, data: Partial<{ beltRank: string; weightClass: string; bio: string; disciplines: string[] }>) {
    return this.prisma.athleteProfile.upsert({
      where: { userId },
      update: data,
      create: { userId, disciplines: [], ...data },
    })
  }
}
