# Módulo: Administración y Moderación

## 1. Objetivo del módulo

Espacio exclusivo para roles autorizados (Administrador u Oficial) que permite revisar estadísticas generales, desactivar cuentas, gestionar publicaciones y destacar contenido institucional.

## 2. Rutas y navegación

- `/management/dashboard` — Panel de estadísticas generales
- `/management/users` — Gestión de usuarios (solo ADMIN)
- `/management/posts` — Moderación de publicaciones
- `/management/events` — Gestión de eventos
- `/management/maintenance` — Mantenimiento del sistema

## 3. Componentes

| Componente | Propósito | Signals clave |
|------------|-----------|--------------|
| `ManagementPage` | Layout del panel de administración | `currentSection`, `userRole` |
| `DashboardView` | Tarjetas de estadísticas | `stats`, `recentActivity`, `period` |
| `UsersView` | Tabla de usuarios con acciones | `users`, `searchQuery`, `selectedUser` |
| `PostsView` | Moderación de publicaciones | `posts`, `filters`, `selectedPost` |
| `EventsView` | Gestión de eventos institucionales | `events`, `isLoading` |
| `MaintenancePage` | Herramientas de mantenimiento | `status`, `logs` |

## 4. Servicios y estado

- `ManagementService` — Queries GraphQL (`dashboardStats`, `users`, `moderatePost`, `deactivateUser`, `pinPost`)
- `roleGuard` — Protección por rol (ADMIN, OFFICIAL)

## 5. Contratos de datos (interfaces)

- `DashboardStats`, `AdminUser`, `ModerationAction` en `interfaces/management/`

## 6. Validaciones y reglas de negocio

- Dashboard: usuarios activos, publicaciones hoy, eventos próximos, reportes pendientes
- Moderación: ocultar, destacar (pin), eliminar publicaciones
- Usuarios: desactivar/activar cuenta, cambiar rol (solo ADMIN)
- Acciones auditadas (quién hizo qué y cuándo)
- OFFICIAL puede moderar contenido pero no gestionar usuarios ni roles

## 7. Seguridad

- Todas las rutas protegidas con `roleGuard`
- `allowedRoles: ['ROLE_ADMIN', 'ROLE_OFFICIAL']`
- Sección de usuarios solo para `ROLE_ADMIN`

## 8. Errores y edge cases

- Intento de acción sin permiso → redirect con mensaje
- Desactivar cuenta propia → impedido
- Publicación ya destacada → toggle
- Estadísticas sin datos → estado vacío con mensaje

## 9. Dependencias del módulo

- `core/guards/role-guard`
- `core/services/auth-session`
- `apollo-angular`

## 10. TODO / Pendientes

- Sistema de reportes de contenido
- Logs de auditoría exportables
- Notificaciones masivas (anuncios)
- Respaldos programados desde la UI
