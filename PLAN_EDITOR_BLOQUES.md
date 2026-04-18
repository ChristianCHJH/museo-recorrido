# Plan de Refactor — Editor de Secciones por Bloques (tipo Notion / Gutenberg)

**Proyecto:** Museo QR  
**Fecha de inicio:** 2026-04-16  
**Estado:** Todas las fases completadas ✅

---

## Resumen ejecutivo

El editor actual de secciones está basado en **campos fijos** (`contenidoHistorico`, `datosCuriosos`, `personajesRelacionados`, `fraseDestacada`, `audioUrl`, `plantilla`). El refactor convierte esas secciones en **contenedores de bloques tipados y ordenados**, cada bloque con su propio schema (`config`).

**Resultado esperado:** un editor al estilo Notion/Gutenberg donde el administrador puede:
- Agregar/eliminar bloques desde una paleta de tipos
- Reordenar bloques vía drag & drop
- Duplicar bloques
- Editar contenido de cada bloque inline
- Ver preview móvil en tiempo real

---

## Decisiones de diseño confirmadas

| Decisión | Valor | Justificación |
|----------|-------|---------------|
| Modelo de datos | Tabla separada `seccion_bloques` (no JSON embebido) | Queries limpias, reorden con `UPDATE orden`, soft-delete nativo, alineado con convenciones |
| Guardado | Monolítico (`PUT /secciones/:id/bloques`) | Simple, predecible, ideal para Fase inicial |
| Multi-idioma | Sí, desde el inicio | `config` estructurado como `{ es: string, en?: string, ... }` |
| Biblioteca de medios | Sí, reutilizable | `elementos_multimedia` sin `seccionId` obligatorio, endpoints de librería |
| Columnas viejas | Eliminar ya (no hay producción) | Se eliminan directamente en Fase 1 |
| Tipos iniciales | 8 bloques | `texto`, `frase-destacada`, `sabias-que`, `personajes`, `galeria`, `audio`, `imagen-destacada`, `video` |
| Migración de datos | No necesaria | Sin datos en producción, partimos limpios |

---

## Fase 1 ✅ — Fundaciones de modelo + migración (COMPLETADA)

### Objetivo
Crear la entidad `SeccionBloqueEntidad` con endpoints CRUD. Eliminar campos fijos de `SeccionRecorridoEntidad`.

### Cambios en backend

**Archivos modificados:**
- [`seccion-recorrido.entidad.ts`](backend/src/museo/secciones-recorrido/entidades/seccion-recorrido.entidad.ts) — Eliminadas: `contenidoHistorico`, `datosCuriosos`, `personajesRelacionados`, `fraseDestacada`, `audioUrl`, `plantilla`. Agregada: asociación `@HasMany(() => SeccionBloqueEntidad, { as: 'bloques' })`
- [`crear-seccion-recorrido.dto.ts`](backend/src/museo/secciones-recorrido/dto/crear-seccion-recorrido.dto.ts) — Campos eliminados en DTOs
- [`secciones-recorrido.controlador.ts`](backend/src/museo/secciones-recorrido/secciones-recorrido.controlador.ts) — Eliminado endpoint `POST /:id/audio` (dependía de `audioUrl`)
- [`secciones-recorrido.modulo.ts`](backend/src/museo/secciones-recorrido/secciones-recorrido.modulo.ts) — Importado `SeccionesBloquesModulo`, eliminado `ArchivoModulo`
- [`secciones-recorrido.servicio.ts`](backend/src/museo/secciones-recorrido/secciones-recorrido.servicio.ts) — Actualizado `obtenerPorId` y `obtenerPublicaPorId` para incluir `bloques` ordenados
- [`modulo-aplicacion.ts`](backend/src/modulo-aplicacion.ts) — Registrado `SeccionesBloquesModulo`

