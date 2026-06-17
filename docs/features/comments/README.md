# Módulo: Sistema de Comentarios Anidados

## 1. Objetivo del módulo

Organizar las respuestas de las publicaciones en forma de árbol jerárquico a través de un algoritmo optimizado en memoria que evita sobrecargar el servidor.

## 2. Rutas y navegación

- `/feed/post/:id` — Detalle de publicación con árbol de comentarios embebido

## 3. Componentes

| Componente | Propósito | Signals clave |
|------------|-----------|--------------|
| `CommentTree` | Árbol jerárquico de comentarios | `comments`, `expandedThreads`, `isLoading` |
| `CommentItem` | Comentario individual con acciones | `comment`, `repliesCount`, `isEditing`, `isLiked` |
| `CommentForm` | Formulario de nuevo comentario/respuesta | `content`, `parentId`, `isSubmitting`, `isReply` |

## 4. Servicios y estado

- `CommentService` — Queries/mutations GraphQL (`commentsByPost`, `createComment`, `updateComment`, `deleteComment`, `likeComment`)
- Algoritmo de armado de árbol en memoria (cliente): toma lista plana y construye jerarquía `map<parentId, children[]>` en `O(n)`

## 5. Contratos de datos (interfaces)

- `Comment`, `CommentInput`, `CommentLike` en `interfaces/comments/`

## 6. Validaciones y reglas de negocio

- Contenido mínimo 1 carácter, máximo 1000
- Anidación máxima: 3 niveles de profundidad
- Edición permitida hasta 1 hora después de publicado
- Like toggle (idempotente)
- Algoritmo en cliente: árbol plano → jerárquico sin múltiples llamadas

## 7. Seguridad

- Crear comentario: autenticado
- Editar/eliminar: solo autor del comentario
- Leer comentarios: público (en publicación pública)

## 8. Errores y edge cases

- Comentario eliminado → "Este comentario ha sido eliminado" (mantiene estructura árbol)
- Excede anidación máxima → opción deshabilitada "Responder"
- Concurrencia: optimistic UI con rollback

## 9. Dependencias del módulo

- `apollo-angular`
- `shared/utils/tree-builder` (algoritmo O(n) de armado de árbol)
- `FeedService` (post padre)

## 10. TODO / Pendientes

- Cargar respuestas bajo demanda (lazy loading de hilos profundos)
- Moderación: reportar comentarios
- Menciones con @username dentro de comentarios
