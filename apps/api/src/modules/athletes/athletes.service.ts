import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import type { UpsertAthleteProfileInput } from './dto/upsert-athlete-profile.input'

@Injectable()
export class AthletesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const where = {}
    const [profiles, total] = await this.prisma.$transaction([
      this.prisma.athleteProfile.findMany({
        where,
        skip,
        take: limit,
        include: { user: true },
        orderBy: { user: { createdAt: 'desc' } },
      }),
      this.prisma.athleteProfile.count({ where }),
    ])
    return { profiles, total, page, limit }
  }

  async findById(id: string) {
    const profile = await this.prisma.athleteProfile.findUnique({
      where: { id },
      include: { user: true },
    })
    if (!profile) throw new NotFoundException('Athlete profile not found')
    return profile
  }

  async findByUserId(userId: string) {
    const profile = await this.prisma.athleteProfile.findUnique({
      where: { userId },
      include: { user: true },
    })
    if (!profile) throw new NotFoundException('Athlete profile not found')
    return profile
  }

  async search(query: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const where: Prisma.AthleteProfileWhereInput = {
      OR: [
        { user: { firstName: { contains: query, mode: 'insensitive' } } },
        { user: { lastName: { contains: query, mode: 'insensitive' } } },
        { beltRank: { contains: query, mode: 'insensitive' } },
        { weightClass: { contains: query, mode: 'insensitive' } },
        { disciplines: { has: query } },
      ],
    }
    const [profiles, total] = await this.prisma.$transaction([
      this.prisma.athleteProfile.findMany({
        where,
        skip,
        take: limit,
        include: { user: true },
        orderBy: { user: { createdAt: 'desc' } },
      }),
      this.prisma.athleteProfile.count({ where }),
    ])
    return { profiles, total, page, limit }
  }

  async upsert(userId: string, input: UpsertAthleteProfileInput) {
    const data = {
      beltRank: input.beltRank,
      weightClass: input.weightClass,
      bio: input.bio,
      disciplines: input.disciplines ?? [],
      achievements: input.achievements as Prisma.InputJsonValue | undefined,
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
    }
    return this.prisma.athleteProfile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
      include: { user: true },
    })
  }

  async deleteProfile(userId: string) {
    const existing = await this.prisma.athleteProfile.findUnique({ where: { userId } })
    if (!existing) throw new NotFoundException('Athlete profile not found')
    await this.prisma.athleteProfile.delete({ where: { userId } })
    return true
  }
}
