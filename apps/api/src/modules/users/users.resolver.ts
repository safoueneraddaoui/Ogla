import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { UsersService } from './users.service'
import { UserType } from './entities/user.entity'
import { UpdateProfileInput } from './dto/update-profile.input'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import type { User } from '@prisma/client'

@Resolver(() => UserType)
@UseGuards(JwtAuthGuard)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => UserType)
  async me(@CurrentUser() user: User): Promise<User> {
    return user
  }

  @Query(() => UserType)
  async user(@Args('id') id: string): Promise<User> {
    return this.usersService.findById(id)
  }

  @Mutation(() => UserType)
  async updateProfile(
    @CurrentUser() user: User,
    @Args('input') input: UpdateProfileInput,
  ): Promise<User> {
    return this.usersService.updateProfile(user.id, input)
  }

  @Mutation(() => Boolean)
  async deleteAccount(@CurrentUser() user: User): Promise<boolean> {
    return this.usersService.deleteAccount(user.id)
  }
}
