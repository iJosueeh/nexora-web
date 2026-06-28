# Nexora App — Documentación de Módulos (Frontend)

Este directorio contiene la documentación funcional y técnica de cada módulo (feature) del frontend Angular.

## Objetivo

- Estandarizar la documentación de componentes, servicios y rutas.
- Describir el flujo de navegación, estado y consumo de API.
- Facilitar el onboarding de nuevos desarrolladores frontend.

## Estructura

```text
docs/
  README.md
  features/
    _template/README.md      # Plantilla para nuevos módulos
    auth/README.md           # Autenticación y Seguridad
    profile/README.md        # Configuración de Perfil
    feed/README.md           # Muro de Publicaciones e Interacción
    comments/README.md       # Sistema de Comentarios Anidados
    notifications/README.md  # Notificaciones en Vivo
    resources/README.md      # Repositorio de Recursos Académicos
    events/README.md         # Eventos y Grupos de Estudio
    bookmarks/README.md      # Marcadores y Colecciones Guardadas
    management/README.md     # Administración y Moderación
    infrastructure/README.md # Persistencia e Infraestructura
```

## Convenciones

- Cada feature tiene su carpeta en `src/app/features/<nombre>/`.
- Los componentes siguen la tríada obligatoria (`.ts` + `.html` + `.css`).
- El estado reactivo se maneja con Signals.

## Cómo documentar un nuevo módulo

1. Crear carpeta en `docs/features/<nombre-modulo>/`.
2. Copiar la plantilla desde `docs/features/_template/README.md`.
3. Describir rutas, componentes, servicios y consumo de API.
4. Mantener actualizado con cada cambio funcional.
