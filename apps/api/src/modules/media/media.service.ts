import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary'
import { Readable } from 'stream'
import { UploadFolder } from './entities/media.entity'

export interface SignedUploadParams {
  cloudName: string
  apiKey: string
  signature: string
  timestamp: number
  folder: string
  publicId?: string
  uploadUrl: string
}

export interface UploadInfo {
  publicId: string
  secureUrl: string
  resourceType: string
  format: string
  bytes: number
  width: number
  height: number
  createdAt: string
}

export interface DeleteResult {
  publicId: string
  result: string
}

@Injectable()
export class MediaService {
  private readonly cloudName: string
  private readonly apiKey: string
  private readonly apiSecret: string

  constructor(private readonly configService: ConfigService) {
    this.cloudName = this.configService.get<string>('cloudinary.cloudName') ?? ''
    this.apiKey = this.configService.get<string>('cloudinary.apiKey') ?? ''
    this.apiSecret = this.configService.get<string>('cloudinary.apiSecret') ?? ''

    cloudinary.config({
      cloud_name: this.cloudName,
      api_key: this.apiKey,
      api_secret: this.apiSecret,
    })
  }

  /**
   * Generate signed upload parameters for direct-to-Cloudinary uploads.
   * The client POSTs these params to `https://api.cloudinary.com/v1_1/{cloudName}/auto/upload`
   * together with the file — NestJS never proxies binary data.
   */
  generateSignedUploadUrl(
    folder: UploadFolder,
    publicId?: string,
  ): SignedUploadParams {
    const timestamp = Math.round(Date.now() / 1000)
    const paramsToSign: Record<string, unknown> = { timestamp, folder }
    if (publicId) paramsToSign['public_id'] = publicId

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign as Parameters<typeof cloudinary.utils.api_sign_request>[0],
      this.apiSecret,
    )

    return {
      cloudName: this.cloudName,
      apiKey: this.apiKey,
      signature,
      timestamp,
      folder,
      publicId,
      uploadUrl: `https://api.cloudinary.com/v1_1/${this.cloudName}/auto/upload`,
    }
  }

  /**
   * Fetch metadata for an already-uploaded asset.
   * Useful for the client to confirm an upload succeeded.
   */
  async getUploadInfo(publicId: string): Promise<UploadInfo> {
    try {
      const result = await cloudinary.api.resource(publicId, {
        resource_type: 'auto',
      })
      return {
        publicId: result.public_id as string,
        secureUrl: result.secure_url as string,
        resourceType: result.resource_type as string,
        format: result.format as string,
        bytes: result.bytes as number,
        width: (result.width ?? 0) as number,
        height: (result.height ?? 0) as number,
        createdAt: result.created_at as string,
      }
    } catch {
      throw new NotFoundException(`Asset '${publicId}' not found on Cloudinary`)
    }
  }

  /**
   * Delete an asset from Cloudinary.
   */
  async deleteFile(publicId: string): Promise<DeleteResult> {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
    })
    return { publicId, result: result.result as string }
  }

  /**
   * Server-side stream upload (used internally, e.g., seeding or migrations).
   */
  async uploadStream(
    buffer: Buffer,
    folder: string,
    publicId?: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, public_id: publicId, resource_type: 'auto' },
        (err, result) => {
          if (err ?? !result)
            reject(new InternalServerErrorException('Upload failed'))
          else resolve(result!)
        },
      )
      Readable.from(buffer).pipe(uploadStream)
    })
  }
}
