# Requerimientos: Autenticación y Seguridad (REST)

## 1. Visión General

Módulo de acceso seguro que valida identidades estudiantiles mediante JWT, coordina el registro inicial con verificación de dominio institucional y gestiona el completado de datos con catálogos de la institución.

---

## 2. Requerimientos Funcionales

| ID | Requerimiento | Prioridad | Estimación |
|----|--------------|-----------|------------|
| RF-AUTH-01 | El sistema debe permitir registro de estudiantes con email institucional y contraseña segura | Alta | 5 pts |
| RF-AUTH-02 | El sistema debe validar que el email pertenezca a un dominio institucional autorizado | Alta | 3 pts |
| RF-AUTH-03 | El sistema debe rechazar registros con email ya existente | Alta | 2 pts |
| RF-AUTH-04 | El sistema debe permitir inicio de sesión con email y contraseña | Alta | 3 pts |
| RF-AUTH-05 | El sistema debe generar un JWT firmado al autenticarse exitosamente | Alta | 5 pts |
| RF-AUTH-06 | El sistema debe permitir refrescar el token JWT mediante refresh token | Alta | 5 pts |
| RF-AUTH-07 | El sistema debe exponer endpoint `/api/auth/me` para obtener perfil del usuario autenticado | Alta | 3 pts |
| RF-AUTH-08 | El sistema debe permitir completar datos de catálogo institucional post-registro (onboarding) | Alta | 8 pts |
| RF-AUTH-09 | El sistema debe marcar la cuenta como `pending-onboarding` si no completa datos en 7 días | Media | 5 pts |
| RF-AUTH-10 | El sistema debe permitir recuperación de contraseña mediante email | Media | 8 pts |
| RF-AUTH-11 | El sistema debe cerrar sesión invalidando el token (blacklist opcional) | Media | 5 pts |
| RF-AUTH-12 | El sistema debe redirigir a `/feed` si el usuario ya tiene sesión activa al visitar `/login` | Baja | 2 pts |

**Total estimado:** 54 pts

---

## 3. Requerimientos No Funcionales

| ID | Requerimiento | Tipo | Métrica |
|----|--------------|------|---------|
| RNF-AUTH-01 | El password debe almacenarse hasheado con BCrypt (costo >= 10) | Seguridad | — |
| RNF-AUTH-02 | El JWT debe expirar en 24h (access) y 7 días (refresh) | Seguridad | — |
| RNF-AUTH-03 | El login debe soportar rate limiting: máx 5 intentos/min por IP | Seguridad | 5 req/min |
| RNF-AUTH-04 | El registro debe responder en < 2s (p95) | Rendimiento | 2s |
| RNF-AUTH-05 | El login debe responder en < 1s (p95) | Rendimiento | 1s |
| RNF-AUTH-06 | El sistema debe soportar 100 registros simultáneos | Escalabilidad | 100 concurrentes |
| RNF-AUTH-07 | Las contraseñas deben tener mínimo 8 caracteres, 1 mayúscula, 1 número | Seguridad | — |
| RNF-AUTH-08 | No se deben loggear contraseñas ni tokens en texto plano | Seguridad | — |
| RNF-AUTH-09 | El dominio institucional debe ser configurable por variable de entorno | Configurabilidad | — |
| RNF-AUTH-10 | El endpoint de login debe rechazar peticiones sin Content-Type: application/json | Seguridad | — |

---

## 4. Historias de Usuario

### Épica: Registro y Autenticación

**HU-AUTH-01:** Como estudiante, quiero registrarme con mi email institucional para acceder a la plataforma.
- Criterios: email válido, dominio institucional, contraseña segura, confirmación de términos.

**HU-AUTH-02:** Como estudiante, quiero iniciar sesión con mi email y contraseña para acceder a mi cuenta.
- Criterios: credenciales válidas, sesión persistente, redirección a feed.

**HU-AUTH-03:** Como estudiante, quiero recuperar mi contraseña si la olvido para no perder acceso a mi cuenta.
- Criterios: email registrado, enlace temporal, nueva contraseña segura.

**HU-AUTH-04:** Como estudiante nuevo, quiero completar mi perfil con carrera y facultad para personalizar mi experiencia.
- Criterios: catálogo institucional, selección obligatoria, actualización de perfil.

