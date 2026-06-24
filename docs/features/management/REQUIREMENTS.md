# Requerimientos: Administración y Moderación

## 1. Visión General

Panel exclusivo para roles autorizados (Administrador y Oficial) que permite revisar estadísticas generales, gestionar usuarios, moderar contenido y destacar publicaciones institucionales.

---

## 2. Requerimientos Funcionales

| ID | Requerimiento | Prioridad | Estimación |
|----|--------------|-----------|------------|
| RF-MGT-01 | El sistema debe mostrar dashboard con estadísticas (usuarios, posts, eventos) | Alta | 8 pts |
| RF-MGT-02 | El sistema debe mostrar gráficos de actividad semanal/mensual | Alta | 8 pts |
| RF-MGT-03 | El sistema debe listar usuarios con búsqueda y paginación (solo ADMIN) | Alta | 8 pts |
| RF-MGT-04 | El sistema debe permitir desactivar/reactivar cuentas (solo ADMIN) | Alta | 5 pts |
| RF-MGT-05 | El sistema debe permitir cambiar rol de usuario (STUDENT ↔ OFFICIAL) | Alta | 5 pts |
| RF-MGT-06 | El sistema debe listar publicaciones para moderar (ADMIN + OFFICIAL) | Alta | 8 pts |
| RF-MGT-07 | El sistema debe permitir ocultar publicaciones (moderación) | Alta | 5 pts |
| RF-MGT-08 | El sistema debe permitir destacar publicaciones (pin, max 3) | Alta | 5 pts |
| RF-MGT-09 | El sistema debe listar eventos para gestionar (ADMIN + OFFICIAL) | Alta | 5 pts |
| RF-MGT-10 | El sistema debe registrar auditoría de todas las acciones de moderación | Alta | 8 pts |
| RF-MGT-11 | El sistema debe impedir auto-desactivación y desactivación entre ADMINs | Alta | 3 pts |
| RF-MGT-12 | El sistema debe tener herramientas de mantenimiento del sistema | Media | 8 pts |

**Total estimado:** 76 pts

---

## 3. Requerimientos No Funcionales

| ID | Requerimiento | Tipo | Métrica |
|----|--------------|------|---------|
| RNF-MGT-01 | Dashboard debe cargar en < 2s | Rendimiento | 2s |
| RNF-MGT-02 | Estadísticas cacheadas con refresco cada 5 min | Rendimiento | 5 min |
| RNF-MGT-03 | Solo ADMIN puede gestionar usuarios y roles | Seguridad | — |
| RNF-MGT-04 | OFFICIAL solo puede moderar contenido | Seguridad | — |
| RNF-MGT-05 | Auditoría inmutable (solo inserción) | Integridad | — |
| RNF-MGT-06 | Máximo 3 publicaciones destacadas simultáneamente | Regla | 3 |

---

## 4. Historias de Usuario

**HU-MGT-01:** Como administrador, quiero ver estadísticas generales para entender el estado de la plataforma.
**HU-MGT-02:** Como administrador, quiero desactivar cuentas problemáticas para mantener el orden.
**HU-MGT-03:** Como oficial, quiero ocultar publicaciones inapropiadas para mantener un ambiente seguro.
**HU-MGT-04:** Como administrador, quiero destacar comunicados oficiales para que sean visibles.
**HU-MGT-05:** Como administrador, quiero ver un registro de acciones de moderación para auditoría.

---

## 5. Reglas de Negocio

| ID | Regla | Descripción |
|----|-------|-------------|
| RN-MGT-01 | Auto-exclusión | ADMIN no puede desactivarse a sí mismo ni a otros ADMIN |
| RN-MGT-02 | Roles | ADMIN gestiona todo; OFFICIAL solo modera contenido |
| RN-MGT-03 | Pins limitados | Máximo 3 publicaciones destacadas simultáneas |
| RN-MGT-04 | Auditoría | Toda acción de moderación se registra en AuditLog |
| RN-MGT-05 | Estadísticas | Cache con refresco cada 5 minutos |

---

## 6. Casos de Uso

### CU-MGT-01: Moderar publicación (ocultar)
1. ADMIN/OFFICIAL navega a lista de publicaciones
2. Selecciona publicación inapropiada → "Ocultar"
3. Mutation `moderatePost(id, action: HIDE)`
4. Sistema marca `hiddenByModerator = true`
5. Publicación deja de aparecer en feeds públicos
6. Sistema registra en AuditLog: quién, qué, cuándo

### CU-MGT-02: Destacar publicación (pin)
1. ADMIN/OFFICIAL selecciona publicación → "Destacar"
2. Sistema verifica count de pinned < 3
3. Sistema marca `isPinned = true`
4. Publicación aparece al inicio del feed con indicador
5. Sistema registra en AuditLog

### CU-MGT-03: Desactivar cuenta
1. ADMIN navega a gestión de usuarios
2. Selecciona estudiante → "Desactivar"
3. Sistema verifica que no sea auto-desactivación ni otro ADMIN
4. Sistema marca `isActive = false`
5. Usuario no puede iniciar sesión
6. Sistema registra en AuditLog

---

## 7. Criterios de Aceptación

### CA-MGT-01: Auto-desactivación bloqueada
```
Given un ADMIN autenticado
When intenta desactivar su propia cuenta
Then el sistema rechaza con "Cannot deactivate your own account"
```

### CA-MGT-02: OFFICIAL sin acceso a usuarios
```
Given un OFFICIAL autenticado
When intenta acceder a /management/users
Then el sistema redirige con "Access denied"
And no muestra opciones de gestión de usuarios en UI
```

### CA-MGT-03: Máximo de pins
```
Given 3 publicaciones destacadas activas
When se intenta destacar una cuarta
Then el sistema rechaza con "Maximum pinned posts reached (3)"
```

---

## 8. Dependencias

| Dependencia | Módulo |
|-------------|--------|
| `roleGuard` | Core |
| `AuthSession` | Core |
| Apollo GraphQL | — |

---

## 9. Priorización

### MVP
RF-MGT-01, RF-MGT-03, RF-MGT-04, RF-MGT-06, RF-MGT-07, RF-MGT-08, RF-MGT-10, RF-MGT-11

### Fase 2
RF-MGT-02, RF-MGT-05, RF-MGT-09, RF-MGT-12

---

## 10. TODOs

| ID | Tarea | Prioridad | Esfuerzo |
|----|-------|-----------|----------|
| TODO-MGT-01 | Dashboard con gráficos (Chart.js o similar) | Alta | 10h |
| TODO-MGT-02 | Tabla de usuarios con búsqueda y paginación | Alta | 8h |
| TODO-MGT-03 | Modal de confirmación para desactivar cuenta | Alta | 3h |
| TODO-MGT-04 | Sistema de reportes de contenido (usuarios reportan posts) | Media | 10h |
| TODO-MGT-05 | Logs de auditoría exportables (CSV/PDF) | Media | 6h |
| TODO-MGT-06 | Notificaciones masivas (anuncios desde el panel) | Media | 8h |
| TODO-MGT-07 | Historial de actividad por usuario (admin view) | Baja | 6h |
| TODO-MGT-08 | Respaldos programados desde la UI | Baja | 10h |
| TODO-MGT-09 | Tests de integración: flujo de moderación completo | Alta | 10h |
| TODO-MGT-10 | Cache de estadísticas con refresco automático | Media | 5h |
