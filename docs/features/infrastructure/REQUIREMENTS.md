# Requerimientos: Persistencia e Infraestructura en la Nube

## 1. Visión General

Configuración y documentación de la infraestructura cloud: base de datos PostgreSQL, almacenamiento S3-compatible, WebSocket, Docker, seguridad perimetral y observabilidad.

---

## 2. Requerimientos Funcionales

| ID | Requerimiento | Prioridad | Estimación |
|----|--------------|-----------|------------|
| RF-INF-01 | El sistema debe conectarse a PostgreSQL 16 con pool HikariCP | Alta | 5 pts |
| RF-INF-02 | El sistema debe gestionar migraciones de esquema con Flyway | Alta | 5 pts |
| RF-INF-03 | El sistema debe almacenar archivos multimedia en S3-compatible | Alta | 10 pts |
| RF-INF-04 | El sistema debe generar URLs prefirmadas para descarga (15 min exp) | Alta | 5 pts |
| RF-INF-05 | El sistema debe establecer conexión WebSocket STOMP con JWT | Alta | 8 pts |
| RF-INF-06 | El sistema debe exponer health checks (/api/health) | Alta | 3 pts |
| RF-INF-07 | El sistema debe configurar CORS para el frontend | Alta | 2 pts |
| RF-INF-08 | El sistema debe configurar headers de seguridad (CSP, HSTS, X-Frame) | Alta | 3 pts |
| RF-INF-09 | El sistema debe ejecutarse en Docker (docker-compose multi-servicio) | Alta | 8 pts |
| RF-INF-10 | El sistema debe tener respaldos diarios de BD | Media | 5 pts |
| RF-INF-11 | El sistema debe exponer métricas de Spring Boot Actuator | Media | 5 pts |

**Total estimado:** 59 pts

---

## 3. Requerimientos No Funcionales

| ID | Requerimiento | Tipo | Métrica |
|----|--------------|------|---------|
| RNF-INF-01 | Tiempo de conexión BD < 100ms | Rendimiento | 100ms |
| RNF-INF-02 | Upload a S3 < 3s para archivos < 5MB | Rendimiento | 3s |
| RNF-INF-03 | URLs prefirmadas expiran en 15 min | Seguridad | 15 min |
| RNF-INF-04 | Reconexión WS con backoff exponencial (3-30s) | Confiabilidad | — |
| RNF-INF-05 | Heartbeat WS cada 30s | Confiabilidad | 30s |
| RNF-INF-06 | Respaldos diarios con retención: 7d diario, 4s semanal, 12m mensual | Mantenimiento | — |
| RNF-INF-07 | CORS permite solo origen del frontend | Seguridad | — |
| RNF-INF-08 | HikariCP pool: max 20 conexiones | Rendimiento | 20 |

---

## 4. Componentes de Infraestructura

### Frontend (nexora-app)

| Servicio | Tecnología | Propósito |
|----------|-----------|-----------|
| `UploadService` | Angular + Fetch API | Carga de archivos a S3 |
| `WebSocketService` | STOMP.js + SockJS | Conexión WS en vivo |
| `SupabaseAuthService` | @supabase/supabase-js | Autenticación |
| `OfflineQueue` | IndexedDB + Signals | Cola de operaciones offline |

### Backend (nexora-core)

| Componente | Tecnología | Propósito |
|-----------|-----------|-----------|
| PostgreSQL 16 | RDBMS | Persistencia principal |
| Flyway | Migraciones | Versionado de esquema |
| HikariCP | Pool | Conexiones BD |
| S3-compatible | Storage | Archivos multimedia |
| STOMP + SockJS | WebSocket | Notificaciones en vivo |
| Spring Boot Actuator | Monitoreo | Health checks + métricas |
| Docker + docker-compose | Contenedores | Orquestación local |

---

## 5. Configuraciones críticas

### Base de Datos

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      idle-timeout: 300000
      connection-timeout: 30000
      max-lifetime: 600000
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
```

### Storage S3

| Bucket | Propósito | Acceso |
|--------|-----------|--------|
| `nexora-avatars` | Avatares de perfil | Prefirmado 15 min |
| `nexora-covers` | Portadas de perfil | Prefirmado 15 min |
| `nexora-resources` | Recursos académicos | Prefirmado 15 min |
| `nexora-posts` | Multimedia de posts | Prefirmado 15 min |

### WebSocket

```yaml
spring:
  websocket:
    max-text-message-size: 8192
    max-binary-message-size: 65536
app:
  websocket:
    heartbeat-interval: 30000
    reconnect-backoff:
      initial: 3000
      multiplier: 2
      max: 30000
```

---

## 6. Seguridad de Infraestructura

| Medida | Implementación |
|--------|---------------|
| JWT | HMAC-SHA256, expiración 24h (access) / 7d (refresh) |
| URLs prefirmadas | S3 presigned URL, expira 15 min |
| CORS | Solo origen frontend |
| CSP | Content-Security-Policy restringido |
| HSTS | Strict-Transport-Security: max-age=31536000 |
| X-Frame-Options | DENY |
| X-Content-Type-Options | nosniff |

---

## 7. Docker Compose

```yaml
services:
  db:
    image: postgres:16-alpine
    volumes: [pgdata:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U nexora"]
      interval: 10s
      timeout: 5s
      retries: 5

  core:
    build: ./nexora-core
    ports: ["8080:8080"]
    depends_on: [db]
    environment:
      - DB_URL=jdbc:postgresql://db:5432/nexora
      - JWT_SECRET=${JWT_SECRET}
      - STORAGE_ENDPOINT=${STORAGE_ENDPOINT}

  app:
    build: ./nexora-app
    ports: ["4200:80"]
    depends_on: [core]
```

---

## 8. Priorización

### MVP
RF-INF-01, RF-INF-02, RF-INF-03, RF-INF-04, RF-INF-05, RF-INF-06, RF-INF-07, RF-INF-08, RF-INF-09

### Fase 2
RF-INF-10, RF-INF-11

---

## 9. TODOs

| ID | Tarea | Prioridad | Esfuerzo |
|----|-------|-----------|----------|
| TODO-INF-01 | Configurar respaldo automático de BD (pg_dump cron) | Media | 4h |
| TODO-INF-02 | Implementar Spring Boot Actuator con métricas personalizadas | Media | 6h |
| TODO-INF-03 | Dashboard de monitoreo (Grafana + Prometheus) | Baja | 20h |
| TODO-INF-04 | Migrar a AWS S3 + CloudFront para CDN | Baja | 16h |
| TODO-INF-05 | Agregar Redis para caché de trending y sesiones | Media | 10h |
| TODO-INF-06 | Read replicas de PostgreSQL para consultas pesadas | Baja | 20h |
| TODO-INF-07 | Service Worker para caché offline de assets estáticos | Media | 8h |
| TODO-INF-08 | Compresión de imágenes en cliente antes del upload | Media | 6h |
| TODO-INF-09 | Tests de integración: conexión BD, upload S3, WS | Alta | 8h |
| TODO-INF-10 | Documentar runbook de despliegue y recuperación | Alta | 6h |
