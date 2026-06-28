# Módulo: Marcadores y Colecciones Guardadas

## 1. Objetivo del módulo

Opción personal para que cada alumno guarde publicaciones o hilos de discusión importantes en carpetas privadas para su revisión posterior.

## 2. Rutas y navegación

- `/feed/bookmarks` — Colecciones y marcadores del usuario (protegido)
- `/feed/bookmarks/:slug` — Contenido de una colección

## 3. Componentes

| Componente | Propósito | Signals clave |
|------------|-----------|--------------|
| `BookmarksPage` | Lista de colecciones del usuario | `collections`, `isLoading` |
| `CollectionCard` | Tarjeta de colección | `collection`, `itemCount`, `lastUpdated` |
| `CollectionDetail` | Items dentro de una colección | `items`, `collection`, `isLoading` |
| `CollectionForm` | Crear/editar colección | `name`, `description`, `isSubmitting` |
| `SaveToCollectionModal` | Modal para guardar publicación | `collections`, `selectedIds`, `isSaving` |

## 4. Servicios y estado

- `BookmarkService` — Queries GraphQL (`myCollections`, `collectionItems`, `createCollection`, `savePost`, `removePost`)

## 5. Contratos de datos (interfaces)

- `Collection`, `CollectionItem`, `CreateCollectionInput` en `interfaces/bookmarks/`

## 6. Validaciones y reglas de negocio

- Nombre de colección: requerido, min 3, max 100
- Una publicación puede estar en múltiples colecciones
- Colecciones son privadas por defecto (solo el dueño las ve)
- Límite: máximo 20 colecciones por usuario, máximo 200 items por colección
- Eliminar colección no elimina las publicaciones originales

## 7. Seguridad

- Todas las rutas protegidas con `authGuard`
- Solo el dueño puede ver/editar/eliminar sus colecciones

## 8. Errores y edge cases

- Publicación ya guardada → feedback visual "Ya guardado"
- Colección llena → error al intentar agregar más items
- Publicación eliminada → item marcado como "No disponible" en la colección
- Límite de colecciones alcanzado → impedir crear más

## 9. Dependencias del módulo

- `apollo-angular`
- `features/feed/services/feed-service` (para referencia a posts)

## 10. TODO / Pendientes

- Colecciones compartidas (colaborativas)
- Exportar colección como lista
- Drag & drop para reordenar items
- Etiquetas dentro de colecciones
