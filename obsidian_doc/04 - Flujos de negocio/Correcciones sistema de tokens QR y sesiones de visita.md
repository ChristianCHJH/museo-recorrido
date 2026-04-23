---
titulo: Correcciones sistema de tokens QR y sesiones de visita
tipo: flujo
modulo: sesiones-visita
tags:
  - backend
  - frontend
  - sesiones-visita
  - codigos-qr
  - correccion
ultima_actualizacion: 2026-04-23
estado: completo
---

# Correcciones sistema de tokens QR y sesiones de visita

**Fecha de implementación:** 2026-04-23
**Módulos afectados:** [[Módulo de sesiones de visita]], backend y frontend
**Archivos modificados:** 6 archivos en backend y frontend

Este documento describe dos bugs encontrados en el sistema de escaneo de QR y las tres correcciones implementadas para resolverlos definitivamente.

---

## Contexto del sistema

Los visitantes escanean un QR físico ubicado en cada sección del museo. El sistema genera un **token UUID** (no JWT) que expira a los 15 minutos (valor configurable en BD, campo `duracion_sesion_visita_minutos`). Durante ese tiempo el visitante accede al contenido digital de esa sección.

> [!info] Token de visita vs JWT
> El token de visita es un UUID v4 aleatorio almacenado en BD, distinto al JWT de administradores. Se guarda en `sessionStorage` del navegador bajo gestión de `SesionesVisitaServicio`. No se extiende al recargar la página: `verificarToken` solo actualiza `fechaUltimoAcceso` y `totalAccesos`, nunca `fechaExpiracion`.

---

## Bugs detectados

### Bug 1: El token no expiraba realmente

**Síntoma:** Un visitante que accedía a `/r/{codigoQr}` desde el historial del navegador obtenía una sesión nueva con 15 minutos frescos, aunque su sesión original ya hubiera expirado.

**Causa raíz:** La ruta `/r/{codigo}` cargaba `EntradaQrComponent` como ruta Angular SPA. Cada vez que el componente se inicializaba llamaba a `iniciarSesion`, que creaba una sesión nueva incondicionalmente. No había ninguna verificación de si ya existía una sesión activa para ese QR.

### Bug 2: URL `/r/` quedaba en el historial del navegador

**Síntoma:** Al navegar de `/r/{codigo}` hacia `/visita/{seccionId}`, Angular usaba `pushState` por defecto, dejando ambas URLs en el historial. El visitante podía volver a `/r/` con el botón "atrás" y activar el Bug 1.

**Causa raíz:** Angular maneja `/r/` como ruta SPA normal. El navegador (Chrome/Brave) registra en `chrome://history` / `brave://history` la URL inicial antes del `navigate()`, por lo que `replaceUrl: true` en la navegación Angular no era suficiente por sí solo para evitar que `/r/` apareciera en el historial.

---

## Correcciones implementadas

### Corrección 1: `replaceUrl: true` en navegación Angular

**Archivo:** `frontend/src/app/features/visitante/entrada-qr/entrada-qr.component.ts`

`EntradaQrComponent` fue actualizado para usar `replaceUrl: true` al navegar tras crear la sesión:

```typescript
this.router.navigate(['/visita', respuesta.seccionId], { replaceUrl: true });
```

> [!warning] Esta corrección es parcial
> Ayuda con el botón "atrás" del navegador dentro de la SPA, pero no impide que Chrome/Brave registren la URL `/r/` en su historial global (`chrome://history`). La solución definitiva es la Corrección 3.

---

### Corrección 2: Reutilizar sesión activa existente

**Archivo:** `backend/src/museo/sesiones-visita/sesiones-visita.servicio.ts`

En el método `iniciarSesion`, antes de crear una sesión nueva, se busca si ya existe una sesión activa y no expirada para el mismo código QR:

```typescript
const sesionExistente = await this.modeloSesion.findOne({
  where: {
    codigoQrId: qr.id,
    estado: true,
    eliminado: false,
    fechaExpiracion: { [Op.gt]: new Date() },
  },
  order: [['fechaCreacion', 'DESC']],
});

if (sesionExistente) {
  return { token: sesionExistente.token, seccionId: qr.seccionId };
}
```

**Resultado:** Si el visitante accede a `/r/` múltiples veces mientras la sesión sigue activa, siempre recibe el **mismo token** sin resetear el contador de 15 minutos. La expiración se mantiene fija desde la creación original de la sesión.

> [!tip] Combinación con Corrección 3
> Esta corrección funciona tanto para el flujo antiguo (`EntradaQrComponent`) como para el nuevo flujo de redirect server-side. Es una defensa en profundidad: aunque alguna vía logre llamar a `iniciarSesion` nuevamente, el timer no se reinicia.

---

### Corrección 3: Redirect server-side (solución definitiva)

Esta es la corrección principal. En lugar de que Angular maneje `/r/{codigo}` como una ruta SPA, el servidor intercepta la petición HTTP y responde con un **302 redirect** antes de que el SPA cargue. El navegador registra únicamente la URL final `/visita/{seccionId}` en su historial.

#### 3a. Nuevo endpoint en backend

**Archivo:** `backend/src/museo/sesiones-visita/sesiones-visita.controlador.ts`

```
GET /api/museo/visita/redirigir/:codigoQr
```

| Campo | Valor |
|-------|-------|
| Autenticación | Ninguna (`@Publica()`) |
| Respuesta exitosa | `302 Location: /visita/{seccionId}?token={uuid}` |
| Respuesta en error | `302 Location: /` |