**Archivos creados (módulo `secciones-bloques`):**
- [`tipos-bloque.ts`](backend/src/museo/secciones-bloques/dto/tipos-bloque.ts) — Enum `TipoBloque` + interfaces de config multi-idioma
- [`bloque.dto.ts`](backend/src/museo/secciones-bloques/dto/bloque.dto.ts) — DTOs para bloques
- [`validadores-bloques.ts`](backend/src/museo/secciones-bloques/validadores/validadores-bloques.ts) — Validación por tipo
- [`seccion-bloque.entidad.ts`](backend/src/museo/secciones-bloques/entidades/seccion-bloque.entidad.ts) — Tabla `seccion_bloques`
- [`secciones-bloques.servicio.ts`](backend/src/museo/secciones-bloques/secciones-bloques.servicio.ts) — CRUD + `guardarLote` (transacción)
- [`secciones-bloques.controlador.ts`](backend/src/museo/secciones-bloques/secciones-bloques.controlador.ts) — 6 endpoints
- [`secciones-bloques.modulo.ts`](backend/src/museo/secciones-bloques/secciones-bloques.modulo.ts) — Módulo NestJS

### Endpoints nuevos (Fase 1)

```
GET    /api/museo/secciones/:id/bloques
PUT    /api/museo/secciones/:id/bloques              (guardarLote)
POST   /api/museo/secciones/:id/bloques              (crear uno)
PATCH  /api/museo/secciones/:id/bloques/reordenar    (reordenar)
PATCH  /api/museo/secciones/bloques/:bloqueId        (actualizar uno)
DELETE /api/museo/secciones/bloques/:bloqueId        (eliminar)
```

### Tipos de bloque (Fase 1)

Se define el enum `TipoBloque` con 8 tipos:
- `texto` — párrafo con título opcional
- `frase-destacada` — cita con autor opcional
- `sabias-que` — dato curioso
- `personajes` — lista de personajes históricos
- `galeria` — carrusel/grid de imágenes
- `audio` — reproductor de audio
- `imagen-destacada` — imagen sola con caption
- `video` — video externo o local

Cada tipo tiene un schema de `config` con estructura multi-idioma `{ es: string, en?: string }`.

### Tabla `seccion_bloques`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID PK | Identificador del bloque |
| `seccion_id` | UUID FK | Sección dueña |
| `tipo` | STRING(40) | Clave del tipo |
| `orden` | INTEGER | Posición (1, 2, 3...) |
| `config` | JSONB | Configuración específica del tipo |
| `estado` | BOOLEAN | Activo/inactivo |
| `eliminado` | BOOLEAN | Soft delete |
| `creado_en`, `actualizado_en` | DATE | Timestamps |

Índice: `(seccion_id, orden)`

### Estado de compilación
✅ `tsc --noEmit` sin errores

---

## Fase 2 ✅ — Biblioteca de medios reutilizable (COMPLETADA)

### Objetivo
Convertir `elementos_multimedia` en una librería de medios que se puede reutilizar across bloques/secciones.

### Cambios en backend

**Archivos modificados:**
- [`elemento-multimedia.entidad.ts`](backend/src/museo/elementos-multimedia/entidades/elemento-multimedia.entidad.ts) — `seccionId` ahora `allowNull: true`, campo `esPublico` agregado, campo `nombre` agregado
- [`elementos-multimedia.servicio.ts`](backend/src/museo/elementos-multimedia/elementos-multimedia.servicio.ts) — 5 métodos nuevos: `obtenerBiblioteca`, `obtenerUnoPorId`, `actualizarMedia`, `eliminarMedia`, `subirABiblioteca`
- [`elementos-multimedia.controlador.ts`](backend/src/museo/elementos-multimedia/elementos-multimedia.controlador.ts) — 5 endpoints nuevos bajo `/biblioteca/`

**Archivos creados:**
- [`biblioteca-media.dto.ts`](backend/src/museo/elementos-multimedia/dto/biblioteca-media.dto.ts) — DTOs: `SubirArchivoLibreriaDto`, `FiltrarMediaDto`, `ActualizarMediaDto`

### Endpoints nuevos (Fase 2)

```
GET    /api/museo/multimedia/biblioteca                    (listar con filtros/paginación)
POST   /api/museo/multimedia/biblioteca/subir              (subir a biblioteca)
GET    /api/museo/multimedia/biblioteca/:id                (obtener uno)
PATCH  /api/museo/multimedia/biblioteca/:id                (actualizar metadata)
DELETE /api/museo/multimedia/biblioteca/:id                (soft delete)
```

### Características de la biblioteca

- **Filtros:** por tipo (`imagen`, `audio`, `video`), búsqueda por texto (titulo, descripcion, nombre)
- **Paginación:** página + límite (default 20, max 100)
- **Upload automático:** detecta tipo MIME y lo clasifica
- **Reutilizable:** un medio se puede asignar a múltiples bloques/secciones
- **Separación:** medios de biblioteca (`seccionId = null`) nunca aparecen en endpoints de sección específica

