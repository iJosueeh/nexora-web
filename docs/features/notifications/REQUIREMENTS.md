# Requerimientos: Notificaciones en Vivo (WebSocket)

## 1. Visión General

Sistema de notificaciones en tiempo real vía WebSocket que alerta a los estudiantes sobre interacciones sociales (likes, comentarios, seguidores) sin necesidad de recargar la pantalla.

---

## 2. Requerimientos Funcionales

| ID | Requerimiento | Prioridad | Estimación |
|----|--------------|-----------|------------|
| RF-NOT-01 | El sistema debe establecer conexión WebSocket al autenticarse | Alta | 8 pts |
| RF-NOT-02 | El sistema debe notificar en vivo cuando alguien da like a una publicación | Alta | 5 pts |
| RF-NOT-03 | El sistema debe notificar en vivo cuando alguien comenta una publicación | Alta | 5 pts |
| RF-NOT-04 | El sistema debe notificar en vivo cuando alguien sigue al usuario | Alta | 5 pts |
| RF-NOT-05 | El sistema debe notificar en vivo cuando alguien responde a un comentario | Alta | 5 pts |
| RF-NOT-06 | El sistema debe mostrar un badge con el contador de no leídas | Alta | 5 pts |
| RF-NOT-07 | El sistema debe permitir marcar notificaciones como leídas (individual/todas) | Alta | 5 pts |
| RF-NOT-08 | El sistema debe agrupar notificaciones similares (ej: "A 3 personas les gustó") | Media | 8 pts |
| RF-NOT-09 | El sistema debe exponer centro de notificaciones con historial paginado | Alta | 8 pts |
| RF-NOT-10 | El sistema debe reconectar automáticamente al perder conexión | Alta | 5 pts |
| RF-NOT-11 | El sistema debe cerrar conexión WS al cerrar sesión | Alta | 3 pts |

**Total estimado:** 62 pts

---

## 3. Requerimientos No Funcionales

| ID | Requerimiento | Tipo | Métrica |
|----|--------------|------|---------|
| RNF-NOT-01 | Latencia de entrega WS < 1s (p95) | Rendimiento | 1s |
| RNF-NOT-02 | Reconexión con backoff exponencial (3s, 6s, 12s, max 30s) | Confiabilidad | — |
| RNF-NOT-03 | Heartbeat cada 30s para mantener sesión | Confiabilidad | 30s |
| RNF-NOT-04 | Badge actualizado en < 2s desde el evento | UX | 2s |
| RNF-NOT-05 | Conexión WS autenticada con JWT | Seguridad | — |
| RNF-NOT-06 | No notificar auto-interacciones (el autor no se notifica a sí mismo) | UX | — |

---

## 4. Historias de Usuario

**HU-NOT-01:** Como estudiante, quiero recibir una alerta cuando alguien le da like a mi publicación.
**HU-NOT-02:** Como estudiante, quiero saber al instante cuando alguien comenta mi publicación.
**HU-NOT-03:** Como estudiante, quiero ver un contador de notificaciones no leídas en el navbar.
**HU-NOT-04:** Como estudiante, quiero marcar todas las notificaciones como leídas de un solo clic.
**HU-NOT-05:** Como estudiante, quiero que las notificaciones se agrupen para no saturarme.

---

## 5. Reglas de Negocio

| ID | Regla | Descripción |
|----|-------|-------------|
| RN-NOT-01 | Auto-exclusión | El autor no recibe notificación de su propia acción |
| RN-NOT-02 | Agrupación | Notificaciones del mismo tipo y target en 5 min se agrupan |
| RN-NOT-03 | Tipos soportados | LIKE, COMMENT, REPLY, FOLLOW, MENTION |
| RN-NOT-04 | Retención | Notificaciones se eliminan físicamente después de 90 días |
| RN-NOT-05 | Canal personal | Cada usuario recibe eventos en `/topic/notifications/{userId}` |

---

## 6. Casos de Uso

### CU-NOT-01: Like notification flow
1. Usuario A da like a publicación del Usuario B
2. Servicio `LikeService` dispara evento `NotificationEvent`
3. `NotificationService` persiste notificación para Usuario B
4. WebSocket envía payload a `/topic/notifications/{B.id}`
5. Frontend de B actualiza badge y muestra toast

### CU-NOT-02: Reconexión automática
1. Cliente pierde conexión WS (cierre de red)
2. Cliente espera 3s, intenta reconectar
3. Si falla, espera 6s, reintenta
4. Máximo 5 reintentos con backoff exponencial hasta 30s
5. Al reconectar, solicita notificaciones perdidas

---

## 7. Criterios de Aceptación

### CA-NOT-01: Notificación en tiempo real
```
Given Usuario A y Usuario B autenticados con WS conectado
When Usuario A da like a una publicación de Usuario B
Then Usuario B recibe el payload vía WS en < 1s
And el badge de notificaciones de B se incrementa
```

### CA-NOT-02: Auto-exclusión
```
Given Usuario A autenticado
When Usuario A da like a su propia publicación
Then NO se genera notificación
And NO se incrementa el badge
```

### CA-NOT-03: Agrupación
```
Given 3 usuarios dan like a la misma publicación en 3 minutos
When se generan las notificaciones
Then se agrupan en una sola: "A 3 personas les gustó tu publicación"
```

---

## 8. Dependencias

| Dependencia | Módulo |
|-------------|--------|
| `WebSocketService` (frontend) | Core |
| `STOMP.js` / SockJS (frontend) | Librería |
| `spring-websocket` (backend) | Librería |
| `NotificationService` | Backend |
| `AuthSession` | Core |

---

## 9. Priorización

### MVP
RF-NOT-01, RF-NOT-02, RF-NOT-03, RF-NOT-06, RF-NOT-07, RF-NOT-09, RF-NOT-10, RF-NOT-11

### Fase 2
RF-NOT-04, RF-NOT-05, RF-NOT-08

---

## 10. TODOs

| ID | Tarea | Prioridad | Esfuerzo |
|----|-------|-----------|----------|
| TODO-NOT-01 | Implementar servicio WebSocket con reconexión automática | Alta | 10h |
| TODO-NOT-02 | Sistema de agrupación de notificaciones (ventana 5 min) | Media | 8h |
| TODO-NOT-03 | Preferencias de notificación (qué tipos recibir) | Media | 6h |
| TODO-NOT-04 | Notificaciones push nativas (Service Worker) | Baja | 15h |
| TODO-NOT-05 | Cola de eventos offline con replay al reconectar | Media | 8h |
| TODO-NOT-06 | Página de preferencias de notificación en settings | Media | 5h |
| TODO-NOT-07 | Tests de integración: flujo WS like→notificación | Alta | 8h |
| TODO-NOT-08 | Heartbeat y healthcheck de conexión WS (frontend) | Alta | 4h |
| TODO-NOT-09 | Limpieza programada de notificaciones > 90 días | Media | 3h |
| TODO-NOT-10 | Toast animado para nuevas notificaciones | Media | 4h |
