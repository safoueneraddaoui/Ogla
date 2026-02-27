import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { Role } from '@ogla/shared-types'
import { PrismaService } from '../../prisma/prisma.service'
import type { UpdateProfileInput } from './dto/update-profile.input'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException('User not found')
    return user
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } })
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.user.count(),
    ])
    return { users, total, page, limit }
  }

  async search(query: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const where = {
      OR: [
        { firstName: { contains: query, mode: 'insensitive' as const } },
        { lastName: { contains: query, mode: 'insensitive' as const } },
        { email: { contains: query, mode: 'insensitive' as const } },
      ],
    }
    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.user.count({ where }),
    ])
    return { users, total, page, limit }
  }

  async updateProfile(id: string, input: UpdateProfileInput) {
    return this.prisma.user.update({ where: { id }, data: input })
  }

  async changeRole(targetId: string, newRole: Role, requesterId: string) {
    if (targetId === requesterId) throw new ForbiddenException('Cannot change your own role')
    const target = await this.prisma.user.findUnique({ where: { id: targetId } })
    if (!target) throw new NotFoundException('User not found')
    return this.prisma.user.update({ where: { id: targetId }, data: { role: newRole } })
  }

  async deleteAccount(id: string) {
    await this.prisma.user.delete({ where: { id } })
    return true
  }
}
