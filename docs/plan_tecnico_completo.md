# Plan técnico completo: Experiencia digital guiada para museo mediante códigos QR

> Documento generado a partir del plan de requerimientos `plan_museo_qr_autoadministrable.md` y la arquitectura existente en los prototipos de autenticación.  
> Fecha: 2026-04-10

---

## 1. Visión general del sistema

### Qué se construye

Una plataforma web de dos capas:

**Capa 1 — Panel de administración** (acceso restringido al personal del museo): interfaz Angular donde los administradores crean y gestionan exposiciones, secciones del recorrido, contenido multimedia y códigos QR, sin depender de desarrollo continuo.

**Capa 2 — Experiencia del visitante** (acceso público controlado por token temporal): interfaz Angular optimizada para móvil que el visitante ve al escanear un QR. Muestra contenido específico de la sección: título, descripción, imágenes, video, datos curiosos y navegación entre puntos del recorrido.

### Para quién

- **Visitante del museo**: usuario anónimo que accede vía QR desde su celular. No tiene cuenta. Recibe un token temporal al escanear.
- **Personal administrativo del museo**: usuario autenticado con JWT (sistema ya existente). Tiene roles y permisos para gestionar contenido.

### Tecnología

- Backend: NestJS 10 + Sequelize + PostgreSQL (sobre la base existente del prototipo de autenticación)
- Frontend: Angular 18, componentes standalone, PrimeNG 17, Signals
- ORM: Sequelize con tablas y columnas en español
- Seguridad: JWT existente para admin + tokens de sesión de visita para visitantes
- Archivos: almacenamiento local del servidor con rutas servidas como estáticos (migrable a bucket en fase 6)

---

## 2. Dominios del sistema

Se identifican siete dominios funcionales. El dominio de autenticación ya existe y no se replica; los siguientes seis son nuevos.

| # | Dominio | Descripción resumida |
| --- | --- | --- |
| 1 | **Autenticación** | JWT, roles, permisos. YA EXISTE. Se usa, no se reimplementa. |
| 2 | **Museo** | Datos institucionales del museo (nombre, logo, descripción general, configuración visual). |
| 3 | **Exposiciones** | Agrupación lógica de un conjunto de secciones (exposición permanente, temporal, etc.). |
| 4 | **Secciones del recorrido** | Cada punto del recorrido al que apunta un QR. Tiene contenido propio. |
| 5 | **Contenido multimedia** | Imágenes y videos asociados a una sección. Carga y servido de archivos. |
| 6 | **Códigos QR** | Generación, asociación a una sección y control de estado del QR. |
| 7 | **Sesiones de visita** | Token temporal emitido al escanear el QR. Controla vigencia y acceso. |

---

## 3. Modelo de datos completo

### Convenciones heredadas del prototipo

- Todas las tablas tienen: `id` (UUID PK), `estado` (BOOLEAN default true), `eliminado` (BOOLEAN default false), `creadoEn`, `actualizadoEn`.
- Soft delete siempre: nunca `DELETE` físico, siempre `eliminado = true`.
- Queries de listado siempre filtran `eliminado: false`.
- Nombres de tablas y columnas en español, snake_case en base de datos, camelCase en TypeScript.

---

### 3.1. Entidad: `configuracion_museo`

Tabla de instancia única (una sola fila). Datos institucionales globales.

