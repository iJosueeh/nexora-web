# Nexora AI Coding Standards (Gemini, Copilot, Cursor)

Este documento es la fuente de verdad para cualquier IA o desarrollador que trabaje en `nexora-app`. Estas reglas garantizan un código limpio, moderno y escalable.

## 0. Sincronización Obligatoria
- **Antes de iniciar cualquier tarea:** Es mandatorio ejecutar `git pull origin dev` para asegurar que se está trabajando sobre la versión más reciente del código y evitar conflictos de fusión (merge conflicts).

## 1. Estructura y Organización
- **Tríada Obligatoria:** Todo componente debe tener sus 3 archivos (.ts, .html, .css) en su propio directorio.
- **Escalabilidad:** Si un componente padre crece en complejidad, debe dividir sus partes en la carpeta `components/` interna.
- **Encapsulamiento:** Todo archivo `.css` debe iniciar con `:host { display: block; }`.
- **Interfaces y Tipado:** Prohibido definir interfaces dentro de archivos de componentes (.ts). Cada interfaz debe tener su propio archivo (ej: `user.model.ts`) y estar agrupada en un directorio `interfaces/`.
- **Data Mocking:** Prohibido definir arrays o constantes de datos extensos dentro de los archivos de lógica (.ts). Los datos de prueba deben residir en archivos `.mock.ts` dentro de un directorio `mocks/` en el feature correspondiente.
- **Estructura de Landing (Home):** Secciones como Explorar, Pulse y Eventos que forman parte de la Landing Page deben ser subcomponentes del feature `home`, organizados para ser cargados mediante `@defer`.

## 2. Límites de Código (Legibilidad)
- **Máximo de Líneas:** Los archivos `.ts` deben mantenerse entre **150 y 200 líneas** como máximo.
- **Refactorización:** Si se exceden las 200 líneas, es mandatorio extraer la lógica a servicios, helpers o subcomponentes.

## 3. Angular Moderno
- **Control Flow:** Prohibido el uso de `*ngIf` o `*ngFor`. Utilizar exclusivamente la sintaxis `@if`, `@for`, `@switch`.
- **Reactividad:** Priorizar el uso de **Signals** (`signal`, `computed`, `effect`) para el estado del componente.
- **Standalone:** Todos los componentes, directivas y pipes deben ser `standalone: true`.

## 4. Guía para Asistentes de IA
- **Análisis Previo:** Antes de escribir código, analiza si el componente ya existe o si puede ser subdividido.
- **Contexto:** Respeta siempre los patrones visuales (editorial, dark mode, acentos rojos) y técnicos ya establecidos en el proyecto.
- **Seguridad:** Nunca sugieras ni implementes hacks que deshabiliten el sistema de tipos o las advertencias del linter.

## 5. Validación y Calidad
- **Build & Test:** Tras cada cambio o nueva funcionalidad, es mandatorio ejecutar el comando de build y las pruebas unitarias/integración relacionadas para garantizar que no hay regresiones.
- **Estado de Entrega:** Ninguna tarea se considera finalizada si el build falla o si las pruebas nuevas/existentes no pasan satisfactoriamente.
- **Documentación:** No comentar el "qué" hace el código, sino el "por qué" de decisiones complejas.
