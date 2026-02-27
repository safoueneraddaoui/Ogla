import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class LiveScoresService {
  constructor(private readonly prisma: PrismaService) {}

  async getMatchScore(matchId: string) {
    return this.prisma.match.findUnique({ where: { id: matchId }, select: { score: true, status: true } })
  }

  async updateScore(matchId: string, score: Record<string, unknown>) {
    return this.prisma.match.update({ where: { id: matchId }, data: { score: score as Prisma.InputJsonValue } })
  }
}