| Columna | Tipo | Descripción |
| --- | --- | --- |
| id | UUID PK | |
| nombre | VARCHAR(200) | Nombre oficial del museo |
| subtitulo | VARCHAR(300) | Frase institucional o subtítulo |
| descripcion | TEXT | Descripción general del museo |
| logoUrl | VARCHAR(500) | Ruta al archivo de logo |
| colorPrimario | VARCHAR(20) | Hex del color primario (ej: #4a2c0a) |
| colorSecundario | VARCHAR(20) | Hex del color secundario |
| colorAcento | VARCHAR(20) | Hex del color de acento |
| fuentePrincipal | VARCHAR(100) | Nombre de fuente Google Fonts principal |
| sitioWeb | VARCHAR(300) | URL sitio institucional |
| correoContacto | VARCHAR(200) | |
| telefonoContacto | VARCHAR(50) | |
| direccion | VARCHAR(400) | |
| redesSociales | JSONB | `{instagram, facebook, youtube, ...}` |
| duracionSesionVisitaMinutos | INTEGER | Duración del token de visita (default: 120) |
| estado | BOOLEAN | |
| eliminado | BOOLEAN | |
| creadoEn | DATE | |
| actualizadoEn | DATE | |

---

### 3.2. Entidad: `exposiciones`

Agrupa secciones bajo un tema común. Puede ser permanente o temporal.

| Columna | Tipo | Descripción |
| --- | --- | --- |
| id | UUID PK | |
| nombre | VARCHAR(200) | Nombre de la exposición |
| descripcion | TEXT | Descripción general |
| tipo | VARCHAR(50) | `permanente` / `temporal` |
| imagenPortadaUrl | VARCHAR(500) | Imagen representativa |
| fechaInicio | DATE | Para exposiciones temporales |
| fechaFin | DATE | Para exposiciones temporales. NULL = sin vencimiento |
| orden | INTEGER | Orden de aparición en el panel |
| estado | BOOLEAN | Activo / Inactivo |
| eliminado | BOOLEAN | |
| creadoEn | DATE | |
| actualizadoEn | DATE | |

---

### 3.3. Entidad: `secciones_recorrido`

Punto específico del recorrido. Unidad atómica de contenido. Un QR apunta a una sección.

| Columna | Tipo | Descripción |
| --- | --- | --- |
| id | UUID PK | |
| exposicionId | UUID FK → exposiciones | |
| nombre | VARCHAR(200) | Nombre de la sala, pieza o etapa |
| subtitulo | VARCHAR(300) | Subtítulo opcional |
| descripcionBreve | VARCHAR(500) | Resumen corto para el encabezado |
| contenidoHistorico | TEXT | Bloque narrativo principal |
| datosCuriosos | TEXT | Datos destacados o curiosidades |
| personajesRelacionados | TEXT | Figuras históricas relevantes |
| periodoHistorico | VARCHAR(200) | Fechas o periodos (ej: "Siglo XVIII - XIX") |
| fraseDestacada | VARCHAR(500) | Cita o dato brevemente resaltado |
| orden | INTEGER | Posición dentro del recorrido de la exposición |
| imagenPrincipalUrl | VARCHAR(500) | Imagen destacada (hero de la página) |
| plantilla | VARCHAR(50) | Identificador de plantilla visual. Default: `estandar` |
| estado | BOOLEAN | Publicado / Borrador |
| eliminado | BOOLEAN | |
| creadoEn | DATE | |
| actualizadoEn | DATE | |

> **Nota:** La navegación anterior/siguiente se calcula dinámicamente por el campo `orden` en cada query. No se guardan columnas de autorreferencia para evitar inconsistencias al reordenar.

---

### 3.4. Entidad: `elementos_multimedia`

Galería de archivos (imágenes y videos) de una sección. Una sección puede tener N elementos.

| Columna | Tipo | Descripción |
| --- | --- | --- |
| id | UUID PK | |
| seccionId | UUID FK → secciones_recorrido | |
| tipo | VARCHAR(20) | `imagen` / `video_local` / `video_youtube` / `video_vimeo` |
| url | VARCHAR(500) | Ruta local o URL externa |
| urlMiniatura | VARCHAR(500) | Miniatura para galería (solo videos) |
| titulo | VARCHAR(200) | Título descriptivo del elemento |
| descripcion | VARCHAR(500) | Texto de apoyo al pie del elemento |
| esPrincipal | BOOLEAN | Si es la imagen/video destacado de la sección |
| orden | INTEGER | Orden dentro de la galería |
| pesoBytes | BIGINT | Tamaño del archivo (solo archivos locales) |
| estado | BOOLEAN | |
| eliminado | BOOLEAN | |
| creadoEn | DATE | |
| actualizadoEn | DATE | |

---

### 3.5. Entidad: `codigos_qr`

Representación lógica del QR. El QR físico apunta a una URL del sistema que lo identifica por `codigo`.

| Columna | Tipo | Descripción |
| --- | --- | --- |
| id | UUID PK | |
| seccionId | UUID FK → secciones_recorrido | Puede ser NULL si el QR no está asignado aún |
| codigo | VARCHAR(100) UNIQUE | UUID permanente del QR. Nunca cambia aunque se reasigne la sección. |
| nombreDescriptivo | VARCHAR(200) | Nombre interno (ej: "QR Sala Fundadores - pared norte") |
| imagenQrUrl | VARCHAR(500) | Imagen PNG del QR generada para imprimir |
| activo | BOOLEAN | Si el QR acepta escaneos actualmente |
| totalEscaneos | INTEGER | Contador acumulado de escaneos |
| estado | BOOLEAN | |
| eliminado | BOOLEAN | |
| creadoEn | DATE | |
| actualizadoEn | DATE | |

> **Clave de diseño:** El `codigo` del QR es permanente. Si el museo reasigna el QR a otra sección, solo cambia `seccionId`. El QR físico no necesita reimprimirse.

---

### 3.6. Entidad: `sesiones_visita`

Token de acceso temporal emitido en el primer escaneo de un QR.

| Columna | Tipo | Descripción |
| --- | --- | --- |
| id | UUID PK | |
| token | VARCHAR(200) UNIQUE | UUID v4 aleatorio (no JWT) |
| codigoQrId | UUID FK → codigos_qr | QR que originó la sesión |
| ipOrigen | VARCHAR(45) | IP del visitante al escanear |
| userAgent | TEXT | Identificación del dispositivo |
| fechaCreacion | TIMESTAMP | Momento del primer escaneo |
| fechaExpiracion | TIMESTAMP | fechaCreacion + duracionSesionVisitaMinutos |
| fechaUltimoAcceso | TIMESTAMP | Último acceso con este token |
| totalAccesos | INTEGER | Cuántas veces se usó el token |
| estado | BOOLEAN | Activo / Revocado manualmente |
| eliminado | BOOLEAN | |

---

### 3.7. Entidad: `registros_acceso_qr`

Log de auditoría de cada escaneo individual. Tabla append-only (sin soft delete).

| Columna | Tipo | Descripción |
| --- | --- | --- |
| id | UUID PK | |
| codigoQrId | UUID FK → codigos_qr | |
| sesionVisitaId | UUID FK → sesiones_visita NULL | NULL si el acceso fue rechazado |
| ipOrigen | VARCHAR(45) | |
| userAgent | TEXT | |
| resultado | VARCHAR(30) | `token_emitido` / `token_valido` / `token_expirado` / `qr_inactivo` / `seccion_inactiva` |
| fechaAcceso | TIMESTAMP | |

---

### Diagrama de relaciones

```
configuracion_museo    (1 fila global)

exposiciones
  └── secciones_recorrido  (N por exposición)
        ├── elementos_multimedia  (N por sección)
        └── codigos_qr  (N por sección, 1 activo recomendado)
              └── sesiones_visita  (N por QR)
                    └── registros_acceso_qr  (N por sesión)
```

---

## 4. API completa por módulo

Prefijo global: `/api`. Autenticación JWT requerida salvo donde se indica `@Publica` o `Token-Visita`.

### 4.1. Módulo: configuracion-museo

| Método | Ruta | Auth | Descripción |
| --- | --- | --- | --- |
| GET | `/api/museo/configuracion` | @Publica | Configuración global (usada por la experiencia del visitante) |
| GET | `/api/museo/configuracion/admin` | JWT | Configuración para el panel de administración |
| PATCH | `/api/museo/configuracion` | JWT | Actualizar configuración del museo |
| POST | `/api/museo/configuracion/logo` | JWT | Subir/reemplazar logo (multipart) |

### 4.2. Módulo: exposiciones

| Método | Ruta | Auth | Descripción |
| --- | --- | --- | --- |
| GET | `/api/exposiciones` | JWT | Listar todas (admin, incluye inactivas) |
| GET | `/api/exposiciones/publicas` | @Publica | Listar exposiciones activas (visitante) |
| GET | `/api/exposiciones/:id` | JWT | Obtener exposición por id |
| POST | `/api/exposiciones` | JWT | Crear exposición |
| PATCH | `/api/exposiciones/:id` | JWT | Actualizar exposición |
| PATCH | `/api/exposiciones/:id/estado` | JWT | Activar/desactivar exposición |
| DELETE | `/api/exposiciones/:id` | JWT | Soft delete de exposición |
| POST | `/api/exposiciones/:id/portada` | JWT | Subir imagen de portada (multipart) |
| PATCH | `/api/exposiciones/reordenar` | JWT | Actualizar orden (body: `[{id, orden}]`) |

### 4.3. Módulo: secciones-recorrido

| Método | Ruta | Auth | Descripción |
| --- | --- | --- | --- |
| GET | `/api/secciones` | JWT | Listar todas las secciones (admin) |
| GET | `/api/secciones/exposicion/:exposicionId` | JWT | Secciones de una exposición (admin) |
| GET | `/api/secciones/:id` | JWT | Obtener sección por id (admin, completa) |
| POST | `/api/secciones` | JWT | Crear sección |
| PATCH | `/api/secciones/:id` | JWT | Actualizar contenido de sección |
| PATCH | `/api/secciones/:id/estado` | JWT | Publicar / poner en borrador |
| DELETE | `/api/secciones/:id` | JWT | Soft delete |
| PATCH | `/api/secciones/reordenar` | JWT | Reordenar secciones dentro de una exposición |
| POST | `/api/secciones/:id/imagen-principal` | JWT | Subir/reemplazar imagen principal (multipart) |
| GET | `/api/secciones/publica/:id` | Token-Visita | Ver sección completa con multimedia (header `X-Visita-Token`) |

### 4.4. Módulo: elementos-multimedia

| Método | Ruta | Auth | Descripción |
| --- | --- | --- | --- |
| GET | `/api/multimedia/seccion/:seccionId` | JWT | Listar elementos de una sección (admin) |
| POST | `/api/multimedia/seccion/:seccionId/imagen` | JWT | Subir imagen nueva (multipart) |
| POST | `/api/multimedia/seccion/:seccionId/video-local` | JWT | Subir video local (multipart) |
| POST | `/api/multimedia/seccion/:seccionId/video-externo` | JWT | Agregar video YouTube/Vimeo (body: url) |
| PATCH | `/api/multimedia/:id` | JWT | Actualizar metadatos (título, descripción, orden) |
| PATCH | `/api/multimedia/:id/principal` | JWT | Marcar como elemento principal |
| PATCH | `/api/multimedia/:id/estado` | JWT | Activar/desactivar elemento |
| DELETE | `/api/multimedia/:id` | JWT | Soft delete + eliminar archivo físico |
| PATCH | `/api/multimedia/seccion/:seccionId/reordenar` | JWT | Reordenar galería |

### 4.5. Módulo: codigos-qr

| Método | Ruta | Auth | Descripción |
| --- | --- | --- | --- |
| GET | `/api/qr` | JWT | Listar todos los QRs (admin) |
| GET | `/api/qr/:id` | JWT | Obtener QR por id |
| POST | `/api/qr` | JWT | Crear QR (genera código UUID e imagen PNG) |
| PATCH | `/api/qr/:id` | JWT | Actualizar nombre descriptivo o sección asignada |
| PATCH | `/api/qr/:id/estado` | JWT | Activar/desactivar QR |
| DELETE | `/api/qr/:id` | JWT | Soft delete |
| GET | `/api/qr/:id/descargar` | JWT | Descargar imagen PNG del QR para imprimir |
| GET | `/api/qr/estadisticas/:id` | JWT | Escaneos y sesiones del QR |

### 4.6. Módulo: sesiones-visita

| Método | Ruta | Auth | Descripción |
| --- | --- | --- | --- |
| POST | `/api/visita/iniciar/:codigoQr` | @Publica | Escaneo del QR. Emite token de sesión. |
| GET | `/api/visita/verificar` | Token-Visita | Verificar validez del token (header `X-Visita-Token`) |
| GET | `/api/visita/sesiones` | JWT | Listar sesiones activas (admin, monitoreo) |
| PATCH | `/api/visita/sesiones/:id/revocar` | JWT | Revocar una sesión manualmente |
| GET | `/api/visita/logs` | JWT | Log de accesos QR con filtros |

### 4.7. Servicio interno: archivos

No es un controlador de negocio, sino un servicio NestJS compartido que:

- Recibe archivos vía `multer`
- Valida tipo MIME (solo imágenes y videos permitidos)
- Limita peso máximo configurable (sugerido: 200 MB para videos)
- Almacena en disco con ruta `/uploads/<entidad>/<id>/<uuid>.<ext>`
- Retorna la URL pública relativa

Los archivos se exponen en `/api/archivos/*` con headers de protección y validación de token de visita antes de servir.

---

## 5. Módulos Angular

### 5.1. Estructura de rutas

```
/                              → redirige a /iniciar-sesion
/iniciar-sesion                → InicioSesionComponent (ya existe)
/dashboard                     → PanelComponent con barra lateral (canActivate: guardiaAutenticacion)
/dashboard/museo               → ConfiguracionMuseoComponent
/dashboard/exposiciones        → ExposicionesListaComponent
/dashboard/exposiciones/:id    → ExposicionDetalleComponent
/dashboard/secciones/:id       → SeccionEditorComponent
/dashboard/qr                  → QrListaComponent
/dashboard/qr/:id              → QrDetalleComponent
/dashboard/visitas             → VisitasMonitoreoComponent
/dashboard/usuarios            → (ya existe en prototipo)
/dashboard/roles               → (ya existe en prototipo)

/r/:codigoQr                   → PuntoEntradaQrComponent (@Publica, inicia sesión de visita)
/visita/:seccionId             → SeccionVisitanteComponent (requiere token de visita)
/visita/:seccionId/galeria     → GaleriaVisitanteComponent
/acceso-vencido                → AccesoVencidoComponent
```

---

### 5.2. Features del panel de administración

**Feature: museo**
- `ConfiguracionMuseoComponent`: formulario con datos institucionales, upload de logo, selector de paleta de colores.

**Feature: exposiciones**
- `ExposicionesListaComponent`: tabla con nombre, tipo, periodo, cantidad de secciones, estado. Acciones: crear, editar, activar/desactivar, eliminar.
- `ExposicionDetalleComponent`: lista de secciones de la exposición con drag-and-drop para reordenar. Vista de QRs asociados.
- `ExposicionFormularioComponent`: formulario reutilizable de creación/edición.

**Feature: secciones**
- `SeccionEditorComponent`: editor completo por bloques:
  - Bloque 1: Información general (nombre, subtítulo, descripción breve, periodo, personajes, frase destacada)
  - Bloque 2: Contenido histórico (textarea; editor enriquecido en fase 2 si se requiere)
  - Bloque 3: Multimedia (galería con drag-and-drop, upload de imágenes y videos, agregar URL de YouTube)
  - Bloque 4: Configuración (estado, orden, plantilla, QR asociado)
- `SeccionVistaPreviaComponent`: panel que muestra cómo verá el visitante la sección antes de publicar.

**Feature: qr**
- `QrListaComponent`: tabla de QRs con estado, sección asignada, total de escaneos. Acciones: crear, descargar PNG, activar/desactivar, reasignar sección.
- `QrDetalleComponent`: imagen del QR grande para imprimir, estadísticas de uso, sesiones recientes.
- `QrCrearComponent`: formulario de creación con nombre descriptivo y sección a asignar.

**Feature: visitas**
- `VisitasMonitoreoComponent`: tabla de sesiones activas con token (truncado), IP, fechas, total accesos. Botón de revocar.
- `AccesosLogComponent`: tabla de log de escaneos con resultado, IP, fecha.

---

### 5.3. Features de la experiencia del visitante

Estas features NO usan el shell del panel de admin. Tienen su propio layout con identidad visual del museo (paleta histórica, fuentes elegantes, mobile-first).

**Feature: entrada-qr**
- `PuntoEntradaQrComponent`: valida el QR, emite el token de sesión y redirige a la sección. Muestra spinner con el logo del museo. Maneja errores: QR inactivo, QR sin sección asignada, sección inactiva.

**Feature: visita-seccion**
- `SeccionVisitanteComponent`: página principal del visitante. Secciones:
  - Header: logo del museo + nombre de la sección
  - Hero: imagen principal con título superpuesto
  - Descripción breve
  - Contenido histórico (HTML seguro)
  - Galería de imágenes (carrusel móvil)
  - Video principal (player embebido o nativo)
  - Datos curiosos / frase destacada
  - Navegación: botón "Sección anterior" y "Siguiente sección"

- `GaleriaVisitanteComponent`: vista expandida de la galería, imagen a pantalla completa, swipe entre imágenes.

- `NavegacionRecorridoComponent`: barra inferior fija con indicador de progreso (sección X de Y) y botones de navegación.

**Servicio: sesion-visita.servicio.ts**
- Almacena el token de visita en `sessionStorage` (se borra al cerrar el navegador).
- Expone método para verificar si el token es válido antes de cargar la sección.
- Si el token no existe o está expirado, redirige a `/acceso-vencido`.

**Guardia: guardia-visita.ts**
- `CanActivateFn` que verifica el token de visita llamando a `GET /api/visita/verificar`.
- Si la verificación falla, redirige a `/acceso-vencido`.

---

## 6. Flujos de negocio principales

### Flujo 1: Escaneo de QR por visitante

```
Visitante escanea QR con cámara del celular
  → El QR contiene: https://museo.dominio.com/r/{codigoQr}
  → Angular carga PuntoEntradaQrComponent
  → Llama POST /api/visita/iniciar/{codigoQr}
      Backend:
        1. Busca el codigoQr en codigos_qr (activo, no eliminado)
        2. Si no existe o inactivo → retorna 403
        3. Busca la sección asignada (activa)
        4. Si la sección está inactiva → retorna 503
        5. Verifica si ya hay sesión activa para esta IP + codigoQr
           (reutiliza si existe, crea nueva si no)
        6. Crea registro en sesiones_visita con fecha_expiracion = now + duracionSesionVisitaMinutos
        7. Registra en registros_acceso_qr con resultado = 'token_emitido'
        8. Retorna: { token, seccionId, exposicionId }
  → Frontend guarda token en sessionStorage
  → Frontend navega a /visita/{seccionId}
  → guardiaVisita verifica token vía GET /api/visita/verificar
  → SeccionVisitanteComponent carga GET /api/secciones/publica/{seccionId}
  → Se muestra el contenido
```

### Flujo 2: Token de visita expirado

```
Visitante con sesión expirada intenta acceder a /visita/{seccionId}
  → guardiaVisita llama GET /api/visita/verificar
  → Backend retorna 401
  → guardiaVisita redirige a /acceso-vencido
  → Página muestra mensaje con instrucciones para re-escanear
```

### Flujo 3: Gestión de contenido por administrador

```
Admin autenticado accede al panel
  → Navega a /dashboard/exposiciones
  → Crea o selecciona una exposición
  → Dentro de la exposición, crea una nueva sección:
      1. Completa información general
      2. Redacta contenido histórico
      3. Sube imagen principal
      4. Agrega elementos a la galería (imágenes y/o URLs de YouTube)
      5. Guarda (estado = borrador)
  → Asigna un QR existente o crea uno nuevo
  → Activa la sección (estado = publicado)
  → El QR ya apunta al contenido en vivo
```

### Flujo 4: Reordenamiento del recorrido

```
Admin accede a /dashboard/exposiciones/:id
  → Ve la lista de secciones ordenadas
  → Arrastra una sección a nueva posición (drag-and-drop)
  → Frontend emite PATCH /api/secciones/reordenar con [{id, orden}, ...]
  → Backend actualiza el campo orden en cada sección
  → Frontend refleja el nuevo orden sin recargar
```

### Flujo 5: Reasignación de QR a nueva sección

```
El museo necesita que un QR físico apunte a otra sección
  → Admin va a /dashboard/qr
  → Selecciona el QR → cambia la sección asignada
  → PATCH /api/qr/:id con { seccionId: nuevaSeccionId }
  → El código del QR físico no cambia
  → El visitante que escanee el mismo QR ya ve la nueva sección
```

### Flujo 6: Publicación de exposición temporal

```
El museo prepara una exposición temporal
  → Admin crea exposición con tipo = 'temporal', fecha_inicio, fecha_fin
  → Crea todas las secciones en estado borrador
  → Sube contenido multimedia
  → Genera QRs nuevos (uno por sección)
  → Imprime los QRs en etiquetas físicas
  → El día de la inauguración, activa la exposición y sus secciones
  → Al finalizar, desactiva la exposición completa (las secciones no se eliminan)
```

---

## 7. Estrategia de seguridad

### 7.1. Modelo de control de acceso del visitante

El acceso del visitante tiene **dos capas independientes**. Ambas deben estar habilitadas para que el visitante pueda ver el contenido.

```
┌─────────────────────────────────────────────────────────┐
│  CAPA 1: el administrador controla el QR (interruptor)  │
│                                                         │
│   QR apagado  →  nadie puede entrar, sin excepciones    │
│   QR encendido →  se evalúa la capa 2                   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  CAPA 2: el visitante tiene sesión válida               │
│                                                         │
│   Sin sesión o sesión expirada  →  debe re-escanear     │
│   Sesión válida (dentro del tiempo)  →  accede          │
└─────────────────────────────────────────────────────────┘
```

**Comportamiento completo:**

| Situación | Resultado |
| --- | --- |
| QR apagado + visitante escanea | No puede entrar. Página de QR inactivo. |
| QR apagado + visitante tiene URL guardada | No puede entrar. El backend rechaza aunque tenga sesión. |
| QR encendido + primer escaneo | Se emite token de sesión. Accede al contenido. |
| QR encendido + URL guardada + sesión vigente | Accede directamente (ya tiene token válido en sessionStorage). |
| QR encendido + URL guardada + sesión expirada | No puede entrar. Debe volver a escanear el QR. |
| QR encendido + cierra y vuelve a abrir el navegador | No puede entrar (sessionStorage se borra al cerrar). Debe re-escanear. |

**El administrador puede, desde el panel:**

- **Apagar un QR**: nadie puede acceder, incluso si tienen la URL o una sesión activa guardada. Efecto inmediato.
- **Encender un QR**: cualquier persona que escanee el QR puede acceder durante el recorrido.
- **Revocar una sesión específica**: invalida el token de un visitante particular (desde la vista de monitoreo).

Esta lógica aplica a cada QR de forma independiente. El museo puede tener algunos QRs encendidos y otros apagados al mismo tiempo, por ejemplo durante el armado de una nueva sala.

### 7.2. Token de sesión de visita

- UUID v4 aleatorio (no JWT) almacenado en `sesiones_visita`.
- El frontend lo guarda en `sessionStorage` (se borra al cerrar la pestaña del navegador).
- Duración configurable en `configuracion_museo.duracionSesionVisitaMinutos` (default: 120 min).
- Los endpoints del visitante requieren el header `X-Visita-Token`. Sin él o inválido → 401.
- Si la misma IP + codigoQr ya tiene sesión activa, el sistema la reutiliza en lugar de crear una nueva.
- **Aunque el visitante tenga sesión válida, si el QR está apagado el acceso se rechaza.** El campo `activo` del QR se verifica en cada request, no solo al emitir el token.

### 7.2. Protección del contenido multimedia

**Nivel 1 — Cabeceras HTTP (backend):**
- `X-Robots-Tag: noindex, nofollow` → evita indexación por buscadores
- `Cache-Control: no-store, no-cache` → evita caché del navegador
- `Content-Disposition: inline` → no sugiere descarga
- Los archivos se validan contra la sesión activa antes de servirse. Token inválido → 403.

**Nivel 2 — Frontend (disuasión):**
- `user-select: none` y `pointer-events: none` en imágenes vía CSS
- Eventos `contextmenu` y `dragstart` cancelados en el componente Angular
- Directiva Angular `sinMenuContextual` aplicada a todos los elementos multimedia
- `::selection { background: transparent; }` en áreas de contenido sensible
- Videos locales servidos con streaming parcial (HTTP Range), sin URL pública predecible

**Nivel 3 — Marca de agua (opcional fase 6):**
- Superposición CSS semitransparente con el nombre del museo sobre las imágenes.

> **Declaración importante:** Las capturas de pantalla y grabaciones de pantalla del sistema operativo no pueden bloquearse desde el navegador. El proyecto asume esta limitación (declarada en el requerimiento 10.4) y aplica una estrategia de disuasión, no de bloqueo absoluto.

### 7.3. Protección del panel de administración

- Se mantiene el sistema JWT del prototipo (access token 15 min, refresh token 30 días).
- Roles: `ADMIN_MUSEO` (acceso total), `EDITOR_CONTENIDO` (sin acceso a usuarios/configuración institucional), `LECTOR` (solo visualización).
- Los endpoints de administración usan el decorador `@Permisos()` existente para control granular.

### 7.4. Control de escaneos repetidos

- Reutilización de sesión activa si la IP + codigoQr ya tiene sesión no expirada.
- El administrador puede revocar sesiones manualmente desde el panel de monitoreo.
- Job periódico (cron NestJS) para archivar registros de `registros_acceso_qr` con más de 90 días.

---

## 8. Plan de implementación por fases

### Fase 0: Consolidación del prototipo base (prerequisito)

| # | Tarea | Detalle |
| --- | --- | --- |
| 0.1 | Verificar backend de autenticación | Ejecutar y confirmar que todos los endpoints funcionan |
| 0.2 | Verificar frontend de autenticación | Confirmar login, guards, interceptor de refresh |
| 0.3 | Variables de entorno | Definir `.env` de desarrollo y producción |
| 0.4 | Base de datos | Confirmar tablas del prototipo. Crear si no existen. |
| 0.5 | Seed inicial | Crear rol `ADMIN_MUSEO` y primer usuario administrador |

---

### Fase 1: Núcleo del contenido (backend)

| # | Tarea | Módulo |
| --- | --- | --- |
| 1.1 | Módulo `museo` + entidad `ConfiguracionMuseo`. CRUD con endpoint GET público y PATCH admin. | museo |
| 1.2 | Módulo `exposiciones` + entidad `Exposicion`. CRUD completo con reordenamiento. | exposiciones |
| 1.3 | Módulo `secciones-recorrido` + entidad `SeccionRecorrido`. CRUD completo con reordenamiento. | secciones-recorrido |
| 1.4 | Servicio `archivos`: multer, validación MIME, escritura en disco, retorno de URL. | archivos |
| 1.5 | Integrar upload de imagen principal en secciones y portada en exposiciones. | archivos |
| 1.6 | Módulo `elementos-multimedia` + entidad `ElementoMultimedia`. CRUD con upload de imágenes, videos locales y URLs externas. | elementos-multimedia |
| 1.7 | Módulo `codigos-qr` + entidad `CodigoQr`. Generación de UUID como código. Generación de imagen PNG con librería `qrcode`. CRUD y descarga. | codigos-qr |

---

### Fase 2: Panel de administración (frontend)

| # | Tarea | Feature |
| --- | --- | --- |
| 2.1 | `ConfiguracionMuseoComponent`: formulario de datos institucionales + upload de logo | museo |
| 2.2 | `ExposicionesListaComponent`: tabla PrimeNG con paginación, filtros y acciones | exposiciones |
| 2.3 | `ExposicionDetalleComponent`: lista de secciones con estado y acciones | exposiciones |
| 2.4 | `SeccionEditorComponent`: editor completo por bloques | secciones |
| 2.5 | Upload multimedia en el editor de sección | secciones |
| 2.6 | `QrListaComponent` y `QrDetalleComponent` con descarga de PNG | qr |
| 2.7 | Reordenamiento drag-and-drop de secciones (PrimeNG OrderList) | secciones |
| 2.8 | Preview de sección antes de publicar | secciones |

---

### Fase 3: Experiencia del visitante y control de acceso (backend)

| # | Tarea | Módulo |
| --- | --- | --- |
| 3.1 | Módulo `sesiones-visita` + entidad `SesionVisita`. Lógica de emisión de token. | sesiones-visita |
| 3.2 | Entidad `RegistroAccesoQr`. Lógica de logging de cada acceso. | sesiones-visita |
| 3.3 | `POST /api/visita/iniciar/:codigoQr`: valida QR, valida sección, emite token, registra log. | sesiones-visita |
| 3.4 | `GET /api/visita/verificar` con validación del header `X-Visita-Token`. | sesiones-visita |
| 3.5 | Guardia NestJS `TokenVisitaGuardia` para proteger endpoints públicos del visitante. | sesiones-visita |
| 3.6 | `GET /api/secciones/publica/:id` con `TokenVisitaGuardia`. Retorna sección completa con multimedia activo. | secciones-recorrido |
| 3.7 | Servido de archivos estáticos con cabeceras de protección y validación de token. | archivos |
| 3.8 | Endpoints de monitoreo admin: listar sesiones activas, logs de acceso, revocar sesión. | sesiones-visita |

---

### Fase 4: Experiencia del visitante (frontend)

| # | Tarea | Feature |
| --- | --- | --- |
| 4.1 | Layout independiente para el visitante: identidad visual histórica, mobile-first, tema de colores | visita |
| 4.2 | `PuntoEntradaQrComponent` para `/r/:codigoQr`. Llama al backend, guarda token, redirige. Maneja errores. | entrada-qr |
| 4.3 | `guardiaVisita` (CanActivateFn): llama a `/api/visita/verificar`, redirige si falla. | visita |
| 4.4 | `SesionVisitaServicio`: guarda/lee token de sessionStorage, método de verificación. | visita |
| 4.5 | `SeccionVisitanteComponent`: layout mobile-first con todos los bloques de contenido | visita-seccion |
| 4.6 | `NavegacionRecorridoComponent`: barra fija con progreso y botones anterior/siguiente | visita-seccion |
| 4.7 | `GaleriaVisitanteComponent`: carrusel de imágenes con swipe | visita-seccion |
| 4.8 | Player de video: embed YouTube/Vimeo y player nativo HTML5 para videos locales | visita-seccion |
| 4.9 | Directivas de protección de contenido: `sinMenuContextual`, CSS de protección, cancelación de drag | visita-seccion |
| 4.10 | Páginas de error: acceso vencido, QR inactivo, sección no disponible | visita |

---

### Fase 5: Pulido, pruebas y despliegue

| # | Tarea |
| --- | --- |
| 5.1 | `VisitasMonitoreoComponent` en panel admin: tabla de sesiones y log de accesos |
| 5.2 | Estadísticas básicas en `QrDetalleComponent`: escaneos en 24h y 7 días |
| 5.3 | Pruebas de compatibilidad móvil: iOS Safari, Chrome Android, Samsung Internet |
| 5.4 | Prueba de flujo completo: escaneo → token → contenido → expiración → mensaje de vencimiento |
| 5.5 | Build de producción Angular (`npm run build`) y NestJS (`npm run build`) |
| 5.6 | Configuración Nginx: servir frontend Angular + proxy inverso a la API NestJS |
| 5.7 | Configuración SSL/HTTPS (obligatorio para escaneo QR con cámara nativa) |
| 5.8 | Prueba de escaneo con dispositivos reales en el museo |

---

### Fase 6: Mejoras post-lanzamiento (opcional)

| # | Tarea |
| --- | --- |
| 6.1 | Mapa del recorrido: vista visual del orden de secciones para el visitante |
| 6.2 | Marca de agua CSS configurable sobre imágenes |
| 6.3 | Soporte multilenguaje (español/inglés) para el contenido del visitante |
| 6.4 | Exportación de estadísticas de visitas en CSV desde el panel |
| 6.5 | Integración con bucket de almacenamiento (S3 o compatible) para escalar archivos |
| 6.6 | Modo offline parcial (Service Worker) para red inestable dentro del museo |

---

## 9. Decisiones pendientes y riesgos

### Decisiones que requieren confirmación antes de implementar

| # | Punto | Opciones | Recomendación |
| --- | --- | --- | --- |
| D1 | **Duración de la sesión de visita** | 1h, 2h, 4h, o configurable en panel | Configurable. Valor sugerido: 120 min. Confirmar con el museo la duración típica del recorrido. |
| D2 | **Lógica de sesión con misma IP** | Emitir siempre token nuevo, o reutilizar sesión activa | Reutilizar si la IP + codigoQr ya tiene sesión no expirada. Evita proliferación en wifi compartido del museo. |
| D3 | **Navegación anterior/siguiente** | Columnas `seccionAnteriorId` / `seccionSiguienteId`, o calcular por campo `orden` | Calcular dinámicamente por `orden`. Evita inconsistencias al reordenar. |
| D4 | **Almacenamiento de archivos** | Disco local del servidor, o bucket S3/MinIO | Disco local para el lanzamiento. Preparar interfaz abstracta para migrar en Fase 6. |
| D5 | **Límite de peso de videos** | Sin límite, 100 MB, 200 MB, 500 MB | 200 MB por archivo. Documentar el límite en el panel de admin. |
| D6 | **Editor de texto del contenido histórico** | Textarea plano, Quill, TipTap, o campos separados | Campos de texto separados en la Fase 1 (más seguro, sin riesgo de XSS). Evaluar Quill con DOMPurify en Fase 2 si el museo lo requiere. |
| D7 | **Relación QR-Sección** | 1:1 estricta o N:1 libre | Relación libre en el modelo (N QRs por sección), pero la UI recomienda un QR activo por sección. Permite tener QRs de reemplazo listos. |
| D8 | **Generación de imagen PNG del QR** | Backend con librería `qrcode`, o frontend | Backend. La imagen se guarda en disco y se puede reenviar sin regenerar. |
| D9 | **HTTPS obligatorio** | — | Configurar SSL desde el inicio del despliegue. Sin HTTPS la cámara nativa del celular no abre la URL. |
| D10 | **Dominio definitivo de la URL** | — | Confirmar el dominio ANTES de imprimir los QRs físicos. El código del QR no cambia, pero la URL base sí. Usar variable de entorno `APP_URL_BASE`. |

### Riesgos identificados

| # | Riesgo | Mitigación |
| --- | --- | --- |
| R1 | Un visitante puede copiar el token de sessionStorage y compartirlo antes de que expire | Riesgo aceptado. La ventana de tiempo limitada y el no uso de localStorage mitigan el impacto. |
| R2 | La tabla `registros_acceso_qr` puede crecer rápidamente con alta afluencia | Job cron de NestJS para archivar registros con más de 90 días. Índice en `fechaAcceso` y `codigoQrId`. |
| R3 | Videos de YouTube pueden estar bloqueados en la red interna del museo | Recomendar videos locales para contenido crítico. YouTube solo para contenido complementario. |

---

## 10. Resumen ejecutivo del plan técnico

El sistema se construye en **6 fases** sobre la base de autenticación ya existente:

1. **Fase 0** (prerequisito): consolidar y validar el prototipo de autenticación como base del sistema.
2. **Fase 1** (backend): construir los 6 nuevos módulos de dominio con su API completa.
3. **Fase 2** (frontend admin): construir el panel de administración sobre la API de la Fase 1.
4. **Fase 3** (backend visitante): implementar el sistema de sesiones temporales y protección de contenido.
5. **Fase 4** (frontend visitante): construir la experiencia mobile-first del visitante con identidad visual del museo.
6. **Fase 5** (despliegue): pruebas de compatibilidad, build de producción, configuración de servidor y SSL.

El diseño prioriza la **reutilización del sistema de autenticación existente**, la **separación clara entre la experiencia del visitante y el panel de administración**, y una **estrategia de seguridad realista** que disuade sin prometer protección absoluta contra capturas de pantalla.
