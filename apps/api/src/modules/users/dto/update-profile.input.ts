import { Field, InputType } from '@nestjs/graphql'
import { IsOptional, IsString, IsUrl } from 'class-validator'

@InputType()
export class UpdateProfileInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  firstName?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  lastName?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  avatar?: string
}
