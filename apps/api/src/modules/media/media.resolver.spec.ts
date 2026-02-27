import { Test, TestingModule } from '@nestjs/testing'
import { MediaResolver } from './media.resolver'
import { MediaService } from './media.service'
import { UploadFolder } from './entities/media.entity'

const mockService = {
  generateSignedUploadUrl: jest.fn(),
  getUploadInfo: jest.fn(),
  deleteFile: jest.fn(),
}

const baseSignedUrl = {
  cloudName: 'test-cloud',
  apiKey: 'test-key',
  signature: 'mock_signature',
  timestamp: 1700000000,
  folder: 'avatars',
  publicId: undefined,
  uploadUrl: 'https://api.cloudinary.com/v1_1/test-cloud/auto/upload',
}

const baseUploadInfo = {
  publicId: 'avatars/abc',
  secureUrl: 'https://res.cloudinary.com/test-cloud/image/upload/avatars/abc',
  resourceType: 'image',
  format: 'jpg',
  bytes: 102400,
  width: 400,
  height: 400,
  createdAt: '2026-02-01T00:00:00Z',
}

describe('MediaResolver', () => {
  let resolver: MediaResolver

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaResolver,
        { provide: MediaService, useValue: mockService },
      ],
    }).compile()
    resolver = module.get<MediaResolver>(MediaResolver)
  })

  // ── generateSignedUploadUrl ──────────────────────────────────────────────────

  it('generateSignedUploadUrl — returns signed params from service', () => {
    mockService.generateSignedUploadUrl.mockReturnValue(baseSignedUrl)
    const result = resolver.generateSignedUploadUrl(UploadFolder.AVATARS)
    expect(mockService.generateSignedUploadUrl).toHaveBeenCalledWith(
      UploadFolder.AVATARS,
      undefined,
    )
    expect(result).toEqual(baseSignedUrl)
  })

  it('generateSignedUploadUrl — passes publicId when provided', () => {
    mockService.generateSignedUploadUrl.mockReturnValue({
      ...baseSignedUrl,
      publicId: 'my-avatar',
    })
    const result = resolver.generateSignedUploadUrl(
      UploadFolder.AVATARS,
      'my-avatar',
    )
    expect(mockService.generateSignedUploadUrl).toHaveBeenCalledWith(
      UploadFolder.AVATARS,
      'my-avatar',
    )
    expect(result).toMatchObject({ publicId: 'my-avatar' })
  })

  // ── uploadInfo ───────────────────────────────────────────────────────────────

  it('uploadInfo — delegates to service and returns metadata', async () => {
    mockService.getUploadInfo.mockResolvedValue(baseUploadInfo)
    const result = await resolver.uploadInfo('avatars/abc')
    expect(mockService.getUploadInfo).toHaveBeenCalledWith('avatars/abc')
    expect(result).toEqual(baseUploadInfo)
  })

  // ── deleteMedia ───────────────────────────────────────────────────────────────

  it('deleteMedia — calls service.deleteFile and returns result', async () => {
    mockService.deleteFile.mockResolvedValue({ publicId: 'avatars/abc', result: 'ok' })
    const result = await resolver.deleteMedia('avatars/abc')
    expect(mockService.deleteFile).toHaveBeenCalledWith('avatars/abc')
    expect(result).toMatchObject({ result: 'ok' })
  })
})
