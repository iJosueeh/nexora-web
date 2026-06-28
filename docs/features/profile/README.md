# Módulo: Configuración de Perfil

## 1. Objetivo del módulo

Permite a cada estudiante personalizar su cuenta: biografía, carrera, intereses, avatar y portada, con previsualización en tiempo real.

## 2. Rutas y navegación

- `/settings` — Página de configuración de perfil (protegida con `authGuard`)
- `/profile` — Vista de perfil público
- `/u/:handle` — Perfil público por handle

## 3. Componentes

| Componente | Propósito | Signals clave |
|------------|-----------|--------------|
| `ProfileSettings` | Página principal de configuración | `profile`, `isSaving`, `avatarPreview` |
| `AvatarUpload` | Carga y recorte de avatar | `imageFile`, `previewUrl`, `isUploading` |
| `CoverUpload` | Carga de imagen de portada | `coverFile`, `previewUrl`, `isUploading` |
| `ProfilePage` | Vista pública del perfil | `userProfile`, `posts`, `isOwnProfile` |

## 4. Servicios y estado

- `ProfileService` — CRUD de perfil (REST: `PUT /api/profile`, `GET /api/profile/{handle}`)
- `UploadService` — Carga de imágenes a almacenamiento remoto
- `AuthSession.mergeUser()` — Actualización de datos en sesión global

## 5. Contratos de datos (interfaces)

- `UserProfile` en `interfaces/profile/user-profile.ts`
- `ProfileUpdateRequest` en `interfaces/profile/profile-update-request.ts`

## 6. Validaciones y reglas de negocio

- Biografía: máximo 500 caracteres
- Avatar: formatos PNG, JPG, WEBP; máximo 2MB
- Portada: formatos PNG, JPG, WEBP; máximo 5MB
- Handle único, mínimo 3 caracteres, solo alfanumérico y guiones
- Carrera e intereses se seleccionan desde catálogos precargados (GET /api/catalogs)

## 7. Seguridad

- Solo el dueño del perfil puede editarlo
- `authGuard` en `/settings`

## 8. Errores y edge cases

- Handle duplicado → mensaje de error en campo
- Imagen muy grande → validación previa al upload
- Fallo de upload → reintento con feedback visual
- Perfil no encontrado → 404 con mensaje amigable

## 9. Dependencias del módulo

- `core/services/upload-service`
- `core/services/auth-session`
- `shared/components/image-cropper`

## 10. TODO / Pendientes

- Cropper de imagen para avatar
- Tags de intereses con autocompletado desde catálogo
- Vista previa de portada con posicionamiento
