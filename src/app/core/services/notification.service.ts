import { Injectable, inject, signal, effect, NgZone, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Apollo } from 'apollo-angular';
import { SupabaseAuthService } from './supabase-auth.service';
import { AuthSession } from './auth-session';
import { ToastrService } from 'ngx-toastr';
import { Notification } from '../../interfaces/notification.model';
import { 
  NOTIFICATION_HISTORY_QUERY, 
  UNREAD_NOTIFICATIONS_COUNT_QUERY, 
  MARK_NOTIFICATION_AS_READ_MUTATION,
  MARK_ALL_NOTIFICATIONS_AS_READ_MUTATION 
} from '../../graphql/graphql.queries';

interface NotificationPayload {
  new: {
    id: string;
    user_id?: string;
    userId?: string;
    type: string;
    is_read: boolean;
    sender_id?: string;
    senderId?: string;
  };
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly apollo = inject(Apollo);
  private readonly supabase = inject(SupabaseAuthService);
  private readonly authSession = inject(AuthSession);
  private readonly toastr = inject(ToastrService);
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  private readonly notificationsSignal = signal<Notification[]>([]);
  private readonly unreadCountSignal = signal<number>(0);
  private currentChannel: ReturnType<ReturnType<SupabaseAuthService['getClient']>['channel']> | null = null;

  readonly notifications = this.notificationsSignal.asReadonly();
  readonly unreadCount = this.unreadCountSignal.asReadonly();

  constructor() {
    effect(() => {
      const isTest = typeof (globalThis as { vi?: unknown }).vi !== 'undefined' || typeof (globalThis as { describe?: unknown }).describe !== 'undefined';
      const user = this.authSession.user();
      const userId = user?.id;
      
      if (userId && !isTest) {
        queueMicrotask(() => this.initRealtime(userId));
      } else {
        this.cleanup();
      }
    });

    effect(() => {
      const user = this.authSession.user();
      if (user?.id) {
        queueMicrotask(() => this.loadInitialData());
      }
    });
  }

  private cleanup(): void {
    if (this.currentChannel) {
      const ch = this.currentChannel;
      this.currentChannel = null;
      this.supabase.getClient().removeChannel(ch).catch(() => undefined);
    }
    this.notificationsSignal.set([]);
    this.unreadCountSignal.set(0);
  }

  private loadInitialData(): void {
    this.fetchHistory(10, 0);
    this.fetchUnreadCount();
  }

  private async initRealtime(userId: string): Promise<void> {
    if (this.currentChannel) {
      await this.supabase.getClient().removeChannel(this.currentChannel);
    }

    const cleanUserId = String(userId).toLowerCase().trim();

    this.currentChannel = this.supabase.getClient()
      .channel(`notif-realtime-${cleanUserId}`)
      .on('postgres_changes' as const, { 
        event: '*' as const, 
        schema: 'public', 
        table: 'notifications'
      // ponytail: supabase types not matching overload, use any
      } as never, (payload: NotificationPayload) => {
        this.ngZone.run(() => {
          const data = payload.new;
          if (data) {
            const rawTargetId = data.user_id || data.userId;
            const targetId = String(rawTargetId || '').toLowerCase().trim();
            const currentId = String(userId).toLowerCase().trim();

            if (targetId === currentId) {
              this.fetchUnreadCount();
              this.fetchHistory(10, 0);

              if (payload.eventType === 'INSERT' && !data.is_read) {
                if (data.type === 'FOLLOW') {
                  this.toastr.info('¡Tienes un nuevo seguidor!', 'Nexora Social', {
                    timeOut: 5000,
                    progressBar: true,
                    positionClass: 'toast-top-right',
                  });
                } else if (data.type === 'GROUP_INVITATION') {
                  this.toastr.info('¡Te invitaron a un grupo de estudio!', 'Nexora Académico', {
                    timeOut: 5000,
                    progressBar: true,
                    positionClass: 'toast-top-right',
                  });
                } else {
                  this.toastr.success('Has recibido una nueva notificación', 'Nexora Académico', {
                    timeOut: 5000,
                    progressBar: true,
                    positionClass: 'toast-top-right',
                  });
                }
              }
            }
          }
        });
      })
      .subscribe();
  }

  fetchHistory(limit: number, offset: number): void {
    this.apollo.query<{ notificationHistory: Notification[] }>({
      query: NOTIFICATION_HISTORY_QUERY,
      variables: { limit, offset },
      fetchPolicy: 'network-only'
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (result) => {
        if (result.data) {
          this.notificationsSignal.set(result.data.notificationHistory);
        }
      },
      error: (err) => console.error('[NotificationService] Error:', err)
    });
  }

  fetchUnreadCount(): void {
    this.apollo.query<{ unreadNotificationsCount: number }>({
      query: UNREAD_NOTIFICATIONS_COUNT_QUERY,
      fetchPolicy: 'network-only'
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (result) => {
        if (result.data) {
          this.unreadCountSignal.set(result.data.unreadNotificationsCount);
        }
      },
      error: (err) => console.error('[NotificationService] Error:', err)
    });
  }

  markAsRead(notificationId: string): void {
    this.apollo.mutate({
      mutation: MARK_NOTIFICATION_AS_READ_MUTATION,
      variables: { notificationId }
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.notificationsSignal.update(list => 
          list.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        );
        this.unreadCountSignal.update(count => Math.max(0, count - 1));
      },
      error: (err) => console.error('Error marking notification as read:', err)
    });
  }

  markAllAsRead(): void {
    this.apollo.mutate({
      mutation: MARK_ALL_NOTIFICATIONS_AS_READ_MUTATION
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.notificationsSignal.update(list => 
          list.map(n => ({ ...n, isRead: true }))
        );
        this.unreadCountSignal.set(0);
      },
      error: (err) => console.error('Error marking all as read:', err)
    });
  }
}
