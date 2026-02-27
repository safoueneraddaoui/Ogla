import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { Role } from '@ogla/shared-types'
import { AdminService } from './admin.service'
import {
  AdminUserObjectType,
  DashboardStatsType,
} from './entities/admin.entity'

@Resolver()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
export class AdminResolver {
  constructor(private readonly adminService: AdminService) {}

  // ── Queries ──────────────────────────────────────────────────────────────

  @Query(() => DashboardStatsType)
  async adminDashboardStats(): Promise<DashboardStatsType> {
    return this.adminService.getDashboardStats() as unknown as Promise<DashboardStatsType>
  }

  @Query(() => [AdminUserObjectType])
  async adminUsers(
    @Args('role', { nullable: true, type: () => Role }) role?: Role,
    @Args('search', { nullable: true }) search?: string,
  ): Promise<AdminUserObjectType[]> {
    return this.adminService.getUsers(
      role,
      search,
    ) as unknown as Promise<AdminUserObjectType[]>
  }

  @Query(() => AdminUserObjectType)
  async adminUser(
    @Args('userId') userId: string,
  ): Promise<AdminUserObjectType> {
    return this.adminService.getUser(userId) as unknown as Promise<AdminUserObjectType>
  }

  // ── Mutations ─────────────────────────────────────────────────────────────

  @Mutation(() => Boolean)
  async adminDeleteUser(@Args('userId') userId: string): Promise<boolean> {
    return this.adminService.deleteUser(userId)
  }
}
