import { Injectable, NotFoundException } from '@nestjs/common'
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

  async updateProfile(id: string, input: UpdateProfileInput) {
    return this.prisma.user.update({ where: { id }, data: input })
  }

  async deleteAccount(id: string) {
    await this.prisma.user.delete({ where: { id } })
    return true
  }
}
