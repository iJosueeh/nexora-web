# Requerimientos: Repositorio de Recursos Académicos

## 1. Visión General

Espacio donde los estudiantes comparten, categorizan por carrera y califican materiales de estudio de autoría propia: resúmenes, guías, flashcards, exámenes de práctica y apuntes.

---

## 2. Requerimientos Funcionales

| ID | Requerimiento | Prioridad | Estimación |
|----|--------------|-----------|------------|
| RF-RES-01 | El sistema debe permitir subir recursos académicos (PDF, EPUB, MD, PPTX, DOCX) | Alta | 10 pts |
| RF-RES-02 | El sistema debe categorizar recursos por carrera desde catálogo institucional | Alta | 5 pts |
| RF-RES-03 | El sistema debe permitir calificar recursos (1-5 estrellas, un voto por usuario) | Alta | 5 pts |
| RF-RES-04 | El sistema debe mostrar explorador con filtros (carrera, tipo, rating) | Alta | 8 pts |
| RF-RES-05 | El sistema debe mostrar detalle del recurso con descarga | Alta | 5 pts |
| RF-RES-06 | El sistema debe requerir autenticación para descargar | Alta | 3 pts |
| RF-RES-07 | El sistema debe validar tamaño máximo (20MB) y formatos soportados | Alta | 3 pts |
| RF-RES-08 | El sistema debe listar recursos del usuario autenticado ("Mis recursos") | Media | 5 pts |
| RF-RES-09 | El sistema debe permitir editar metadatos del recurso (no el archivo) | Media | 5 pts |
| RF-RES-10 | El sistema debe permitir eliminar recurso propio (soft delete) | Media | 3 pts |

**Total estimado:** 52 pts

---

## 3. Requerimientos No Funcionales

| ID | Requerimiento | Tipo | Métrica |
|----|--------------|------|---------|
| RNF-RES-01 | Upload < 5s para archivos < 10MB (p95) | Rendimiento | 5s |
| RNF-RES-02 | Explorador con filtros < 1s (p95) | Rendimiento | 1s |
| RNF-RES-03 | Archivos almacenados en S3 con URLs prefirmadas (15 min exp) | Seguridad | — |
| RNF-RES-04 | Formatos permitidos: PDF, EPUB, MD, PPTX, DOCX | Compatibilidad | — |
| RNF-RES-05 | Rating único por (usuario, recurso) | Consistencia | — |
| RNF-RES-06 | Solo el autor puede editar/eliminar | Seguridad | — |

---

## 4. Historias de Usuario

**HU-RES-01:** Como estudiante, quiero subir mis resúmenes de estudio para ayudar a otros.
**HU-RES-02:** Como estudiante, quiero buscar materiales por carrera para preparar exámenes.
**HU-RES-03:** Como estudiante, quiero calificar recursos para destacar los más útiles.
**HU-RES-04:** Como estudiante, quiero descargar guías de estudio para repasar en casa.
**HU-RES-05:** Como estudiante, quiero ver mis contribuciones para llevar un registro.

---

## 5. Reglas de Negocio

| ID | Regla | Descripción |
|----|-------|-------------|
| RN-RES-01 | Autoría propia | Solo recursos creados por el estudiante (no plagio declarado) |
| RN-RES-02 | Límite tamaño | 20MB por archivo |
| RN-RES-03 | Formatos | PDF, EPUB, MD, PPTX, DOCX |
| RN-RES-04 | Rating único | Una calificación por (usuario, recurso), upsert |
| RN-RES-05 | Archivo inmutable | No se puede reemplazar el archivo después de publicado |
| RN-RES-06 | Descarga trazable | Requiere autenticación, URL prefirmada 15 min |

---

## 6. Casos de Uso

### CU-RES-01: Subir recurso
1. Estudiante selecciona archivo + completa metadatos (título, descripción, categoría, tipo)
2. Frontend valida formato y tamaño
3. Sistema recibe multipart + metadatos vía GraphQL
4. Sistema valida categoría contra catálogo
5. Sistema sube archivo a S3 bucket `nexora-resources`
6. Sistema persiste `AcademicResource` con URL del archivo
7. Sistema retorna 200 con datos del recurso

### CU-RES-02: Calificar recurso
1. Estudiante selecciona rating (1-5)
2. Mutation `rateResource(resourceId, rating)`
3. Sistema busca rating existente: si existe, actualiza; si no, inserta
4. Sistema recalcula `averageRating` y `ratingsCount` en `AcademicResource`
5. Sistema retorna `ResourceRatingPayload { averageRating, ratingsCount, userRating }`

---

## 7. Criterios de Aceptación

### CA-RES-01: Subida exitosa
```
Given un estudiante autenticado
When sube un PDF de 2MB con título "Resumen Cálculo I" y categoría "Ingeniería"
Then el sistema retorna el recurso con URL de descarga
And el archivo está disponible en S3
```

### CA-RES-02: Rating upsert
```
Given un recurso con rating 4.0 (10 votos)
When un estudiante vota 5 estrellas
Then averageRating = 4.09, ratingsCount = 11
When el mismo estudiante vota 3 estrellas
Then averageRating = 3.91, ratingsCount = 11 (no incrementa)
```

---

## 8. Dependencias

| Dependencia | Módulo |
|-------------|--------|
| `UploadService` | Infraestructura |
| `FileStorageService` | Infraestructura |
| Apollo GraphQL | — |

---

## 9. Priorización

### MVP
RF-RES-01, RF-RES-02, RF-RES-03, RF-RES-04, RF-RES-05, RF-RES-06, RF-RES-07

### Fase 2
RF-RES-08, RF-RES-09, RF-RES-10

---

## 10. TODOs

| ID | Tarea | Prioridad | Esfuerzo |
|----|-------|-----------|----------|
| TODO-RES-01 | Vista previa de PDF en navegador (PDF.js) | Media | 8h |
| TODO-RES-02 | Comentarios/discusión por recurso | Media | 6h |
| TODO-RES-03 | Botón "Reportar recurso" para moderación | Media | 3h |
| TODO-RES-04 | Sistema de "útil" (similar a likes) en recursos | Baja | 4h |
| TODO-RES-05 | Búsqueda full-text en recursos | Media | 8h |
| TODO-RES-06 | Colecciones de recursos (guardar en carpetas) | Media | 5h |
| TODO-RES-07 | Tests de integración: upload + rating + consulta | Alta | 8h |
| TODO-RES-08 | Compresión de PDF antes de almacenar | Baja | 5h |
| TODO-RES-09 | Estadísticas de descargas por recurso | Baja | 3h |
