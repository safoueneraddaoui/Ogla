import { Test, TestingModule } from '@nestjs/testing'
import { InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MediaService } from './media.service'
import { UploadFolder } from './entities/media.entity'

// Mock the entire cloudinary module
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    utils: {
      api_sign_request: jest.fn().mockReturnValue('mock_signature'),
    },
    api: {
      resource: jest.fn(),
    },
    uploader: {
      destroy: jest.fn(),
      upload_stream: jest.fn(),
    },
  },
}))

// Pull the mocked cloudinary after jest.mock is hoisted
import { v2 as cloudinary } from 'cloudinary'
const mockedCloudinary = cloudinary as jest.Mocked<typeof cloudinary>

const mockConfig = {
  get: jest.fn((key: string) => {
    const map: Record<string, string> = {
      'cloudinary.cloudName': 'test-cloud',
      'cloudinary.apiKey': 'test-key',
      'cloudinary.apiSecret': 'test-secret',
    }
    return map[key]
  }),
}

describe('MediaService', () => {
  let service: MediaService

  beforeEach(async () => {
    jest.clearAllMocks()
    ;(mockedCloudinary.utils.api_sign_request as jest.Mock).mockReturnValue(
      'mock_signature',
    )
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile()
    service = module.get<MediaService>(MediaService)
  })

  // ── generateSignedUploadUrl ──────────────────────────────────────────────────

  it('generateSignedUploadUrl — returns signed params for a folder', () => {
    const result = service.generateSignedUploadUrl(UploadFolder.AVATARS)

    expect(mockedCloudinary.utils.api_sign_request).toHaveBeenCalledWith(
      expect.objectContaining({ folder: 'avatars' }),
      'test-secret',
    )
    expect(result.cloudName).toBe('test-cloud')
    expect(result.apiKey).toBe('test-key')
    expect(result.signature).toBe('mock_signature')
    expect(result.folder).toBe('avatars')
    expect(result.uploadUrl).toContain('test-cloud')
  })

  it('generateSignedUploadUrl — includes publicId when provided', () => {
    const result = service.generateSignedUploadUrl(
      UploadFolder.CLUB_LOGOS,
      'my-logo',
    )
    expect(result.publicId).toBe('my-logo')
  })

  // ── getUploadInfo ────────────────────────────────────────────────────────────

  it('getUploadInfo — returns asset metadata', async () => {
    ;(mockedCloudinary.api.resource as jest.Mock).mockResolvedValue({
      public_id: 'avatars/abc',
      secure_url: 'https://res.cloudinary.com/test/image/upload/avatars/abc',
      resource_type: 'image',
      format: 'jpg',
      bytes: 102400,
      width: 400,
      height: 400,
      created_at: '2026-02-01T00:00:00Z',
    })

    const result = await service.getUploadInfo('avatars/abc')

    expect(result.publicId).toBe('avatars/abc')
    expect(result.secureUrl).toContain('cloudinary')
    expect(result.bytes).toBe(102400)
  })

  it('getUploadInfo — throws NotFoundException when asset missing', async () => {
    ;(mockedCloudinary.api.resource as jest.Mock).mockRejectedValue(
      new Error('Not Found'),
    )
    await expect(service.getUploadInfo('missing/id')).rejects.toBeInstanceOf(
      NotFoundException,
    )
  })

  // ── deleteFile ───────────────────────────────────────────────────────────────

  it('deleteFile — calls cloudinary destroy and returns result', async () => {
    ;(mockedCloudinary.uploader.destroy as jest.Mock).mockResolvedValue({
      result: 'ok',
    })
    const result = await service.deleteFile('avatars/abc')
    expect(mockedCloudinary.uploader.destroy).toHaveBeenCalledWith('avatars/abc', {
      resource_type: 'image',
    })
    expect(result.result).toBe('ok')
    expect(result.publicId).toBe('avatars/abc')
  })

  // ── uploadStream ─────────────────────────────────────────────────────────────

  it('uploadStream — resolves with upload response on success', async () => {
    const fakeResponse = { public_id: 'test/123', secure_url: 'https://res.cloudinary.com/test/123' }

    ;(mockedCloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
      (_opts: unknown, cb: (err: unknown, res: unknown) => void) => {
        cb(null, fakeResponse)
        return { write: jest.fn(), end: jest.fn() }
      },
    )

    const result = await service.uploadStream(Buffer.from('fake'), 'test-folder')
    expect(result).toEqual(fakeResponse)
  })

  it('uploadStream — rejects with InternalServerErrorException on error', async () => {
    ;(mockedCloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
      (_opts: unknown, cb: (err: unknown, res: unknown) => void) => {
        cb(new Error('Upload failed'), null)
        return { write: jest.fn(), end: jest.fn() }
      },
    )

    await expect(
      service.uploadStream(Buffer.from('fake'), 'test-folder'),
    ).rejects.toBeInstanceOf(InternalServerErrorException)
  })
})
