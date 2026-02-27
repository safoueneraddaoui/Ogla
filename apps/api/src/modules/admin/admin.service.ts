import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const [users, competitions, affiliations] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.competition.count(),
      this.prisma.affiliation.count(),
    ])
    return { users, competitions, affiliations }
  }

  async getAllUsers() {
    return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
  }
}
