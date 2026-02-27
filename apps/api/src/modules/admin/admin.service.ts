import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { Role } from '@ogla/shared-types'

export interface DashboardStats {
  totalUsers: number
  totalAthletes: number
  totalClubs: number
  totalCompetitions: number
  totalAffiliations: number
  totalMatches: number
  totalMessages: number
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(): Promise<DashboardStats> {
    const [
      totalUsers,
      totalAthletes,
      totalClubs,
      totalCompetitions,
      totalAffiliations,
      totalMatches,
      totalMessages,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.athleteProfile.count(),
      this.prisma.clubProfile.count(),
      this.prisma.competition.count(),
      this.prisma.affiliation.count(),
      this.prisma.match.count(),
      this.prisma.message.count(),
    ])
    return {
      totalUsers,
      totalAthletes,
      totalClubs,
      totalCompetitions,
      totalAffiliations,
      totalMatches,
      totalMessages,
    }
  }

  async getUsers(role?: Role, search?: string) {
    return this.prisma.user.findMany({
      where: {
        ...(role ? { role } : {}),
        ...(search
          ? {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new NotFoundException(`User ${userId} not found`)
    return user
  }

  async deleteUser(userId: string): Promise<boolean> {
    await this.getUser(userId) // throws if not found
    await this.prisma.user.delete({ where: { id: userId } })
    return true
  }

  async getCompetitions() {
    return this.prisma.competition.findMany({
      include: { _count: { select: { entries: true, matches: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }
}
