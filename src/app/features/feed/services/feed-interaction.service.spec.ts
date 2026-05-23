import { TestBed } from '@angular/core/testing';
import { FeedInteractionService } from './feed-interaction.service';
import { SupabaseAuthService } from '../../../core/services/supabase-auth.service';
import { NgZone } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('FeedInteractionService', () => {
  let service: FeedInteractionService;
  let supabaseSpy: any;
  let ngZoneSpy: NgZone;
  let mockChannel: any;

  beforeEach(() => {
    mockChannel = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis()
    };

    supabaseSpy = {
      getClient: vi.fn(() => ({
        auth: {
          getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: '123' } } } })
        },
        channel: vi.fn(() => mockChannel)
      }))
    };

    TestBed.configureTestingModule({
      providers: [
        FeedInteractionService,
        { provide: SupabaseAuthService, useValue: supabaseSpy }
      ]
    });

    service = TestBed.inject(FeedInteractionService);
    ngZoneSpy = TestBed.inject(NgZone);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit like update when payload is received', () => {
    let receivedUpdate: any = null;
    service.likeUpdates$.subscribe(u => receivedUpdate = u);

    // Simular llamada de Supabase Realtime
    const mockPayload = {
      eventType: 'INSERT',
      new: { post_id: 'post-123', user_id: 'user-456' }
    };

    // Obtener el callback registrado en el canal
    const onCall = mockChannel.on.mock.calls[0];
    const onCallback = onCall[2];

    // Ejecutar el callback
    ngZoneSpy.run(() => {
      onCallback(mockPayload);
    });

    expect(receivedUpdate).toEqual({
      postId: 'post-123',
      userId: 'user-456',
      action: 'INSERT'
    });
  });
});
