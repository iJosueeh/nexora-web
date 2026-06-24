# Requerimientos: Muro de Publicaciones e Interacción (GraphQL)

## 1. Visión General

Módulo central de la plataforma que gestiona la creación de publicaciones y debates estudiantiles, con feed paginado, sistema de likes, panel de tendencias (últimas 24h) y exploración de contenido.

---

## 2. Requerimientos Funcionales

| ID | Requerimiento | Prioridad | Estimación |
|----|--------------|-----------|------------|
| RF-FEED-01 | El sistema debe mostrar un feed paginado de publicaciones (cursor-based) | Alta | 8 pts |
| RF-FEED-02 | El sistema debe permitir crear publicaciones con texto (Markdown) | Alta | 8 pts |
| RF-FEED-03 | El sistema debe permitir adjuntar imágenes/archivos a publicaciones (max 5) | Alta | 10 pts |
| RF-FEED-04 | El sistema debe permitir editar publicación propia (ventana 24h) | Alta | 5 pts |
| RF-FEED-05 | El sistema debe permitir eliminar publicación propia (soft delete) | Alta | 5 pts |
| RF-FEED-06 | El sistema debe implementar like toggle por publicación | Alta | 5 pts |
| RF-FEED-07 | El sistema debe mostrar panel lateral con temas trending (últimas 24h) | Alta | 10 pts |
| RF-FEED-08 | El sistema debe permitir etiquetar publicaciones con tags (max 10) | Media | 5 pts |
| RF-FEED-09 | El sistema debe permitir búsqueda y filtrado de publicaciones | Media | 10 pts |
| RF-FEED-10 | El sistema debe mostrar detalle de publicación individual | Alta | 5 pts |
| RF-FEED-11 | El sistema debe mostrar contador de likes y comentarios en tiempo real | Media | 5 pts |
| RF-FEED-12 | El sistema debe soportar la creación de publicaciones mediante GraphQL mutations | Alta | 5 pts |

**Total estimado:** 81 pts

---

## 3. Requerimientos No Funcionales

| ID | Requerimiento | Tipo | Métrica |
|----|--------------|------|---------|
| RNF-FEED-01 | El feed debe cargar la primera página en < 2s (p95) | Rendimiento | 2s |
| RNF-FEED-02 | El scroll infinito debe ser fluido sin saltos visuales | UX | — |
| RNF-FEED-03 | Las imágenes deben cargarse con lazy loading | Rendimiento | — |
| RNF-FEED-04 | El trending debe actualizarse cada 15 minutos | Actualización | 15 min |
| RNF-FEED-05 | Soporte para 500 publicaciones concurrentes | Escalabilidad | 500 |
| RNF-FEED-06 | Las mutations deben responder en < 1s (p95) | Rendimiento | 1s |
| RNF-FEED-07 | Optimistic UI para likes (feedback instantáneo) | UX | — |
| RNF-FEED-08 | Paginación máxima 20 posts por página | UX | 20 |

---

## 4. Historias de Usuario

**HU-FEED-01:** Como estudiante, quiero crear publicaciones para compartir ideas con mis compañeros.
**HU-FEED-02:** Como estudiante, quiero ver un feed con las publicaciones más recientes.
**HU-FEED-03:** Como estudiante, quiero dar "me gusta" a publicaciones para mostrar apoyo.
**HU-FEED-04:** Como estudiante, quiero ver qué temas están trending para unirme a la discusión.
**HU-FEED-05:** Como estudiante, quiero buscar publicaciones por palabras clave.
**HU-FEED-06:** Como estudiante, quiero etiquetar mis publicaciones para que sean más fáciles de encontrar.

---

## 5. Reglas de Negocio

| ID | Regla | Descripción |
|----|-------|-------------|
| RN-FEED-01 | Contenido mínimo | 10 caracteres, máximo 2000 |
| RN-FEED-02 | Like único | Un solo like por usuario por publicación (toggle) |
| RN-FEED-03 | Ventana edición | Solo editable hasta 24h después de publicado |
| RN-FEED-04 | Soft delete | `deletedAt` not null, contenido oculto pero persistente |
| RN-FEED-05 | Trending score | `(likes_24h * 0.4) + (comments_24h * 0.6)`, top 10 |
| RN-FEED-06 | Límite tags | Máximo 10 tags por publicación |
| RN-FEED-07 | Límite media | Máximo 5 archivos por publicación |

