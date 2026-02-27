import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary'
import { Readable } from 'stream'

@Injectable()
export class MediaService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: configService.get<string>('cloudinary.cloudName'),
      api_key: configService.get<string>('cloudinary.apiKey'),
      api_secret: configService.get<string>('cloudinary.apiSecret'),
    })
  }

  async uploadStream(
    buffer: Buffer,
    folder: string,
    publicId?: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, public_id: publicId, resource_type: 'auto' },
        (err, result) => {
          if (err || !result) reject(new InternalServerErrorException('Upload failed'))
          else resolve(result)
        },
      )
      Readable.from(buffer).pipe(uploadStream)
    })
  }

  async deleteFile(publicId: string) {
    return cloudinary.uploader.destroy(publicId)
  }
}
