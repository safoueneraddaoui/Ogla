import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql'
import { Role, Locale } from '@ogla/shared-types'

registerEnumType(Role, { name: 'Role' })
registerEnumType(Locale, { name: 'Locale' })

@ObjectType('User')
export class UserType {
  @Field(() => ID)
  id: string

  @Field()
  email: string

  @Field(() => Role)
  role: Role

  @Field()
  firstName: string

  @Field()
  lastName: string

  @Field({ nullable: true })
  avatar?: string

  @Field(() => Locale)
  locale: Locale

  @Field()
  createdAt: Date

  @Field()
  updatedAt: Date
}
