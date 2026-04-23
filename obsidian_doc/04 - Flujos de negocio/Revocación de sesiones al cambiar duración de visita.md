---
titulo: Revocación de sesiones al cambiar duración de visita
tipo: flujo
modulo: configuracion-museo
tags:
  - backend
  - sesiones-visita
  - configuracion-museo
  - correccion
  - dependencia-circular
ultima_actualizacion: 2026-04-23
estado: completo
---

# Revocación de sesiones al cambiar duración de visita

**Fecha de implementación:** 2026-04-23
**Actor principal:** Administrador
**Módulos involucrados:** `configuracion-museo`, `sesiones-visita`

Corrección del comportamiento donde cambiar `duracionSesionVisitaMinutos` en la configuración del museo no tenía efecto sobre las sesiones activas existentes. Complementa las correcciones anteriores documentadas en [[Correcciones sistema de tokens QR y sesiones de visita]].

---

## El problema

Cuando el administrador actualizaba el campo `duracionSesionVisitaMinutos` en la UI, el nuevo valor se persistía en la BD correctamente, pero **las sesiones de visita activas en ese momento seguían expirando según la duración anterior**.

La causa raíz estaba en `SesionesVisitaServicio.iniciarSesion()`: si ya existía una sesión activa y no expirada para un QR, el método la devolvía tal cual (corrección del [[Correcciones sistema de tokens QR y sesiones de visita#Corrección 2 Reutilizar sesión activa existente|Bug 1 anterior]]) sin aplicar la nueva duración. La nueva configuración solo afectaría sesiones creadas después de que las antiguas expiraran naturalmente.

> [!danger] Impacto en operación real
> Si el administrador reducía la duración de 60 a 5 minutos esperando que los visitantes activos perdieran acceso pronto, estos podían seguir navegando hasta que su sesión original (creada con 60 minutos) expirara. El cambio era silenciosamente ignorado.

---

## Solución implementada: Opción A — Revocación masiva automática

Al guardar una nueva duración de sesión, el sistema revoca todas las sesiones activas de forma inmediata. El próximo escaneo de cualquier QR creará una sesión nueva calculada con la duración actualizada.

> [!warning] Consecuencia para los visitantes
> Los visitantes con sesión activa en el momento del cambio perderán acceso y deberán volver a escanear el QR. Esto es comportamiento esperado e intencional: garantiza que la nueva configuración sea efectiva de forma inmediata.

---

## Archivos modificados

### 1. `sesiones-visita.servicio.ts` — Nuevo método `revocarTodasSesionesActivas`

Se agregó el método que ejecuta un UPDATE masivo sobre la tabla de sesiones:

```typescript
async revocarTodasSesionesActivas(): Promise<void> {
  await this.modeloSesion.update(
    { estado: false },
    { where: { estado: true, eliminado: false } },
  );
}
```

La operación es un UPDATE directo (sin iterar registro a registro) para minimizar el impacto en rendimiento. Solo afecta registros con `eliminado: false`, respetando el soft-delete del sistema.

También se decoró la inyección de `ConfiguracionMuseoServicio` con `@Inject(forwardRef(...))` para resolver la dependencia circular (detallado abajo):

```typescript
@Inject(forwardRef(() => ConfiguracionMuseoServicio))
private readonly configuracionServicio: ConfiguracionMuseoServicio,
```

---

### 2. `configuracion-museo.servicio.ts` — Llamada en `actualizar()`

Se inyectó `SesionesVisitaServicio` con `forwardRef` y se agregó la llamada condicional dentro de `actualizar()`:

```typescript
async actualizar(dto: ActualizarConfiguracionMuseoDto): Promise<ConfiguracionMuseoEntidad> {
  const configuracion = await this.obtener();
  const resultado = await configuracion.update({ ...dto });
  if (dto.duracionSesionVisitaMinutos !== undefined) {
    await this.sesionesServicio.revocarTodasSesionesActivas();
  }
  return resultado;
}
```

> [!info] Por qué la condición con `undefined`
> El DTO usa `ActualizarConfiguracionMuseoDto` (campos opcionales). Si el administrador guarda otros campos de configuración sin tocar la duración, `duracionSesionVisitaMinutos` llega como `undefined` y la revocación no se dispara. La revocación solo ocurre cuando ese campo está presente en el payload enviado.

---

### 3. Módulos con `forwardRef` — Resolución de dependencias circulares

El cambio generó una cadena de dependencias circulares que requirió ajustes en tres módulos:

#### `configuracion-museo.modulo.ts`

```typescript
imports: [
  SequelizeModule.forFeature([ConfiguracionMuseoEntidad]),
  forwardRef(() => SesionesVisitaModulo),
],
```

#### `sesiones-visita.modulo.ts`

```typescript
imports: [
  SequelizeModule.forFeature([SesionVisitaEntidad, RegistroAccesoQrEntidad]),
  CodigosQrModulo,
  forwardRef(() => SeccionesRecorridoModulo),
  forwardRef(() => ConfiguracionMuseoModulo),
],
```

#### `secciones-bloques.modulo.ts`

```typescript
imports: [
  SequelizeModule.forFeature([SeccionBloqueEntidad]),
  forwardRef(() => SesionesVisitaModulo),
],
```

Este último módulo resolvía una dependencia circular indirecta en la cadena:

```
ConfiguracionMuseoModulo
  → SesionesVisitaModulo
    → SeccionesRecorridoModulo
      → SeccionesBloquesModulo
        → SesionesVisitaModulo  ← cierra el ciclo
```

---

## Lecciones técnicas: dependencias circulares en NestJS

> [!tip] Regla de los dos lados
> Cuando dos módulos NestJS se importan mutuamente, **ambos** lados necesitan `forwardRef()`:
> - En el `@Module({ imports: [...] })` del módulo
> - En el `constructor()` del servicio que inyecta la dependencia del otro módulo

> [!warning] Circulares indirectas también causan el error
> Una dependencia circular `A → B → C → D → B` produce el error `"module at index [N] is undefined"` igual que una directa. Hay que identificar el eslabón que cierra el ciclo y aplicar `forwardRef` en ese punto.

---

## Flujo completo corregido

```
1. Administrador abre la configuración del museo en la UI
2. Cambia el campo "Duración de sesión de visita" (ej: de 15 a 30 minutos)
3. Guarda el formulario → PATCH /api/museo/configuracion

4. ConfiguracionMuseoServicio.actualizar():
   a. Persiste el nuevo valor en la BD
   b. Detecta que duracionSesionVisitaMinutos está en el DTO
   c. Llama a SesionesVisitaServicio.revocarTodasSesionesActivas()
      → UPDATE sesiones_visita SET estado = false
        WHERE estado = true AND eliminado = false

5. Todas las sesiones activas quedan con estado = false

6. Visitante activo intenta cargar /visita/{seccionId}:
   → guardiaVisita llama a verificarToken
   → sesion.estado === false → UnauthorizedException('Sesión revocada')
   → El guard redirige al visitante a la página de inicio

7. Visitante escanea el QR nuevamente:
   → iniciarSesion() no encuentra sesión activa vigente
   → Crea nueva sesión con fechaExpiracion = ahora + 30 minutos (nueva duración)
```

---

## Tabla resumen de archivos

| Archivo | Cambio |
|---------|--------|
| `sesiones-visita/sesiones-visita.servicio.ts` | Nuevo método `revocarTodasSesionesActivas()`; `@Inject(forwardRef(...))` en `ConfiguracionMuseoServicio` |
| `sesiones-visita/sesiones-visita.modulo.ts` | `forwardRef(() => ConfiguracionMuseoModulo)` en imports |
| `configuracion-museo/configuracion-museo.servicio.ts` | Inyección de `SesionesVisitaServicio`; llamada condicional en `actualizar()` |
| `configuracion-museo/configuracion-museo.modulo.ts` | `forwardRef(() => SesionesVisitaModulo)` en imports |
| `secciones-bloques/secciones-bloques.modulo.ts` | `forwardRef(() => SesionesVisitaModulo)` en imports |

---

## Ver también

- [[Correcciones sistema de tokens QR y sesiones de visita]] — correcciones anteriores del mismo módulo (expiración real del token, redirect server-side)
- [[MOC Principal]]