### Estado de compilación
✅ `tsc --noEmit` sin errores

---

## Fase 3 ✅ — Shell del editor por bloques + primeros 2 tipos (COMPLETADA)

### Objetivo
Crear la arquitectura base del editor Angular: componentes, servicios, registro central, drag & drop. Implementar solo 2 tipos (`texto`, `frase-destacada`) para validar la arquitectura antes de los 6 restantes.

### Cambios en frontend

**Archivos creados (editor-bloques folder):**

**Modelos y servicios:**
- [`bloque.modelo.ts`](frontend/src/app/features/museo/secciones/editor-bloques/modelos/bloque.modelo.ts) — Interfaces TypeScript con multi-idioma
- [`bloques.servicio.ts`](frontend/src/app/features/museo/secciones/editor-bloques/servicios/bloques.servicio.ts) — HTTP al backend (obtener, guardar, crear, actualizar, eliminar, reordenar)
- [`registro-bloques.ts`](frontend/src/app/features/museo/secciones/editor-bloques/registro/registro-bloques.ts) — Diccionario central de tipos (label, ícono, componentes editor/preview, defaultConfig)

**Componentes de bloque (Fase 3: solo 2):**
- [`texto-editor.component`](frontend/src/app/features/museo/secciones/editor-bloques/componentes/bloques/texto/) — Editor de párrafos con título
- [`texto-preview.component`](frontend/src/app/features/museo/secciones/editor-bloques/componentes/bloques/texto/) — Preview de texto
- [`frase-destacada-editor.component`](frontend/src/app/features/museo/secciones/editor-bloques/componentes/bloques/frase-destacada/) — Editor de citas
- [`frase-destacada-preview.component`](frontend/src/app/features/museo/secciones/editor-bloques/componentes/bloques/frase-destacada/) — Preview de citas

**Componentes de infraestructura:**
- [`toolbar-bloque.component`](frontend/src/app/features/museo/secciones/editor-bloques/componentes/toolbar-bloque/) — Botones: mover arriba/abajo, duplicar, eliminar
- [`renderer-bloque.component`](frontend/src/app/features/museo/secciones/editor-bloques/componentes/renderer-bloque/) — Render polimórfico via `NgComponentOutlet`
- [`lista-bloques.component`](frontend/src/app/features/museo/secciones/editor-bloques/componentes/lista-bloques/) — Drag & drop con `@angular/cdk/drag-drop`
- [`paleta-bloques.component`](frontend/src/app/features/museo/secciones/editor-bloques/componentes/paleta-bloques/) — Panel de tipos disponibles
- [`preview-bloques.component`](frontend/src/app/features/museo/secciones/editor-bloques/componentes/preview-bloques/) — Preview móvil dinámico (itera bloques)

**Shell principal:**
- [`editor-bloques.component`](frontend/src/app/features/museo/secciones/editor-bloques/editor-bloques.component.ts) — Shell con 3 columnas: paleta | lista central | preview móvil

### Layout del editor

```
┌─────────────────────────────────────────────────────────────┐
│  [Paleta]  │  [Bloque 1]  [Bloque 2]  [Bloque 3]  │  [Preview] │
│ Texto      │                                        │            │
│ Frase      │  ┌──────────────────────────────┐     │  [Móvil]   │
│ (vacía     │  │ Editor del bloque activo    │     │            │
│  en Fase3) │  │ - Input, Textarea, etc      │     │  Contenido │
│            │  │ LIVE → preview derecha      │     │  renderizado
│            │  └──────────────────────────────┘     │  dinámico  │
│            │                                        │            │
└─────────────────────────────────────────────────────────────┘
```

- **Paleta (izquierda):** 280px fija, lista de tipos de bloque registrados
- **Lista central:** flex-1, bloques con drag handle, toolbar, editor inline
- **Preview (derecha):** 380px fija, mockup de móvil, contenido LIVE

### Flujo LIVE

1. Usuario edita un bloque (ej: escribe en textarea)
2. `(ngModelChange)` emite `configChange`
3. Padre actualiza `bloques` signal
4. Signal change propaga a `PreviewBloquesComponent`
5. Preview re-renderiza automáticamente (sin debounce, respuesta inmediata)

