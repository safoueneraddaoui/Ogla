import { Field, InputType } from '@nestjs/graphql'
import { IsEnum, IsUUID } from 'class-validator'
import { Role } from '@ogla/shared-types'

@InputType()
export class ChangeRoleInput {
  @Field()
  @IsUUID()
  userId!: string

  @Field(() => Role)
  @IsEnum(Role)
  role!: Role
}
