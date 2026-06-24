# Módulo: Repositorio de Recursos Académicos

## 1. Objetivo del módulo

Espacio dedicado para que los estudiantes compartan, categoricen por carrera y califiquen materiales de estudio de autoría propia (resúmenes, guías, apuntes, flashcards).

## 2. Rutas y navegación

- `/recursos` — Explorador de recursos académicos
- `/recursos/subir` — Subir nuevo recurso (protegido)
- `/recursos/:id` — Detalle y descarga de recurso
- `/recursos/categoria/:categoria` — Filtrado por categoría/carrera

## 3. Componentes

| Componente | Propósito | Signals clave |
|------------|-----------|--------------|
| `ResourceExplorer` | Explorador con filtros y búsqueda | `resources`, `filters`, `isLoading`, `pagination` |
| `ResourceCard` | Tarjeta de recurso con rating | `resource`, `averageRating`, `downloadCount` |
| `ResourceUpload` | Formulario de subida | `file`, `metadata`, `isUploading`, `progress` |
| `ResourceDetail` | Vista detalle con descarga | `resource`, `reviews`, `isDownloading` |
| `RatingWidget` | Sistema de calificación (1-5) | `rating`, `userRating`, `average` |

## 4. Servicios y estado

- `ResourceService` — Queries GraphQL (`resources`, `resourceById`, `uploadResource`, `rateResource`)
- `UploadService` — Carga de archivos a almacenamiento remoto
- Filtros: carrera, tipo de recurso (resumen, guía, flashcard, examen), ordenar por rating/fecha

## 5. Contratos de datos (interfaces)

- `AcademicResource`, `ResourceCategory`, `ResourceReview`, `ResourceFilter` en `interfaces/resources/`

## 6. Validaciones y reglas de negocio

- Solo recursos de autoría propia (no plagio)
- Formatos: PDF, EPUB, Markdown, PPTX, DOCX; máximo 20MB
- Calificación: 1-5 estrellas, un voto por usuario por recurso
- Categorización por carrera desde catálogo institucional
- Descarga requiere autenticación (trazabilidad)

## 7. Seguridad

- Subir recurso: `authGuard`
- Descargar: autenticado
- Calificar: autenticado, un voto por recurso
- Explorar/buscar: público

## 8. Errores y edge cases

- Archivo muy pesado → validación previa al upload
- Formato no soportado → rechazo con mensaje
- Recurso eliminado → 404 con sugerencias
- Rating duplicado → actualización del voto anterior

## 9. Dependencias del módulo

- `core/services/upload-service`
- `shared/components/rating-widget`
- `apollo-angular`

## 10. TODO / Pendientes

- Vista previa de PDF en navegador
- Comentarios en recursos (discusión por recurso)
- Reportar recurso inapropiado
- Sistema de "útiles" (similar a likes)