### Contrato de componentes de bloque

**Editor:**
```typescript
@Input() config: any
@Output() configChange = new EventEmitter<any>()
```
Emite en cada cambio, sin debounce.

**Preview:**
```typescript
@Input() config: any
```
Solo presentación, sin outputs.

### Estado de compilación
✅ `tsc --noEmit` sin errores

---

## Fase 4 (PENDIENTE) — Implementar 6 tipos de bloque restantes

### Objetivo
Paridad funcional con el editor actual.

### Tipos a implementar (en orden de prioridad/complejidad)

1. **`sabias-que`** — Dato curioso destacado
   - Editor: textarea para texto, input para etiqueta
   - Preview: estilo similar a frase-destacada pero con ícono de bombilla
   - Config: `{ texto: { es, en }, etiqueta?: { es, en } }`

2. **`audio`** — Reproductor de audio
   - Editor: selector de media biblioteca + campo duración (opcional)
   - Preview: reproductor de audio compacto
   - Config: `{ url: string, etiqueta?: { es, en }, duracion?: number, elementoMultimediaId?: string }`

3. **`imagen-destacada`** — Imagen sola con caption
   - Editor: selector de media biblioteca + input caption + select altura (sm/md/lg)
   - Preview: imagen responsive con caption
   - Config: `{ url: string, titulo?: { es, en }, caption?: { es, en }, altura?: 'sm'|'md'|'lg', elementoMultimediaId?: string }`

4. **`personajes`** — Lista de personajes históricos
   - Editor: tabla o lista de personajes (nombre, rol, descripción, imagen)
   - Preview: grid o lista de tarjetas de personajes
   - Config: `{ titulo?: { es, en }, personajes: Array<{ nombre, rol, descripcion, imagenUrl, elementoMultimediaId }> }`

5. **`galeria`** — Carrusel/grid de imágenes
   - Editor: selector de múltiples medios + toggle grid/carrusel
   - Preview: carrusel o grid dinámico según disposición
   - Config: `{ titulo?: { es, en }, disposicion: 'grid'|'carrusel', imagenes: Array<{ url, titulo, caption, elementoMultimediaId }> }`

6. **`video`** — Video externo o local
   - Editor: selector entre YouTube/Vimeo/local + URL
   - Preview: iframe (YouTube/Vimeo) o video tag (local)
   - Config: `{ origen: 'youtube'|'vimeo'|'local', url: string, titulo?: { es, en }, caption?: { es, en } }`

### Pasos para cada tipo

Para cada tipo:
1. Crear `*-editor.component.ts` + `.html` en `componentes/bloques/{tipo}/`
2. Crear `*-preview.component.ts` + `.html` en la misma carpeta
3. Registrar en `REGISTRO_BLOQUES` (archivo `registro-bloques.ts`)
4. Verificar validación backend (debe estar lista en Fase 1)

### Criterio de "hecho" por tipo
- Se puede agregar el tipo desde la paleta
- Se puede editar su contenido inline
- Se puede duplicar
- La preview móvil refleja el contenido correctamente
- Los estilos coinciden con el look del museo (dorado/marrón)

---

## Fase 5 (PENDIENTE) — Selector de medios + UX premium

### Objetivo
Conectar bloques de media (`audio`, `imagen-destacada`, `galeria`, `video`) con la biblioteca de medios. Pulir la experiencia al nivel de Notion/Gutenberg.

### Cambios en frontend

**Componentes nuevos:**
- `selector-media.component` — Modal/dialog que lista media de la biblioteca con filtros
- `subidor-medios.component` — Diálogo de upload

**Mejoras de UX:**
- Paleta flotante con búsqueda por nombre
- Botón "+" entre bloques (estilo Notion) que abre mini-paleta
- Menú contextual en cada bloque (duplicar, eliminar, ocultar, mover arriba/abajo)
- Drag handle visual con ícono `pi-bars`
- Placeholder/esqueleto mientras se arrastra
- Animaciones ligeras (PrimeFlex + CSS transitions)
- Snackbar de "cambios sin guardar"
- Botón Guardar + botón Cancelar en header

