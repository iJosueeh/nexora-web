# Módulo: Persistencia e Infraestructura en la Nube

## 1. Objetivo del módulo

Configuración de la base de datos relacional para resguardar la información y sistema de almacenamiento remoto para la gestión de archivos multimedia y documentos de estudio.

## 2. Configuración de entorno

### Variables requeridas (`.env`)

```env
# Base de datos
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# API
API_BASE_URL=http://localhost:8080
GRAPHQL_URL=http://localhost:8080/graphql

# Storage
STORAGE_BUCKET=nexora-media
STORAGE_URL=https://your-storage.com
```

## 3. Servicios de infraestructura

| Servicio | Propósito | Signals/Estado |
|----------|-----------|----------------|
| `SupabaseAuthService` | Autenticación con Supabase | `session`, `isAuthenticated` |
| `UploadService` | Carga de archivos a storage remoto | `uploadProgress`, `isUploading` |
| `WebSocketService` | Conexión WebSocket persistente | `connectionStatus`, `reconnectAttempts` |
| `OfflineQueue` | Cola de operaciones offline | `pendingOperations`, `isSyncing` |

## 4. Manejo de archivos multimedia

- **Formatos soportados:** JPG, PNG, WEBP, GIF (imágenes); PDF, EPUB, DOCX, PPTX (documentos)
- **Límites:** Avatar 2MB, Portada 5MB, Recursos 20MB, Posts 10MB
- **Proceso:** Validación → Compresión → Upload → URL firmada
- **Almacenamiento:** S3-compatible (Supabase Storage / AWS S3 / MinIO)

## 5. Conexiones en vivo

- WebSocket vía STOMP sobre SockJS
- Reconexión automática con backoff exponencial
- Timeout de conexión: 10s
- Heartbeat cada 30s

## 6. Estrategia de datos

- GraphQL: Apollo con caché normalizada (`InMemoryCache`)
- Operaciones offline: cola de mutations pendientes
- Sincronización al reconectar: replay de cola

## 7. Seguridad de infraestructura

- Tokens JWT expiran cada 24h (access) y 7 días (refresh)
- URLs de descarga prefirmadas con expiración de 15 minutos
- CORS configurado para origen del frontend
- Headers de seguridad: CSP, X-Frame-Options, X-Content-Type-Options

## 8. Monitoreo y observabilidad

- Estado de conexión WS visible en UI (indicador de conexión)
- Contador de operaciones offline pendientes
- Logs de errores de upload/download

## 9. TODO / Pendientes

- Service Worker para caché offline de recursos estáticos
- Estrategia de caché de Apollo optimizada para consultas frecuentes
- Compresión de imágenes en cliente antes del upload
- Monitor de rendimiento de API (tiempos de respuesta)
