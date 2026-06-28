# Requerimientos: Sistema de Comentarios Anidados

## 1. Visión General

Sistema de comentarios con estructura jerárquica en árbol (hasta 3 niveles). El servidor retorna lista plana y el cliente construye el árbol en memoria con algoritmo O(n), evitando sobrecargar el servidor con consultas recursivas.

---

## 2. Requerimientos Funcionales

| ID | Requerimiento | Prioridad | Estimación |
|----|--------------|-----------|------------|
| RF-COM-01 | El sistema debe permitir crear comentarios en publicaciones | Alta | 5 pts |
| RF-COM-02 | El sistema debe permitir responder a comentarios existentes (anidación) | Alta | 8 pts |
| RF-COM-03 | El sistema debe limitar la anidación a 3 niveles máximo | Alta | 3 pts |
| RF-COM-04 | El sistema debe retornar comentarios como lista plana con `parentId` | Alta | 5 pts |
| RF-COM-05 | El sistema debe construir el árbol jerárquico en el cliente (algoritmo O(n)) | Alta | 8 pts |
| RF-COM-06 | El sistema debe permitir editar comentario propio (ventana 1h) | Alta | 3 pts |
| RF-COM-07 | El sistema debe permitir eliminar comentario propio (soft delete) | Alta | 3 pts |
| RF-COM-08 | El sistema debe implementar like toggle en comentarios | Media | 5 pts |
| RF-COM-09 | El sistema debe mostrar "comentario eliminado" manteniendo el nodo en el árbol | Alta | 3 pts |
| RF-COM-10 | El sistema debe ordenar comentarios por más recientes o más votados | Media | 5 pts |

**Total estimado:** 48 pts

---

## 3. Requerimientos No Funcionales

| ID | Requerimiento | Tipo | Métrica |
|----|--------------|------|---------|
| RNF-COM-01 | Consulta de comentarios < 500ms para 100 comentarios | Rendimiento | 500ms |
| RNF-COM-02 | Algoritmo de árbol en cliente debe ejecutarse en < 10ms | Rendimiento | 10ms |
| RNF-COM-03 | Like en comentario debe ser instantáneo (optimistic UI) | UX | — |
| RNF-COM-04 | Anidación máxima 3 niveles para evitar UI compleja | UX | 3 niveles |
| RNF-COM-05 | Soft delete mantiene integridad del árbol | Consistencia | — |

---

## 4. Historias de Usuario

**HU-COM-01:** Como estudiante, quiero comentar en publicaciones para participar en debates.
**HU-COM-02:** Como estudiante, quiero responder a comentarios para continuar una conversación.
**HU-COM-03:** Como estudiante, quiero ver los comentarios organizados como conversaciones (árbol).
**HU-COM-04:** Como estudiante, quiero dar like a comentarios útiles.
**HU-COM-05:** Como estudiante, quiero editar mi comentario si me equivoqué.

---

## 5. Reglas de Negocio

| ID | Regla | Descripción |
|----|-------|-------------|
| RN-COM-01 | Profundidad máxima | 3 niveles desde el raíz (0: raíz, 1: respuesta, 2: respuesta de respuesta) |
| RN-COM-02 | Contenido mínimo | 1 carácter, máximo 1000 |
| RN-COM-03 | Ventana edición | Solo editable hasta 1 hora después de creado |
| RN-COM-04 | Soft delete | `isDeleted = true`, contenido oculto, nodo persiste |
| RN-COM-05 | Like único | Un like por usuario por comentario (toggle) |

---

## 6. Casos de Uso

### CU-COM-01: Algoritmo de árbol en cliente
- **Input:** Lista plana `[{id, parentId, content, ...}]`
- **Proceso:** `Map[id] → Comment`, luego asignar `children[]` según `parentId`
- **Complejidad:** O(n) tiempo, O(n) espacio
- **Output:** Árbol jerárquico con raíces (parentId = null) y children anidados

### CU-COM-02: Crear comentario
- **Mutation:** `createComment(input: CommentInput!)`
- **Validaciones:** content 1-1000, postId existe, parentId válido si aplica, profundidad ≤ 3
- **Respuesta:** `Comment` completo

### CU-COM-03: Soft delete con integridad
```
Given un comentario con 3 respuestas
When el autor elimina el comentario
Then el contenido se reemplaza por "[eliminado]"
And las respuestas hijos permanecen visibles
And el nodo se mantiene en el árbol
```

---

## 7. Criterios de Aceptación

### CA-COM-01: Árbol jerárquico correcto
```
Given 5 comentarios planos con parentIds
When el cliente ejecuta el algoritmo de árbol
Then retorna una estructura jerárquica con niveles correctos
And la complejidad es O(n)
```

### CA-COM-02: Profundidad máxima
```
Given un comentario en nivel 3 (raíz → nivel1 → nivel2 → nivel3)
When un usuario intenta responder a nivel 3
Then el sistema rechaza con mensaje "Max depth reached"
```

---

## 8. Dependencias

| Dependencia | Módulo |
|-------------|--------|
| `apollo-angular` | Feed |
| `shared/utils/tree-builder.ts` | Utils (algoritmo O(n)) |
| `FeedService` | Feed |

---

## 9. Priorización

### MVP
RF-COM-01, RF-COM-02, RF-COM-03, RF-COM-04, RF-COM-05, RF-COM-07, RF-COM-09

### Fase 2
RF-COM-06, RF-COM-08, RF-COM-10

---

## 10. TODOs

| ID | Tarea | Prioridad | Esfuerzo |
|----|-------|-----------|----------|
| TODO-COM-01 | Implementar algoritmo tree-builder en shared/utils | Alta | 4h |
| TODO-COM-02 | Cargar respuestas bajo demanda (lazy loading de hilos profundos) | Media | 8h |
| TODO-COM-03 | Botón "Reportar comentario" para moderación | Media | 4h |
| TODO-COM-04 | Menciones con @username dentro de comentarios (notificación) | Media | 6h |
| TODO-COM-05 | Ordenar por "más recientes" / "más votados" | Media | 5h |
| TODO-COM-06 | Tests unitarios del algoritmo tree-builder | Alta | 3h |
| TODO-COM-07 | Tests de integración: mutations comentarios | Alta | 6h |
| TODO-COM-08 | Editor de comentarios enriquecido (Markdown básico) | Baja | 5h |
| TODO-COM-09 | Historial de ediciones de comentario | Baja | 4h |
