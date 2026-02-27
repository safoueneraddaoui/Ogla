import { Query, Resolver } from '@nestjs/graphql'
import { AdminService } from './admin.service'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { Role } from '@ogla/shared-types'

// TODO: Expand with full admin dashboard queries and mutations
@Resolver()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
export class AdminResolver {
  constructor(private readonly adminService: AdminService) {}

  @Query(() => String)
  adminHealth(): string {
    return 'ok'
  }
}
