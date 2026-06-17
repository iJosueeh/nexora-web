# Requerimientos: Eventos y Grupos de Estudio Temáticos

## 1. Visión General

Herramienta para crear salas virtuales de estudio y agendar eventos académicos (talleres, repasos, tutorías), facilitando la organización estudiantil por intereses comunes y carreras.

---

## 2. Requerimientos Funcionales

| ID | Requerimiento | Prioridad | Estimación |
|----|--------------|-----------|------------|
| RF-EVT-01 | El sistema debe mostrar calendario/lista de eventos académicos | Alta | 8 pts |
| RF-EVT-02 | El sistema debe permitir crear eventos con título, fecha, capacidad y categoría | Alta | 8 pts |
| RF-EVT-03 | El sistema debe permitir RSVP (confirmar/cancelar asistencia) único por evento | Alta | 5 pts |
| RF-EVT-04 | El sistema debe mostrar detalle del evento con lista de asistentes | Alta | 5 pts |
| RF-EVT-05 | El sistema debe permitir explorar grupos de estudio por categoría | Alta | 8 pts |
| RF-EVT-06 | El sistema debe permitir crear grupos de estudio con nombre único y descripción | Alta | 8 pts |
| RF-EVT-07 | El sistema debe permitir unirse/salir de grupos de estudio | Alta | 5 pts |
| RF-EVT-08 | El sistema debe mostrar sala virtual del grupo con miembros y próximo evento | Alta | 8 pts |
| RF-EVT-09 | El sistema debe permitir al creador del grupo asignar moderadores | Media | 5 pts |
| RF-EVT-10 | El sistema debe soportar grupos privados (solicitud de membresía) | Media | 8 pts |
| RF-EVT-11 | El sistema debe generar slugs únicos para eventos y grupos | Alta | 3 pts |

**Total estimado:** 71 pts

---

## 3. Requerimientos No Funcionales

| ID | Requerimiento | Tipo | Métrica |
|----|--------------|------|---------|
| RNF-EVT-01 | Lista de eventos < 1s (p95) | Rendimiento | 1s |
| RNF-EVT-02 | RSVP debe ser instantáneo (optimistic UI) | UX | — |
| RNF-EVT-03 | Límite: 50 miembros por grupo, 10 grupos por estudiante | Escalabilidad | — |
| RNF-EVT-04 | Slugs únicos generados automáticamente | Consistencia | — |
| RNF-EVT-05 | Eventos pasados no permiten RSVP | Regla | — |

---

## 4. Historias de Usuario

**HU-EVT-01:** Como estudiante, quiero crear un grupo de estudio de Cálculo para preparar el examen final.
**HU-EVT-02:** Como estudiante, quiero unirme a grupos de mi carrera para conocer compañeros.
**HU-EVT-03:** Como estudiante, quiero crear eventos de repaso y ver quién asistirá.
**HU-EVT-04:** Como estudiante, quiero explorar eventos próximos para no perderme talleres.
**HU-EVT-05:** Como estudiante, quiero que mi grupo tenga un espacio virtual para compartir materiales.

---

## 5. Reglas de Negocio

| ID | Regla | Descripción |
|----|-------|-------------|
| RN-EVT-01 | Capacidad evento | Si se alcanza, activar lista de espera (opcional) |
| RN-EVT-02 | RSVP único | Un estudiante solo puede confirmar una vez por evento (toggle) |
| RN-EVT-03 | Límite grupos | Máximo 10 grupos por estudiante, 50 miembros por grupo |
| RN-EVT-04 | Ownership | Solo el creador (OWNER) puede editar/eliminar el grupo |
| RN-EVT-05 | Slugs únicos | Generados automáticamente, sufijo aleatorio si hay conflicto |
| RN-EVT-06 | Evento futuro | `startDate` debe ser posterior a la fecha actual |

---

## 6. Casos de Uso

### CU-EVT-01: Crear evento
1. Estudiante completa formulario (título, descripción, fecha, capacidad, categoría)
2. Sistema genera slug, valida fecha futura
3. Sistema persiste evento con `organizerId = userId`
4. Sistema retorna evento creado

### CU-EVT-02: RSVP toggle
1. Estudiante hace clic en "Asistiré"
2. Mutation `rsvpEvent(eventId)`
3. Sistema busca `EventAttendee` por `(userId, eventId)`
4. Si existe → elimina (cancela asistencia). Si no → crea
5. Sistema actualiza `attendeesCount` en evento
6. Sistema retorna `RSVPPayload { isAttending, attendeesCount }`

### CU-EVT-03: Unirse a grupo
1. Estudiante solicita unirse a grupo
2. Si grupo es público → membresía automática como `MEMBER`
3. Si grupo es privado → `membership.status = PENDING`, OWNER debe aprobar
4. Sistema verifica límites (10 grupos/estudiante, 50 miembros/grupo)

---

## 7. Criterios de Aceptación

### CA-EVT-01: RSVP con capacidad
```
Given un evento con capacidad 5 y 5 asistentes confirmados
When un estudiante intenta RSVP
Then el sistema rechaza con "Event is full"
And opcionalmente agrega a lista de espera
```

### CA-EVT-02: Grupo privado
```
Given un grupo con membresía por solicitud
When un estudiante solicita unirse
Then el sistema crea membresía con status PENDING
And el OWNER recibe notificación de solicitud
```

---

## 8. Dependencias

| Dependencia | Módulo |
|-------------|--------|
| Apollo GraphQL | — |
| `SlugService` | Core |
| `NotificationService` | Notifications |

---

## 9. Priorización

### MVP
RF-EVT-01, RF-EVT-02, RF-EVT-03, RF-EVT-04, RF-EVT-05, RF-EVT-06, RF-EVT-07, RF-EVT-08, RF-EVT-11

### Fase 2
RF-EVT-09, RF-EVT-10

---

## 10. TODOs

| ID | Tarea | Prioridad | Esfuerzo |
|----|-------|-----------|----------|
| TODO-EVT-01 | Integración con Google Calendar / Outlook (.ics) | Baja | 8h |
| TODO-EVT-02 | Notificaciones 24h antes del evento | Media | 5h |
| TODO-EVT-03 | Sala de chat en vivo dentro del grupo (WebSocket) | Media | 15h |
| TODO-EVT-04 | Videollamada integrada (Jitsi / Zoom API) | Baja | 20h |
| TODO-EVT-05 | Grupos de estudio recurrentes (ej: semanal) | Baja | 8h |
| TODO-EVT-06 | Calendario visual con vista mensual/semanal | Media | 10h |
| TODO-EVT-07 | Exportar asistencia a CSV (para organizadores) | Baja | 4h |
| TODO-EVT-08 | Tests de integración: crear evento → RSVP → crear grupo → unirse | Alta | 10h |
| TODO-EVT-09 | Muro interno del grupo para compartir recursos | Media | 8h |
| TODO-EVT-10 | Sugerir grupos basados en carrera e intereses | Baja | 6h |
