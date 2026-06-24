# Requerimientos: Configuración de Perfil

## 1. Visión General

Módulo que permite a cada estudiante personalizar su cuenta: biografía, carrera, intereses, avatar y portada, con previsualización en tiempo real y carga de imágenes.

---

## 2. Requerimientos Funcionales

| ID | Requerimiento | Prioridad | Estimación |
|----|--------------|-----------|------------|
| RF-PRO-01 | El sistema debe permitir al estudiante actualizar su biografía (max 500 chars) | Alta | 3 pts |
| RF-PRO-02 | El sistema debe permitir seleccionar carrera desde catálogo institucional | Alta | 5 pts |
| RF-PRO-03 | El sistema debe permitir seleccionar intereses desde catálogo | Alta | 5 pts |
| RF-PRO-04 | El sistema debe permitir subir avatar (2MB max, PNG/JPG/WEBP) | Alta | 8 pts |
| RF-PRO-05 | El sistema debe mostrar previsualización del avatar antes de guardar | Alta | 5 pts |
| RF-PRO-06 | El sistema debe permitir subir imagen de portada (5MB max) | Alta | 8 pts |
| RF-PRO-07 | El sistema debe exponer perfil público por handle (`/u/:handle`) | Alta | 5 pts |
| RF-PRO-08 | El sistema debe validar handle único (min 3, max 30, alfanumérico + guiones) | Alta | 3 pts |
| RF-PRO-09 | El sistema debe permitir eliminar avatar/portada | Media | 3 pts |
| RF-PRO-10 | El sistema debe redimensionar y optimizar imágenes automáticamente | Media | 8 pts |
| RF-PRO-11 | El sistema debe mostrar perfil de otros estudiantes con datos públicos | Alta | 5 pts |
| RF-PRO-12 | El sistema debe sincronizar cambios de perfil con la sesión activa (`AuthSession.mergeUser`) | Media | 3 pts |

**Total estimado:** 61 pts

---

## 3. Requerimientos No Funcionales

| ID | Requerimiento | Tipo | Métrica |
|----|--------------|------|---------|
| RNF-PRO-01 | La carga de avatar debe responder en < 3s (p95) para archivos < 1MB | Rendimiento | 3s |
| RNF-PRO-02 | La previsualización debe ser instantánea (< 500ms) | UX | 500ms |
| RNF-PRO-03 | Solo el dueño del perfil puede editarlo | Seguridad | — |
| RNF-PRO-04 | Las imágenes deben servirse con caché de 24h (CDN) | Rendimiento | 24h TTL |
| RNF-PRO-05 | El perfil público debe cargar en < 1.5s (p95) | Rendimiento | 1.5s |
| RNF-PRO-06 | Las URLs de imágenes deben ser prefirmadas con expiración | Seguridad | 15 min |

---

## 4. Historias de Usuario

**HU-PRO-01:** Como estudiante, quiero subir una foto de perfil para que mis compañeros me reconozcan.
**HU-PRO-02:** Como estudiante, quiero escribir una biografía para compartir mis intereses académicos.
**HU-PRO-03:** Como estudiante, quiero seleccionar mi carrera e intereses para recibir contenido relevante.
**HU-PRO-04:** Como estudiante, quiero ver el perfil de otros estudiantes para conocer sus intereses.
**HU-PRO-05:** Como estudiante, quiero elegir un handle único para compartir mi perfil fácilmente.

---

## 5. Reglas de Negocio

| ID | Regla | Descripción |
|----|-------|-------------|
| RN-PRO-01 | Handle único | No pueden existir dos estudiantes con el mismo handle |
| RN-PRO-02 | Ownership | Solo el dueño del perfil puede editar sus datos |
| RN-PRO-03 | Límite imágenes | Avatar 2MB, Portada 5MB, formatos PNG/JPG/WEBP |
| RN-PRO-04 | Catálogo validado | Carrera e intereses deben existir en catálogo institucional |
| RN-PRO-05 | Limpieza storage | Al cambiar avatar, la imagen anterior se elimina si no hay referencias |

