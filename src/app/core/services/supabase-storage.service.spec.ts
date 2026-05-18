import { TestBed } from '@angular/core/testing';
import { SupabaseStorageService, StorageBucket } from './supabase-storage.service';
import { SupabaseAuthService } from './supabase-auth.service';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  TestBed.resetTestingModule();
  vi.clearAllMocks();
});

describe('SupabaseStorageService', () => {
  let service: SupabaseStorageService;
  let supabaseAuthSpy: any;
  let mockSupabaseClient: any;

  beforeEach(() => {
    mockSupabaseClient = {
      storage: {
        from: vi.fn().mockReturnThis(),
        upload: vi.fn(),
        getPublicUrl: vi.fn(),
        remove: vi.fn()
      }
    };

    supabaseAuthSpy = {
      getClient: vi.fn().mockReturnValue(mockSupabaseClient)
    };

    TestBed.configureTestingModule({
      providers: [
        SupabaseStorageService,
        { provide: SupabaseAuthService, useValue: supabaseAuthSpy }
      ]
    });

    service = TestBed.inject(SupabaseStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('uploadFile', () => {
    const bucket: StorageBucket = 'nexora-avatars';
    const path = 'test-path.jpg';
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });

    it('should throw error if file exceeds 2MB', async () => {
      const largeFile = { size: 3 * 1024 * 1024 } as File;
      await expect(service.uploadFile(bucket, path, largeFile)).rejects.toThrow(/demasiado grande/);
    });

    it('should upload file and return public URL on success', async () => {
      mockSupabaseClient.storage.upload.mockResolvedValue({ data: { path: 'uploaded-path' }, error: null });
      mockSupabaseClient.storage.getPublicUrl.mockReturnValue({ data: { publicUrl: 'http://public-url.com' } });

      const result = await service.uploadFile(bucket, path, mockFile);

      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith(bucket);
      expect(mockSupabaseClient.storage.upload).toHaveBeenCalledWith(path, expect.any(ArrayBuffer), expect.objectContaining({
        contentType: 'image/jpeg'
      }));
      expect(result).toBe('http://public-url.com');
    });

    it('should throw error if upload fails', async () => {
      mockSupabaseClient.storage.upload.mockResolvedValue({ data: null, error: { message: 'Upload failed' } });

      await expect(service.uploadFile(bucket, path, mockFile)).rejects.toThrow('Upload failed');
    });
  });

  describe('deleteFile', () => {
    const bucket: StorageBucket = 'nexora-avatars';
    const path = 'delete-path.jpg';

    it('should call remove with correct path', async () => {
      mockSupabaseClient.storage.remove.mockResolvedValue({ data: [], error: null });

      await service.deleteFile(bucket, path);

      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith(bucket);
      expect(mockSupabaseClient.storage.remove).toHaveBeenCalledWith([path]);
    });

    it('should throw error if deletion fails', async () => {
      mockSupabaseClient.storage.remove.mockResolvedValue({ data: null, error: { message: 'Delete failed' } });

      await expect(service.deleteFile(bucket, path)).rejects.toThrow('Delete failed');
    });
  });
});
