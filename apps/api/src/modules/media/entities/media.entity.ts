import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql'

export enum UploadFolder {
  AVATARS = 'avatars',
  CLUB_LOGOS = 'club-logos',
  COMPETITION_PHOTOS = 'competition-photos',
  GENERAL = 'general',
}

registerEnumType(UploadFolder, { name: 'UploadFolder' })

/**
 * Returned by generateSignedUploadUrl.
 * The client uses these params to POST directly to Cloudinary's upload API,
 * avoiding any binary data flowing through NestJS.
 *
 * Upload endpoint: POST https://api.cloudinary.com/v1_1/{cloudName}/auto/upload
 */
@ObjectType()
export class SignedUploadUrlType {
  @Field()
  cloudName!: string

  @Field()
  apiKey!: string

  @Field()
  signature!: string

  @Field(() => Int)
  timestamp!: number

  @Field()
  folder!: string

  @Field({ nullable: true })
  publicId?: string

  /** Convenience: the full upload endpoint URL */
  @Field()
  uploadUrl!: string
}

/**
 * Returned by getUploadInfo — verifies an asset was uploaded and returns metadata.
 */
@ObjectType()
export class UploadInfoType {
  @Field()
  publicId!: string

  @Field()
  secureUrl!: string

  @Field()
  resourceType!: string

  @Field()
  format!: string

  @Field(() => Int)
  bytes!: number

  @Field(() => Int)
  width!: number

  @Field(() => Int)
  height!: number

  @Field()
  createdAt!: string
}

/**
 * Returned by deleteMedia.
 */
@ObjectType()
export class DeleteResultType {
  @Field()
  publicId!: string

  @Field()
  result!: string
}