> [!warning] Por qué se usa `@Res()` directo y no `@Redirect()`
> El decorador `@Redirect()` de NestJS pasa por los interceptores globales de respuesta, que transforman el resultado al formato `{ datos, mensaje, exito }`. Esto interfiere con el header `Location`. Con `@Res()` se escribe la respuesta Express directamente, evitando esa capa.

#### 3b. Proxy de desarrollo

**Archivo:** `frontend/proxy.conf.json`

```json
"/r": {
  "target": "http://host.docker.internal:3000",
  "secure": false,
  "changeOrigin": false,
  "autoRewrite": true,
  "logLevel": "info",
  "pathRewrite": { "^/r": "/api/museo/visita/redirigir" }
}
```

> [!danger] `changeOrigin: false` es crítico
> Con `changeOrigin: true`, el proxy reescribe el header `Host` de la petición hacia el backend. Cuando el backend responde con `Location: /visita/...`, Express genera esa URL relativa. El proxy con `changeOrigin: true` la interpreta como relativa al host del backend (`host.docker.internal:3000`) en vez del host del navegador (`localhost:4200`), rompiendo el redirect. Con `changeOrigin: false` el header `Host` del navegador se preserva y el redirect llega al destino correcto.

> [!info] Por qué `host.docker.internal` y no `localhost`
> El frontend corre en un contenedor Docker. Desde dentro del contenedor, `localhost` apunta al propio contenedor, no al host de Windows. `host.docker.internal` es el nombre DNS especial de Docker Desktop para Windows que apunta al host real donde escucha el backend.

#### 3c. Nginx en producción

**Archivo:** `frontend/nginx.conf`

```nginx
location /r/ {
    proxy_pass http://backend:3000/api/museo/visita/redirigir/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

En producción nginx corre junto al backend en la misma red Docker Compose, por lo que puede usar directamente el nombre de servicio `backend:3000`.

#### 3d. Guard Angular actualizado

**Archivo:** `frontend/src/app/core/guards/visita.guardia.ts`

El guard `guardiaVisita` fue extendido para leer el token desde el query param `?token=` que llega en el redirect:

```typescript
if (!token) {
  const tokenParam = route.queryParamMap.get('token');
  if (tokenParam) {
    sesionServicio.guardarToken(tokenParam);
    router.navigateByUrl(state.url.split('?')[0], { replaceUrl: true });
    return false; // primera pasada: guarda token y redirige sin query param
  }
  router.navigate(['/']);
  return false;
}
```

**Flujo en dos pasadas:**

1. El navegador llega a `/visita/{seccionId}?token={uuid}` → el guard detecta el query param, guarda el token en `sessionStorage` y navega a `/visita/{seccionId}` con `replaceUrl: true`
2. Angular re-activa el guard sin el `?token=` en la URL → ahora `obtenerToken()` devuelve el token desde `sessionStorage` → flujo normal de verificación con el backend

Esto hace que la URL visible en la barra del navegador y en el historial sea siempre `/visita/{seccionId}`, sin el token expuesto.

---

## Flujo completo corregido

```
1. Visitante escanea QR físico
   → Navegador solicita: GET localhost:4200/r/{codigo}

2. proxy.conf.json intercepta /r/
   → Reenvía a: GET http://host.docker.internal:3000/api/museo/visita/redirigir/{codigo}

3. Backend ejecuta iniciarSesion()
   → Si existe sesión activa para ese QR: devuelve token existente
   → Si no existe: crea sesión nueva con UUID y fechaExpiracion = ahora + 15min

4. Backend responde: 302 Location: /visita/{seccionId}?token={uuid}

5. Navegador sigue el redirect
   → GET localhost:4200/visita/{seccionId}?token={uuid}
   → Historial registra SOLO esta URL (la de /r/ nunca se registró)

6. Angular activa guardiaVisita (primera pasada)
   → Lee ?token= del query param
   → Guarda token en sessionStorage
   → Navega a /visita/{seccionId} con replaceUrl:true

7. guardiaVisita (segunda pasada, sin query param)
   → Lee token desde sessionStorage
   → Llama a verificarToken en backend → OK

8. Visitante accede al contenido de la sección
   → La sesión expira exactamente a los 15min desde su creación
```

---

## Verificaciones de regresión realizadas

| Verificación | Resultado |
|---|---|
| `duracion_sesion_visita_minutos` en BD | Confirmado: `15` |
| `verificarToken` no extiende `fechaExpiracion` | Confirmado: solo actualiza `fechaUltimoAcceso` y `totalAccesos` |
| Recargar `/visita/` no extiende la sesión | Confirmado |
| URL `/r/` ya no aparece en `brave://history` | Confirmado |
| Acceder a `/r/` con sesión activa devuelve mismo token | Confirmado por Corrección 2 |

---

## Archivos modificados

| Archivo | Corrección |
|---------|-----------|
| `backend/src/museo/sesiones-visita/sesiones-visita.servicio.ts` | Corrección 2: reutilizar sesión activa |
| `backend/src/museo/sesiones-visita/sesiones-visita.controlador.ts` | Corrección 3a: endpoint `redirigir` |
| `frontend/src/app/features/visitante/entrada-qr/entrada-qr.component.ts` | Corrección 1: `replaceUrl: true` |
| `frontend/src/app/core/guards/visita.guardia.ts` | Corrección 3d: leer token desde query param |
| `frontend/proxy.conf.json` | Corrección 3b: proxy `/r` → backend |
| `frontend/nginx.conf` | Corrección 3c: location `/r/` en producción |

---

## Ver también

- [[MOC Principal]]
- [[Módulo de sesiones de visita]]
- [[Módulo de códigos QR]]