### Épica: Seguridad de Sesión

**HU-AUTH-05:** Como estudiante, quiero que mi sesión sea segura para proteger mi información personal.
- Criterios: JWT cifrado, expiración automática, sin almacenamiento en localStorage.

**HU-AUTH-06:** Como administrador, quiero que el sistema limite intentos de login para prevenir ataques de fuerza bruta.
- Criterios: bloqueo temporal, notificación de intentos fallidos.

---

## 5. Reglas de Negocio

| ID | Regla | Descripción |
|----|-------|-------------|
| RN-AUTH-01 | Dominio institucional | Solo emails con dominio en whitelist configurable pueden registrarse |
| RN-AUTH-02 | Email único | No pueden existir dos cuentas con el mismo email |
| RN-AUTH-03 | Password hasheado | BCrypt con salt aleatorio, mínimo 10 rounds |
| RN-AUTH-04 | JWT claims mínimos | `sub` (email), `role`, `userId`, `name`, `iat`, `exp` |
| RN-AUTH-05 | Onboarding forzado | El estudiante debe completar datos de catálogo antes de acceder al feed |
| RN-AUTH-06 | Auto-exclusión | Un ADMIN no puede desactivar su propia cuenta |
| RN-AUTH-07 | Sesión única | Un token activo por sesión (opcional: invalidar anterior al refrescar) |

---

## 6. Casos de Uso Principales

### CU-AUTH-01: Registrar estudiante
- **Actor:** Estudiante no registrado
- **Precondición:** Email institucional válido, password cumple política
- **Flujo principal:**
  1. Estudiante completa formulario de registro
  2. Sistema valida dominio del email
  3. Sistema verifica unicidad del email
  4. Sistema hashea password con BCrypt
  5. Sistema crea usuario con rol `STUDENT`, `isActive=true`
  6. Sistema genera JWT de acceso + refresh token
  7. Sistema retorna 201 con tokens y datos básicos
- **Postcondición:** Usuario creado, sesión iniciada
- **Flujo alternativo:** Email duplicado → 400 "Email already registered"
- **Flujo alternativo:** Dominio no autorizado → 400 "Email domain not allowed"

### CU-AUTH-02: Iniciar sesión
- **Actor:** Estudiante registrado
- **Precondición:** Cuenta activa, credenciales correctas
- **Flujo principal:**
  1. Estudiante ingresa email y password
  2. Sistema verifica credenciales contra BCrypt hash
  3. Sistema verifica `isActive = true`
  4. Sistema genera JWT access + refresh
  5. Sistema retorna 200 con tokens y datos del usuario
- **Postcondición:** Sesión iniciada, JWT disponible
- **Flujo alternativo:** Credenciales inválidas → 401 "Invalid credentials"
- **Flujo alternativo:** Cuenta desactivada → 401 "Account deactivated"

### CU-AUTH-03: Completar onboarding
- **Actor:** Estudiante recién registrado
- **Precondición:** Usuario autenticado, `pending-onboarding = true`
- **Flujo principal:**
  1. Estudiante selecciona carrera, facultad, semestre desde catálogo
  2. Sistema valida existencia en catálogo institucional
  3. Sistema crea/actualiza `StudentProfile`
  4. Sistema marca `pending-onboarding = false`
  5. Sistema retorna 200 con perfil completo
- **Postcondición:** Perfil completado, acceso completo a plataforma
- **Flujo alternativo:** Catálogo no encontrado → 404 "Catalog item not found"

---

## 7. Criterios de Aceptación

### CA-AUTH-01: Registro exitoso
```
Given un email institucional válido y una contraseña que cumple políticas
When el estudiante envía el formulario de registro
Then el sistema crea la cuenta y retorna 201 con JWT
And el usuario puede acceder inmediatamente
```

### CA-AUTH-02: Login con credenciales incorrectas
```
Given un email registrado
When el estudiante ingresa una contraseña incorrecta
Then el sistema retorna 401 "Invalid credentials"
And no se genera ningún token
```

### CA-AUTH-03: Rate limiting en login
```
Given una dirección IP específica
When se realizan 6 intentos fallidos de login en 1 minuto
Then el sistema retorna 429 "Too many requests"
And bloquea temporalmente la IP por 60 segundos
```

