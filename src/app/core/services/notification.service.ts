import { Injectable, inject, signal, effect, NgZone } from '@angular/core';
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

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  

  private readonly notificationsSignal = signal<Notification[]>([]);
  private readonly unreadCountSignal = signal<number>(0);
  private currentChannel: any = null;

  readonly notifications = this.notificationsSignal.asReadonly();
  readonly unreadCount = this.unreadCountSignal.asReadonly();

  constructor(
    private readonly apollo: Apollo,
    private readonly supabase: SupabaseAuthService,
    private readonly authSession: AuthSession,
    private readonly toastr: ToastrService,
    private readonly ngZone: NgZone
  ) {
    effect(() => {
      const user = this.authSession.user();
      const userId = user?.id;
      
      if (userId) {
        setTimeout(() => this.initRealtime(userId), 200);
        this.loadInitialData();
      } else {
        this.cleanup();
      }
    }, { allowSignalWrites: true });
  }

  private cleanup(): void {
    if (this.currentChannel) {
      this.supabase.getClient().removeChannel(this.currentChannel);
      this.currentChannel = null;
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
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications'
      }, (payload: any) => {
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
                const type = data.type;
                const senderId = data.sender_id || data.senderId;

                if (type === 'FOLLOW') {
                  // Intentar obtener el username del sender desde la API si es posible, 
                  // o mostrar un mensaje mejorado. 
                  // Por ahora, usaremos el mensaje tipo @Username si el objeto ya viniera completo, 
                  // pero como es Realtime de tabla pura, solo tenemos el ID.
                  // Optaremos por un mensaje directo y recarga de datos.
                  this.toastr.info('¡Tienes un nuevo seguidor!', 'Nexora Social', {
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
    }).subscribe({
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
    }).subscribe({
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
    }).subscribe({
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
    }).subscribe({
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
