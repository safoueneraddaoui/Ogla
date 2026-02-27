import { Field, InputType } from '@nestjs/graphql'
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator'

@InputType()
export class RequestAffiliationInput {
  @Field()
  @IsUUID()
  clubId!: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string
}
