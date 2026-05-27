import { Injectable, inject, NgZone } from '@angular/core';
import { SupabaseAuthService } from '../../../core/services/supabase-auth.service';
import { Subject } from 'rxjs';

export interface LikeUpdate {
  postId: string;
  userId: string;
  action: 'INSERT' | 'DELETE';
}

interface LikeRealtimeData {
  post_id?: string;
  postId?: string;
  user_id?: string;
  userId?: string;
}

interface RealtimePostgresPayload {
  eventType: string;
  new: LikeRealtimeData;
  old: LikeRealtimeData;
}

@Injectable({
  providedIn: 'root'
})
export class FeedInteractionService {
  private readonly supabase = inject(SupabaseAuthService);
  private readonly ngZone = inject(NgZone);

  private readonly likeUpdatesSubject = new Subject<LikeUpdate>();
  readonly likeUpdates$ = this.likeUpdatesSubject.asObservable();

  constructor() {
    this.initRealtimeLikes();
  }

  private async initRealtimeLikes(): Promise<void> {
    const { data: { session } } = await this.supabase.getClient().auth.getSession();
    const channelId = session?.user?.id ? `likes-sh-${session.user.id.slice(0, 8)}` : 'likes-global';

    this.supabase.getClient()
      .channel(channelId)
      .on('postgres_changes' as any, { 
        event: '*', 
        schema: 'public', 
        table: 'post_likes' 
      }, (payload: RealtimePostgresPayload) => {
        this.ngZone.run(() => {
          const eventType = payload.eventType;
          const data = eventType === 'DELETE' ? payload.old : payload.new;
          
          if (data && (data.post_id || data.postId)) {
            const cleanPostId = String(data.post_id || data.postId).toLowerCase().trim();
            const userId = String(data.user_id || data.userId || '').toLowerCase().trim();
            
            this.likeUpdatesSubject.next({
              postId: cleanPostId,
              userId: userId,
              action: eventType as 'INSERT' | 'DELETE'
            });
          }
        });
      })
      .subscribe();
  }
}

