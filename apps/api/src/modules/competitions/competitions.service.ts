import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class CompetitionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.competition.findMany()
  }

  async findById(id: string) {
    return this.prisma.competition.findUnique({ where: { id } })
  }
}
