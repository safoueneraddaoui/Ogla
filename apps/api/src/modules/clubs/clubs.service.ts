import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class ClubsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.clubProfile.findMany({ include: { user: true } })
  }

  async findByUserId(userId: string) {
    return this.prisma.clubProfile.findUnique({ where: { userId }, include: { user: true } })
  }

  async upsert(userId: string, data: Partial<{ name: string; description: string; address: string; disciplines: string[] }>) {
    return this.prisma.clubProfile.upsert({
      where: { userId },
      update: data,
      create: { userId, name: data.name ?? '', disciplines: [], ...data },
    })
  }
}
