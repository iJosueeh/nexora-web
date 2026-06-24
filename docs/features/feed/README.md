# Módulo: Muro de Publicaciones e Interacción (GraphQL)

## 1. Objetivo del módulo

Gestionar la creación de publicaciones y debates estudiantiles, incorporando un panel lateral de descubrimiento que destaca los temas con mayor actividad en las últimas 24 horas.

## 2. Rutas y navegación

- `/feed` — Muro principal de publicaciones (protegido con `authGuard`)
- `/feed/post/:id` — Detalle de publicación individual
- `/feed/explore` — Explorar publicaciones y tendencias
- `/publicar` — Crear nueva publicación (protegido)

## 3. Componentes

| Componente | Propósito | Signals clave |
|------------|-----------|--------------|
| `FeedPage` | Muro principal con lista de posts | `posts`, `isLoading`, `pagination` |
| `PostCard` | Tarjeta individual de publicación | `post`, `likesCount`, `commentsCount`, `isLiked` |
| `PostDetail` | Vista detalle de publicación | `post`, `comments`, `relatedPosts` |
| `NewPublication` | Formulario de creación | `content`, `media`, `isSubmitting` |
| `TrendingSidebar` | Panel de tendencias (24h) | `trendingTopics`, `topPosts` |
| `ExplorePage` | Exploración de publicaciones | `posts`, `searchQuery`, `filters` |

## 4. Servicios y estado

- `FeedService` — Queries GraphQL (`feedPosts`, `postById`, `createPost`, `likePost`)
- `TrendingService` — Query `trendingTopics` con top actividad 24h
- Apollo GraphQL (`apollo-angular`)

## 5. Contratos de datos (interfaces)

- `Post`, `PostInput`, `Like`, `TrendingTopic` en `interfaces/feed/`

## 6. Validaciones y reglas de negocio

- Contenido mínimo 10 caracteres, máximo 2000
- Soporta Markdown básico
- Imágenes y archivos adjuntos vía UploadService
- Like toggle (dar/quitar like)
- Trending: ponderación por likes + comentarios en últimas 24h
- Paginación cursor-based

## 7. Seguridad

- Crear publicación: `authGuard`
- Leer feed público: sin autenticación (solo lectura)
- Editar/eliminar: solo autor de la publicación (ownership)

## 8. Errores y edge cases

- Red sin conexión → cola de publicación pendiente (offline queue)
- Post eliminado → placeholder "Esta publicación ya no está disponible"
- Intento de like duplicado → idempotente

## 9. Dependencias del módulo

- `apollo-angular`, `@apollo/client`
- `shared/components/post-card`, `comment-tree`
- `core/services/auth-session`

## 10. TODO / Pendientes

- Soporte para encuestas en publicaciones
- Algoritmo de trending mejorado (machine learning)
- Posts fijados por administradores
- Notificaciones de nuevas publicaciones en tiempo real
