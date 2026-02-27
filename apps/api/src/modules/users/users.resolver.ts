import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { UsersService } from './users.service'
import { UserType } from './entities/user.entity'
import { UserListType } from './dto/user-list.type'
import { UpdateProfileInput } from './dto/update-profile.input'
import { ChangeRoleInput } from './dto/change-role.input'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Role } from '@ogla/shared-types'
import type { User } from '@prisma/client'

@Resolver(() => UserType)
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  // ─── Current user ────────────────────────────────────────────────────────────

  @Query(() => UserType, { description: 'Return the currently authenticated user' })
  async me(@CurrentUser() user: User): Promise<UserType> {
    return user as unknown as UserType
  }

  @Mutation(() => UserType, { description: 'Update firstName, lastName or avatar of the current user' })
  async updateProfile(
    @CurrentUser() user: User,
    @Args('input') input: UpdateProfileInput,
  ): Promise<UserType> {
    return this.usersService.updateProfile(user.id, input) as unknown as Promise<UserType>
  }

  @Mutation(() => Boolean, { description: 'Permanently delete the current user account' })
  async deleteAccount(@CurrentUser() user: User): Promise<boolean> {
    return this.usersService.deleteAccount(user.id)
  }

  // ─── Public profile lookup ───────────────────────────────────────────────────

  @Query(() => UserType, { description: 'Fetch any user by ID (authenticated users)' })
  async user(@Args('id') id: string): Promise<UserType> {
    return this.usersService.findById(id) as unknown as Promise<UserType>
  }

  @Query(() => UserListType, { description: 'Search users by name or email (authenticated users)' })
  async searchUsers(
    @Args('query') query: string,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
  ): Promise<UserListType> {
    return this.usersService.search(query, page, limit) as unknown as Promise<UserListType>
  }

  // ─── SuperAdmin only ─────────────────────────────────────────────────────────

  @Query(() => UserListType, { description: 'List all users — SuperAdmin only' })
  @Roles(Role.SUPER_ADMIN)
  async users(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
  ): Promise<UserListType> {
    return this.usersService.findAll(page, limit) as unknown as Promise<UserListType>
  }

  @Mutation(() => UserType, { description: 'Change a user\'s role — SuperAdmin only' })
  @Roles(Role.SUPER_ADMIN)
  async changeRole(
    @CurrentUser() requester: User,
    @Args('input') input: ChangeRoleInput,
  ): Promise<UserType> {
    return this.usersService.changeRole(input.userId, input.role, requester.id) as unknown as Promise<UserType>
  }
}