---

## 6. Casos de Uso Principales

### CU-PRO-01: Actualizar perfil
- **Actor:** Estudiante autenticado
- **Flujo:**
  1. Estudiante modifica biografía, handle, carrera o intereses
  2. Sistema valida handle único
  3. Sistema valida carrera/intereses contra catálogo
  4. Sistema actualiza `StudentProfile`
  5. Sistema retorna 200 con perfil actualizado
- **Postcondición:** Perfil persistido, sesión actualizada

### CU-PRO-02: Subir avatar
- **Actor:** Estudiante autenticado
- **Flujo:**
  1. Estudiante selecciona imagen (PNG/JPG/WEBP, < 2MB)
  2. Frontend muestra previsualización
  3. Sistema recibe multipart, valida formato y tamaño
  4. Sistema redimensiona y optimiza (ej: 256x256px)
  5. Sistema sube a storage S3
  6. Sistema actualiza URL en `StudentProfile`
  7. Sistema elimina imagen anterior si existe
  8. Sistema retorna 200 con nueva URL

### CU-PRO-03: Ver perfil público
- **Actor:** Cualquier usuario (autenticado o no)
- **Flujo:**
  1. Sistema recibe `GET /api/profile/{handle}`
  2. Sistema busca `StudentProfile` por handle
  3. Sistema retorna datos públicos (sin email, sin datos sensibles)
- **Flujo alternativo:** Handle no existe → 404

---

## 7. Criterios de Aceptación

### CA-PRO-01: Actualización exitosa
```
Given un estudiante autenticado
When actualiza su biografía y selecciona una carrera del catálogo
Then el sistema guarda los cambios y retorna el perfil actualizado
And la sesión refleja los nuevos datos
```

### CA-PRO-02: Handle duplicado
```
Given un handle "juanperez" ya en uso
When otro estudiante intenta usar el mismo handle
Then el sistema retorna 400 "Handle already exists"
```

---

## 8. Dependencias

| Dependencia | Módulo |
|-------------|--------|
| `StudentProfileRepository` | Core |
| `InstitutionalCatalog` | Catálogos |
| `FileStorageService` | Infraestructura |
| `ImageProcessingService` | Infraestructura |
| `AuthSession` (frontend) | Core |

---

## 9. Priorización

### MVP (Fase 1)
RF-PRO-01, RF-PRO-02, RF-PRO-03, RF-PRO-04, RF-PRO-06, RF-PRO-07, RF-PRO-08, RF-PRO-11

### Fase 2
RF-PRO-05, RF-PRO-09, RF-PRO-10, RF-PRO-12

---

## 10. TODOs

| ID | Tarea | Prioridad | Esfuerzo |
|----|-------|-----------|----------|
| TODO-PRO-01 | Implementar crop de imagen antes del upload | Media | 6h |
| TODO-PRO-02 | Autocompletado de intereses con búsqueda en catálogo | Alta | 4h |
| TODO-PRO-03 | Vista previa de portada con posicionamiento (drag) | Media | 8h |
| TODO-PRO-04 | Endpoint para listar intereses disponibles desde catálogo | Alta | 3h |
| TODO-PRO-05 | Compresión de imágenes en cliente antes del upload | Media | 5h |
| TODO-PRO-06 | Soporte para múltiples idiomas en biografía | Baja | 4h |
| TODO-PRO-07 | Historial de cambios de handle (audit log) | Baja | 3h |
| TODO-PRO-08 | Tests de integración: subida de avatar + actualización perfil | Alta | 6h |
| TODO-PRO-09 | Notificar al usuario si el handle fue cambiado recientemente | Baja | 2h |
| TODO-PRO-10 | Modo oscuro para página de settings | Baja | 2h |
