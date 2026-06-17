# Módulo: Eventos y Grupos de Estudio Temáticos

## 1. Objetivo del módulo

Herramienta que permite crear salas virtuales de estudio y agendar eventos académicos (talleres, repasos), facilitando la organización por intereses comunes.

## 2. Rutas y navegación

- `/eventos` — Calendario y lista de eventos
- `/eventos/:slug` — Detalle del evento con RSVP
- `/grupos` — Explorador de grupos de estudio
- `/grupos/:slug` — Sala virtual del grupo
- `/grupos/crear` — Crear nuevo grupo (protegido)

## 3. Componentes

| Componente | Propósito | Signals clave |
|------------|-----------|--------------|
| `EventosPage` | Calendario y lista de eventos | `events`, `selectedDate`, `viewMode` |
| `EventDetail` | Detalle con RSVP y议程 | `event`, `attendees`, `isAttending`, `isFull` |
| `GroupExplorer` | Explorador de grupos | `groups`, `filters`, `isLoading` |
| `GroupRoom` | Sala virtual del grupo | `group`, `members`, `messages`, `nextEvent` |
| `GroupCreate` | Formulario de creación | `formData`, `isSubmitting` |
| `RSVPButton` | Botón de confirmación asistencia | `isAttending`, `count`, `isFull` |

## 4. Servicios y estado

- `EventService` — Queries GraphQL (`events`, `eventBySlug`, `createEvent`, `rsvpEvent`)
- `GroupService` — Queries GraphQL (`groups`, `groupBySlug`, `createGroup`, `joinGroup`)
- Filtros: categoría, fecha, carrera, popularidad

## 5. Contratos de datos (interfaces)

- `Event`, `StudyGroup`, `GroupMember`, `RSVP` en `interfaces/events/`

## 6. Validaciones y reglas de negocio

- Evento: título, descripción, fecha, capacidad máxima, categoría
- RSVP único por usuario por evento (no duplicado)
- Grupo: nombre único, máximo 50 miembros (configurable)
- Unirse a grupo: solicitud o entrada libre según configuración
- Solo el creador del grupo puede editarlo/eliminarlo

## 7. Seguridad

- Crear evento/grupo: `authGuard`
- RSVP/Unirse: autenticado
- Ver eventos/grupos: público
- Editar/eliminar: solo creador

## 8. Errores y edge cases

- Evento con capacidad llena → botón de "Lista de espera"
- RSVP duplicado → toggle (confirmar/ cancelar asistencia)
- Grupo privado → solicitud de membresía pendiente de aprobación
- Evento pasado → vista de histórico, no permitir RSVP

## 9. Dependencias del módulo

- `apollo-angular`
- `shared/components/calendar`
- `core/services/auth-session`

## 10. TODO / Pendientes

- Integración con Google Calendar / Outlook
- Notificaciones 24h antes del evento
- Sala de chat en vivo dentro del grupo (WebSocket)
- Grabación de eventos virtuales