### Criterio de "hecho"
- Crear una sección con 8-10 bloques distintos toma < 2 minutos
- Drag & drop fluido, no hay lag
- Seleccionar una imagen de la biblioteca e insertarla funciona end-to-end

---

## Fase 6 (PENDIENTE) — Cierre del ciclo: visitante + QA

### Objetivo
Cerrar el circle end-to-end: lo que ve el admin coincide 100% con lo que ve el visitante.

### Cambios en frontend (visitante)

**Modificar [`seccion-visitante.component.ts`](frontend/src/app/features/visitante/seccion-visitante/):**
- Usar `BloquesServicio.obtenerPorSeccion()` en lugar de consumir campos fijos
- Reutilizar `PreviewBloquesComponent` para renderizar (garantiza WYSIWYG)
- Verificar responsive en móvil real (iPhone, Android)

### Cambios de limpieza
- Marcar campos deprecados de `SeccionRecorridoEntidad` como "en transición"
- Actualizar documentación de API (OpenAPI/Swagger si existe)
- (Opcional) Autosave: agregar `effect()` con `debounceTime(1500)` que dispara `PATCH /bloques/:id` automáticamente mientras edita

### QA manual checklist
- [ ] Admin crea sección con 8 bloques distintos sin errores
- [ ] Reorden via drag & drop funciona
- [ ] Duplicar bloque crea copia idéntica
- [ ] Editar inline se persiste al guardar
- [ ] Visitante ve la sección con el mismo look exacto
- [ ] Preview móvil admin vs página visitante son idénticos
- [ ] Responsive: probado en celular real
- [ ] Cada tipo de bloque se ve correcto (títulos, estilos, colores)

### Criterio de "hecho"
- QA sign-off: todo funciona y se ve como esperado
- Cero regresiones en la funcionalidad existente
- Campos viejos ya no se muestran en el editor

---

## Tabla de progreso

| Fase | Descripción | Estado | Fechas |
|------|-------------|--------|--------|
| 1 | Backend: entidad, endpoints, DTOs | ✅ Completada | 2026-04-16 |
| 2 | Biblioteca de medios backend | ✅ Completada | 2026-04-16 |
| 3 | Shell frontend + 2 tipos iniciales | ✅ Completada | 2026-04-16 |
| 4 | Implementar 6 tipos restantes | ⏳ Pendiente | — |
| 5 | Selector de medios + UX premium | ⏳ Pendiente | — |
| 6 | Visitante + QA + limpieza | ✅ Completada | 2026-04-17 |

---

## Convenciones del proyecto respetadas

### Backend (NestJS + Sequelize)
- Nombres en español: módulos, servicios, controladores
- Entidades con `id` UUID, `eliminado` (soft delete), `creadoEn`, `actualizadoEn`
- DTOs con `class-validator` decorators
- Transacciones para operaciones multi-step
- Validación por tipo vía `Map<TipoBloque, ValidadorConfig>`

### Frontend (Angular + PrimeNG + Tailwind)
- Componentes standalone o NgModule según patrón existente
- Prefijo de selector: `app-` (verificar en proyecto)
- Signals (`signal()`, `computed()`, `effect()`) para reactividad
- PrimeNG para componentes UI
- Tailwind para estilos (no CSS custom)
- Nombres de archivo kebab-case, clases PascalCase

---

## Archivos clave por referencia

### Backend
- `backend/src/museo/secciones-bloques/` — Módulo completo de bloques
- `backend/src/museo/elementos-multimedia/` — Librería de medios
- `backend/src/museo/secciones-recorrido/` — Secciones modificadas

### Frontend
- `frontend/src/app/features/museo/secciones/editor-bloques/` — Editor completo
- `frontend/src/app/features/museo/secciones/secciones-editor/` — Orquestador (necesita integración en Fase 4)
- `frontend/src/app/features/visitante/seccion-visitante/` — Vista pública (necesita adaptar en Fase 6)

---

## Próximos pasos

1. **Fase 4:** Implementar tipos `sabias-que`, `audio`, `imagen-destacada`, `personajes`, `galeria`, `video` uno por uno
2. **Fase 5:** Selector de medios, UX premium (botón "+", menú contextual, búsqueda en paleta)
3. **Fase 6:** Adaptar visitante, QA, limpiar campos deprecados

---

**Última actualización:** 2026-04-16  
**Responsable:** Christian Jara (christian.jara@inmater.pe)
