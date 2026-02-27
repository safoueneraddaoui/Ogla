import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { MediaService } from './media.service'
import {
  DeleteResultType,
  SignedUploadUrlType,
  UploadFolder,
  UploadInfoType,
} from './entities/media.entity'

@Resolver()
@UseGuards(JwtAuthGuard)
export class MediaResolver {
  constructor(private readonly mediaService: MediaService) {}

  // ── Queries ──────────────────────────────────────────────────────────────

  /**
   * Generate signed upload parameters for a direct-to-Cloudinary upload.
   * The client uses these to POST the file directly to Cloudinary’s upload API.
   */
  @Query(() => SignedUploadUrlType)
  generateSignedUploadUrl(
    @Args('folder', { type: () => UploadFolder }) folder: UploadFolder,
    @Args('publicId', { nullable: true }) publicId?: string,
  ): SignedUploadUrlType {
    return this.mediaService.generateSignedUploadUrl(
      folder,
      publicId,
    ) as unknown as SignedUploadUrlType
  }

  /**
   * Verify an asset was uploaded successfully and return its metadata.
   */
  @Query(() => UploadInfoType)
  async uploadInfo(
    @Args('publicId') publicId: string,
  ): Promise<UploadInfoType> {
    return this.mediaService.getUploadInfo(
      publicId,
    ) as unknown as Promise<UploadInfoType>
  }

  // ── Mutations ────────────────────────────────────────────────────────────

  /**
   * Delete an asset from Cloudinary by its public_id.
   */
  @Mutation(() => DeleteResultType)
  async deleteMedia(
    @Args('publicId') publicId: string,
  ): Promise<DeleteResultType> {
    return this.mediaService.deleteFile(
      publicId,
    ) as unknown as Promise<DeleteResultType>
  }
}
