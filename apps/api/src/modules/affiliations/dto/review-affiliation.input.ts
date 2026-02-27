import { Field, InputType } from '@nestjs/graphql'
import { IsEnum, IsUUID } from 'class-validator'
import { AffiliationStatus } from '@ogla/shared-types'

@InputType()
export class ReviewAffiliationInput {
  @Field()
  @IsUUID()
  affiliationId!: string

  @Field(() => AffiliationStatus)
  @IsEnum([AffiliationStatus.ACTIVE, AffiliationStatus.REJECTED], {
    message: 'Status must be ACTIVE or REJECTED',
  })
  status!: AffiliationStatus
}
