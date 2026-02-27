import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import type { UpsertClubProfileInput } from './dto/upsert-club-profile.input'

@Injectable()
export class ClubsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const [profiles, total] = await this.prisma.$transaction([
      this.prisma.clubProfile.findMany({
        skip,
        take: limit,
        include: { user: true },
        orderBy: { name: 'asc' },
      }),
      this.prisma.clubProfile.count(),
    ])
    return { profiles, total, page, limit }
  }

  async findById(id: string) {
    const profile = await this.prisma.clubProfile.findUnique({
      where: { id },
      include: { user: true },
    })
    if (!profile) throw new NotFoundException('Club profile not found')
    return profile
  }

  async findByUserId(userId: string) {
    const profile = await this.prisma.clubProfile.findUnique({
      where: { userId },
      include: { user: true },
    })
    if (!profile) throw new NotFoundException('Club profile not found')
    return profile
  }

  async search(query: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const where: Prisma.ClubProfileWhereInput = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { address: { contains: query, mode: 'insensitive' } },
        { disciplines: { has: query } },
      ],
    }
    const [profiles, total] = await this.prisma.$transaction([
      this.prisma.clubProfile.findMany({
        where,
        skip,
        take: limit,
        include: { user: true },
        orderBy: { name: 'asc' },
      }),
      this.prisma.clubProfile.count({ where }),
    ])
    return { profiles, total, page, limit }
  }

  async upsert(userId: string, input: UpsertClubProfileInput) {
    const data = {
      name: input.name,
      description: input.description,
      address: input.address,
      logo: input.logo,
      disciplines: input.disciplines ?? [],
      foundedYear: input.foundedYear,
      website: input.website,
    }
    return this.prisma.clubProfile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
      include: { user: true },
    })
  }

  async deleteProfile(userId: string) {
    const existing = await this.prisma.clubProfile.findUnique({ where: { userId } })
    if (!existing) throw new NotFoundException('Club profile not found')
    await this.prisma.clubProfile.delete({ where: { userId } })
    return true
  }
}