---

## 6. Casos de Uso

### CU-FEED-01: Crear publicación
- **Actor:** Estudiante autenticado
- **Mutation:** `createPost(input: PostInput!)`
- **Validaciones:** contenido ≥ 10 chars, ≤ 2000; max 5 media; max 10 tags
- **Respuesta:** `Post` con datos creados

### CU-FEED-02: Feed paginado
- **Actor:** Cualquier usuario
- **Query:** `feedPosts(cursor, limit: 20, filter)`
- **Respuesta:** `PostConnection` con edges, cursor, hasNext

### CU-FEED-03: Like toggle
- **Actor:** Estudiante autenticado
- **Mutation:** `likePost(postId: UUID!)`
- **Regla:** Si ya tiene like, lo quita; si no, lo agrega
- **Respuesta:** `LikePayload { liked: Boolean, likesCount: Int }`

### CU-FEED-04: Trending topics
- **Actor:** Cualquier usuario
- **Query:** `trendingTopics`
- **Cálculo:** ponderación likes + comentarios últimas 24h
- **Respuesta:** Top 10 `TrendingTopic`

---

## 7. Criterios de Aceptación

### CA-FEED-01: Crear publicación exitosa
```
Given un estudiante autenticado
When crea una publicación con contenido "Hola mundo" y 2 imágenes
Then el sistema retorna la publicación con id, contenido, media URLs
And el contador de publicaciones del feed se incrementa
```

### CA-FEED-02: Like toggle
```
Given una publicación existente sin like del usuario
When el usuario da like
Then el contador sube en 1 y isLikedByMe = true
When el usuario vuelve a dar like
Then el contador baja en 1 y isLikedByMe = false
```

### CA-FEED-03: Trending actualizado
```
Given una publicación con 10 likes y 5 comentarios en 24h
When se consulta trendingTopics
Then la publicación aparece en el ranking con score calculado
```

---

## 8. Dependencias

| Dependencia | Tipo | Módulo |
|-------------|------|--------|
| Apollo GraphQL (frontend) | Librería | — |
| Apollo Server (backend) | Librería | — |
| `FileStorageService` | Servicio | Infraestructura |
| `TrendingService` | Servicio | Feed (backend) |
| Cache (Redis/memoria) | Infraestructura | Trending |

---

## 9. Priorización

### MVP (Sprint 1-2)
RF-FEED-01, RF-FEED-02, RF-FEED-04, RF-FEED-05, RF-FEED-06, RF-FEED-10, RF-FEED-12

### Fase 2 (Sprint 3-4)
RF-FEED-03, RF-FEED-07, RF-FEED-08, RF-FEED-11

### Fase 3 (Post-MVP)
RF-FEED-09 (búsqueda avanzada)

---

## 10. TODOs

| ID | Tarea | Prioridad | Esfuerzo |
|----|-------|-----------|----------|
| TODO-FEED-01 | Implementar trending con Redis (cache con expiración 15 min) | Alta | 8h |
| TODO-FEED-02 | Soporte para Markdown en el editor de publicaciones | Alta | 6h |
| TODO-FEED-03 | Lazy loading de imágenes en el feed | Alta | 4h |
| TODO-FEED-04 | Optimistic UI para creación de posts | Media | 5h |
| TODO-FEED-05 | Filtro por tags y categorías en el feed | Media | 6h |
| TODO-FEED-06 | Búsqueda full-text de publicaciones | Media | 10h |
| TODO-FEED-07 | Posts fijados (pinned) al inicio del feed | Media | 5h |
| TODO-FEED-08 | Cola de publicación offline con sincronización | Baja | 10h |
| TODO-FEED-09 | Encuestas dentro de publicaciones | Baja | 8h |
| TODO-FEED-10 | Tests de integración: mutations y queries GraphQL | Alta | 10h |
| TODO-FEED-11 | Algoritmo de trending mejorado con decay temporal | Media | 6h |
| TODO-FEED-12 | Moderación: reportar publicación desde el frontend | Media | 4h |
