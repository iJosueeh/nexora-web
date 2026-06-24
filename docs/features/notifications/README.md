# Módulo: Notificaciones en Vivo

## 1. Objetivo del módulo

Enviar alertas instantáneas y asíncronas sobre interacciones sociales (nuevos "me gusta", seguidores, comentarios) mediante conexiones WebSocket sin recargar la pantalla.

## 2. Rutas y navegación

- `/feed/notifications` — Centro de notificaciones (protegido)
- Badge en navbar con contador de no leídas (en `MainLayout`)

## 3. Componentes

| Componente | Propósito | Signals clave |
|------------|-----------|--------------|
| `NotificationsPage` | Centro de notificaciones | `notifications`, `unreadCount`, `isLoading` |
| `NotificationItem` | Notificación individual | `notification`, `isRead`, `type` |
| `NotificationBadge` | Badge de contador no leídas | `unreadCount` |

## 4. Servicios y estado

- `WebSocketService` — Gestión de conexión WebSocket con reconexión automática
- `NotificationService` — Queries GraphQL (`myNotifications`, `markAsRead`, `markAllAsRead`)
- `AuthSession` — Provee token para autenticar WS

## 5. Contratos de datos (interfaces)

- `Notification`, `NotificationType`, `NotificationPayload` en `interfaces/notifications/`

## 6. Validaciones y reglas de negocio

- Conexión WS se establece al autenticarse, se cierra al cerrar sesión
- Tipos: `LIKE`, `COMMENT`, `FOLLOW`, `REPLY`, `MENTION`, `POST_SHARE`
- Notificaciones se marcan como leídas al hacer clic
- Reconexión automática con backoff exponencial (3s, 6s, 12s, max 30s)
- Badge se actualiza en tiempo real vía WS

## 7. Seguridad

- Solo notificaciones del usuario autenticado
- WebSocket autenticado con token JWT en query param

## 8. Errores y edge cases

- Conexión perdida → cola de eventos pendientes, replay al reconectar
- Muchas notificaciones → paginación con cursor
- Notificación de contenido eliminado → placeholder genérico

## 9. Dependencias del módulo

- `core/services/websocket-service`
- `apollo-angular`
- `shared/components/notification-badge`

## 10. TODO / Pendientes

- Agrupar notificaciones (ej: "A 3 personas les gustó tu publicación")
- Preferencias de notificación (qué tipos recibir)
- Notificaciones push nativas (Service Worker)