### CA-AUTH-04: Onboarding obligatorio
```
Given un estudiante recién registrado sin datos de catálogo
When intenta acceder al feed
Then el sistema redirige a la página de onboarding
And no permite navegar a otras secciones hasta completar
```

---

## 8. Matriz de Trazabilidad

| Requerimiento | Componente Frontend | Endpoint Backend | Servicio |
|--------------|-------------------|------------------|----------|
| RF-AUTH-01 | `Register` | `POST /api/auth/register` | `AuthService` |
| RF-AUTH-02 | `Register` (validación email) | `POST /api/auth/register` | `EmailDomainValidator` |
| RF-AUTH-04 | `Login` | `POST /api/auth/login` | `AuthService` |
| RF-AUTH-05 | `AuthSession` | `POST /api/auth/login` | `JwtService` |
| RF-AUTH-06 | `AuthSession` (refresh automático) | `POST /api/auth/refresh` | `JwtService` |
| RF-AUTH-07 | `AuthSession` | `GET /api/auth/me` | `UserService` |
| RF-AUTH-08 | `OnboardingForm` | `PUT /api/auth/onboarding` | `StudentProfileService` |

---

## 9. Dependencias y Restricciones

| Dependencia | Tipo | Módulo |
|-------------|------|--------|
| Spring Security + JWT | Librería | — |
| Supabase Auth (frontend) | Servicio externo | — |
| Catálogo institucional | Dato maestro | Profile |
| `UserRepository` | Repositorio | Core |
| `StudentProfile` | Entidad | Profile |
| BCrypt | Algoritmo | — |
| Java `jjwt` o `nimbus-jose-jwt` | Librería | — |

---

## 10. Priorización (MVP vs Post-MVP)

### MVP (Fase 1 — Prioridad Alta)
- RF-AUTH-01: Registro con email institucional
- RF-AUTH-02: Validación de dominio
- RF-AUTH-03: Email único
- RF-AUTH-04: Login
- RF-AUTH-05: JWT access token
- RF-AUTH-07: Endpoint `/api/auth/me`
- RF-AUTH-08: Onboarding con catálogo

### Fase 2 (Prioridad Media)
- RF-AUTH-06: Refresh token rotation
- RF-AUTH-09: Cuenta pending-onboarding
- RF-AUTH-10: Recuperación de contraseña

### Fase 3 (Prioridad Baja)
- RF-AUTH-11: Logout con blacklist
- RF-AUTH-12: Redirección por sesión activa
- SSO / OAuth2 social
- Verificación de email con OTP
- Integración LDAP institucional

---

## 11. TODOs y Pendientes Detallados

| ID | Tarea | Prioridad | Esfuerzo | Dependencia |
|----|-------|-----------|----------|-------------|
| TODO-AUTH-01 | Implementar refresh token rotation | Alta | 8h | JwtService |
| TODO-AUTH-02 | Agregar rate limiting en login (Spring Bucket4j o similar) | Alta | 4h | Infraestructura |
| TODO-AUTH-03 | Validación de dominio institucional configurable vía BD (no .env) | Media | 6h | Catálogo |
| TODO-AUTH-04 | Envío de email de bienvenida post-registro | Media | 4h | MailService |
| TODO-AUTH-05 | Notificación de cuenta pending-onboarding a los 7 días | Media | 3h | Scheduled Task |
| TODO-AUTH-06 | Página de restablecimiento de contraseña (frontend) | Media | 6h | — |
| TODO-AUTH-07 | Endpoint de logout con invalidación de token (blacklist Redis) | Baja | 8h | Redis |
| TODO-AUTH-08 | Integración con SSO institucional (SAML/OIDC) | Baja | 40h | Infraestructura |
| TODO-AUTH-09 | Verificación de email mediante OTP | Baja | 10h | MailService |
| TODO-AUTH-10 | Migrar de Supabase Auth a auth propio (backend) si es necesario | Baja | 20h | — |
| TODO-AUTH-11 | Agregar tests de integración para flujo completo registro→onboarding | Media | 8h | — |
| TODO-AUTH-12 | Documentar política de contraseñas y dominios autorizados | Baja | 2h | Documentación |
