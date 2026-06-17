# Requerimientos: Marcadores y Colecciones Guardadas

## 1. Visión General

Sistema personal que permite a los estudiantes guardar publicaciones, hilos de discusión y recursos académicos en colecciones privadas organizadas en carpetas para su revisión posterior.

---

## 2. Requerimientos Funcionales

| ID | Requerimiento | Prioridad | Estimación |
|----|--------------|-----------|------------|
| RF-BMK-01 | El sistema debe permitir crear colecciones con nombre único por usuario | Alta | 5 pts |
| RF-BMK-02 | El sistema debe permitir guardar publicaciones en colecciones | Alta | 5 pts |
| RF-BMK-03 | El sistema debe permitir guardar recursos académicos en colecciones | Alta | 5 pts |
| RF-BMK-04 | El sistema debe permitir guardar eventos en colecciones | Alta | 5 pts |
| RF-BMK-05 | El sistema debe listar colecciones del usuario con conteo de items | Alta | 5 pts |
| RF-BMK-06 | El sistema debe mostrar contenido de una colección (items guardados) | Alta | 5 pts |
| RF-BMK-07 | El sistema debe permitir eliminar items de una colección | Alta | 3 pts |
| RF-BMK-08 | El sistema debe permitir eliminar colección (sin afectar originales) | Alta | 3 pts |
| RF-BMK-09 | El sistema debe impedir duplicados en la misma colección | Alta | 3 pts |
| RF-BMK-10 | El sistema debe mostrar modal "Guardar en colección" desde cualquier publicación | Alta | 5 pts |
| RF-BMK-11 | El sistema debe reordenar items dentro de colección (drag & drop) | Media | 8 pts |
| RF-BMK-12 | El sistema debe validar límites: 20 colecciones/usuario, 200 items/colección | Alta | 3 pts |

**Total estimado:** 55 pts

---

## 3. Requerimientos No Funcionales

| ID | Requerimiento | Tipo | Métrica |
|----|--------------|------|---------|
| RNF-BMK-01 | Modal de guardar debe abrir en < 200ms | UX | 200ms |
| RNF-BMK-02 | Colecciones privadas por defecto (solo dueño) | Seguridad | — |
| RNF-BMK-03 | Item duplicado = idempotente (retorna existente) | Consistencia | — |
| RNF-BMK-04 | Eliminar colección no afecta originales | Integridad | — |
| RNF-BMK-05 | Límite 20 colecciones, 200 items/colección | Escalabilidad | — |

---

## 4. Historias de Usuario

**HU-BMK-01:** Como estudiante, quiero guardar publicaciones interesantes para leerlas después.
**HU-BMK-02:** Como estudiante, quiero organizar mis guardados en carpetas por temas.
**HU-BMK-03:** Como estudiante, quiero guardar recursos académicos en mi colección de estudio.
**HU-BMK-04:** Como estudiante, quiero acceder rápidamente a mis colecciones desde el menú.

---

## 5. Reglas de Negocio

| ID | Regla | Descripción |
|----|-------|-------------|
| RN-BMK-01 | Nombre único | Por usuario, no global (dos usuarios pueden tener "Favoritos") |
| RN-BMK-02 | Privacidad | Todas las colecciones son privadas por defecto |
| RN-BMK-03 | Sin duplicados | Unique (collection_id, item_id, item_type) |
| RN-BMK-04 | Límites | 20 colecciones/usuario, 200 items/colección |
| RN-BMK-05 | Soft delete colección | No cascada a items originales |

---

## 6. Casos de Uso

### CU-BMK-01: Guardar publicación en colección
1. Estudiante hace clic en "Guardar" en una publicación
2. Modal muestra colecciones existentes + opción "Nueva colección"
3. Estudiante selecciona colección (o crea una nueva)
4. Mutation `saveItemToCollection(input)`
5. Sistema verifica duplicado: si existe, retorna item existente
6. Sistema verifica límites de colección
7. Sistema persiste `CollectionItem`
8. Feedback visual "Guardado"

### CU-BMK-02: Reordenar items drag & drop
1. Estudiante arrastra item a nueva posición
2. Frontend actualiza orden visual (optimistic)
3. Mutation `reorderCollectionItems(collectionId, orderedIds)`
4. Sistema actualiza campo `order` en `CollectionItem`
5. Sistema retorna colección actualizada

---

## 7. Criterios de Aceptación

### CA-BMK-01: Guardar sin duplicados
```
Given una publicación ya guardada en colección "Favoritos"
When el estudiante intenta guardarla nuevamente en la misma colección
Then el sistema retorna el item existente (idempotente)
And itemCount no se incrementa
```

### CA-BMK-02: Límite de colecciones
```
Given un estudiante con 20 colecciones
When intenta crear una colección nueva
Then el sistema rechaza con "Maximum collections limit reached (20)"
```

---

## 8. Dependencias

| Dependencia | Módulo |
|-------------|--------|
| Apollo GraphQL | — |
| `FeedService` | Feed |
| `ResourceService` | Resources |

---

## 9. Priorización

### MVP
RF-BMK-01, RF-BMK-02, RF-BMK-05, RF-BMK-06, RF-BMK-07, RF-BMK-08, RF-BMK-09, RF-BMK-10, RF-BMK-12

### Fase 2
RF-BMK-03, RF-BMK-04, RF-BMK-11

---

## 10. TODOs

| ID | Tarea | Prioridad | Esfuerzo |
|----|-------|-----------|----------|
| TODO-BMK-01 | Modal reutilizable "Guardar en colección" como shared component | Alta | 8h |
| TODO-BMK-02 | Crear colección rápida desde el modal (inline) | Alta | 4h |
| TODO-BMK-03 | Animación de feedback al guardar (checkmark) | Media | 2h |
| TODO-BMK-04 | Colecciones compartidas (colaborativas con permisos) | Baja | 12h |
| TODO-BMK-05 | Exportar colección como lista JSON/Markdown | Baja | 5h |
| TODO-BMK-06 | Búsqueda dentro de colecciones | Media | 6h |
| TODO-BMK-07 | Sugerir colecciones basadas en contenido similar | Baja | 8h |
| TODO-BMK-08 | Tests de integración: guardar, listar, eliminar | Alta | 8h |
| TODO-BMK-09 | Etiquetas dentro de colecciones (sub-categorías) | Baja | 6h |
