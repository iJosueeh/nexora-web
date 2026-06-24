# Módulo: Autenticación y Seguridad (REST)

## 1. Objetivo del módulo

Regular el acceso seguro de los estudiantes validando identidades mediante tokens JWT, coordinando el registro inicial y el completado de datos con los catálogos de la institución.

## 2. Rutas y navegación

- `/login` — Inicio de sesión
- `/register` — Registro de nuevo estudiante
- `/forgot-password` — Recuperación de contraseña
- `/reset-password` — Restablecimiento de contraseña

## 3. Componentes

| Componente | Propósito | Signals clave |
|------------|-----------|--------------|
| `Login` | Formulario de inicio de sesión | `email`, `password`, `isSubmitting` |
| `Register` | Formulario de registro | `formData`, `step`, `isSubmitting` |
| `ForgotPassword` | Solicitud de restablecimiento | `email`, `isSent` |
| `ResetPassword` | Nuevo password | `token`, `password`, `confirmPassword` |

## 4. Servicios y estado

- `AuthSession` (core) — Signal global con `currentUser`, `isAuthenticated`, `sessionToken`
- `SupabaseAuthService` — Integración con Supabase para autenticación
- Consumo REST: `POST /api/auth/register`, `POST /api/auth/login`

## 5. Contratos de datos (interfaces)

- `AuthSession` en `src/app/core/services/auth-session.ts`
- `RegisterRequest`, `LoginRequest`, `AuthResponse` en `src/app/interfaces/auth/`

## 6. Validaciones y reglas de negocio

- Email institucional obligatorio (validación de dominio)
- Password mínimo 8 caracteres
- Token JWT se almacena en sesión y se refresca automáticamente
- Datos de catálogo institucional se completan post-registro

## 7. Seguridad

- Layout `auth-layout` (sin sidebar ni header principal)
- Redirect automático a `/feed` si ya hay sesión activa
- Protección CSRF mediante token en headers

## 8. Errores y edge cases

- Token expirado → redirect a `/login` con mensaje de sesión expirada
- Email duplicado → mensaje de error en formulario
- Red social caída → fallback a autenticación local

## 9. Dependencias del módulo

- `@supabase/supabase-js`
- `core/guards/auth-guard`
- `core/interceptors/auth-interceptor`

## 10. TODO / Pendientes

- Completado de datos con catálogo institucional post-registro
- Integración con SSO institucional
- Refresh token rotation
