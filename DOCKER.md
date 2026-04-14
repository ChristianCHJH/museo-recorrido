# Docker Setup - Museo QR

## Prerrequisitos

- Docker Desktop instalado y corriendo
- PostgreSQL 18 corriendo en `localhost:5432` (tu máquina local)
- Base de datos `museo_qr_db` ya creada y con schema cargado

## Levantar con Docker Compose

```bash
# Desde la raíz del proyecto
docker-compose up --build
```

Esto:
1. Compila el backend (NestJS)
2. Compila y empaqueta el frontend (Angular)
3. Inicia ambos servicios
4. Backend: `http://localhost:3000/api`
5. Frontend: `http://localhost:4200`

## Verificar que todo está corriendo

```bash
# Ver logs del backend
docker logs museo-backend -f

# Ver logs del frontend
docker logs museo-frontend -f

# Ver estado de los contenedores
docker ps
```

## Detener servicios

```bash
docker-compose down
```

## Rebuild (sin caché)

```bash
docker-compose up --build --no-cache
```

## Problemas comunes

### Error: "Cannot connect to database"
- Verifica que PostgreSQL está corriendo en `localhost:5432`
- En Docker, `host.docker.internal` apunta a tu máquina host
- En Linux, usa `172.17.0.1` en lugar de `host.docker.internal`

### Error: "Cannot GET /"
- Frontend necesita compilar (puede tardar 2-3 minutos)
- Revisa logs: `docker logs museo-frontend`

### Puerto 3000 o 4200 ya en uso
- Detén otros servicios: `docker-compose down`
- O cambia los puertos en `docker-compose.yml`

## Volúmenes

El proyecto incluye volúmenes named para persistencia automática:

### Producción (docker-compose.yml)
```yaml
Volúmenes creados automáticamente:
- museo-uploads       → Archivos subidos (imágenes, videos, audio)
- museo-logs-backend  → Logs del backend
- museo-frontend-cache → Caché de builds del frontend
```

Ver volúmenes:
```bash
docker volume ls | grep museo
```

Ver contenido de un volumen:
```bash
docker run -it --rm -v museo-uploads:/data alpine ls -la /data
```

## Desarrollo con Hot-Reload

Para desarrollo con recompilación automática:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

Esto:
- Monta el código fuente (`./backend/src` y `./frontend/src`) en los contenedores
- Permite editar archivos localmente y ver cambios en tiempo real
- Crea volúmenes separados para no mezclar dev y prod

### Diferencias dev vs prod:
| Aspecto | Dev | Prod |
|---------|-----|------|
| Hot-reload | ✓ | ✗ |
| Bind mounts (src) | ✓ | ✗ |
| Volúmenes | -dev suffix | Sin suffix |
| NODE_ENV | development | production |

## Network interno

Los servicios se comunican a través de `museo-network`:
- Backend: `http://backend:3000`
- Frontend: `http://frontend:4200`

Desde el navegador accede a `http://localhost:4200`
