# ADR-001: Seguridad y Privacidad en Acceso a Secciones via QR

**Estado:** Propuesto  
**Fecha:** 2026-04-18  
**Decisor:** Christian Jara  

---

## Contexto

El sistema de Museo QR permite a visitantes acceder a secciones del recorrido escaneando códigos QR. Actualmente existen vulnerabilidades de seguridad y privacidad que permiten acceso no autorizado o prolongado a contenido que debería ser temporal y controlado.

### Problemas Identificados

1. **Sesión Persistente sin Expiración Efectiva**
   - El token de visita (`museo.visita.token`) se almacena en `sessionStorage`
   - Si un visitante recarga la página, mantiene acceso indefinidamente
   - Debería expirar tras cierto tiempo de inactividad o al cerrar sesión

2. **Reutilización del QR**
   - Un visitante puede tomar foto del QR y escanear múltiples veces
   - Cada escaneo genera una nueva sesión
   - Un QR activo puede ser compartido indefinidamente

3. **Acceso por URL Directa**
   - Si alguien obtiene la URL de la sección + token, puede acceder indefinidamente
   - No hay mecanismo que invalide el acceso tras completar el recorrido

4. **QR Activo sin Validación Efectiva**
   - El campo `activo` en QR existe pero no se valida correctamente en sesiones-visita
   - No hay forma de "pausar" un QR rápidamente sin esperar a que expire

---

## Alternativas Consideradas

### A. Solo Usar Expiración de Token (Actual)
**Pros:** Simple de implementar  
**Contras:** No previene reutilización del QR, no permite control manual

### B. Token de Una Sola Sesión (One-Time Token)
**Pros:** Máxima seguridad, una sesión por escaneo  
**Contras:** Complejo, no permite refrescar página sin volver a escanear, mala UX

### C. Combinado: Expiración + Control Activo de QR + Regeneración
**Pros:** Balance entre seguridad y usabilidad  
**Contras:** Más componentes que mantener  
**Recomendación:** ✅ **Elegida**

---

## Decisión

Implementar un sistema de seguridad de múltiples capas:

### 1. Validación de Estado del QR ✅ (URGENTE)
- En `sesiones-visita.servicio.ts` línea 39-42, validar que `qr.activo === true`
- Si está desactivado, lanzar error `BadRequestException('Este código QR está desactivado')`
- El administrador puede desactivar un QR manualmente para bloquearlo inmediatamente

### 2. Expiración de Token de Visita ✅ (YA IMPLEMENTADO)
- Token expira en 120 minutos (`DURACION_SESION_MINUTOS_DEFAULT`)
- Frontend debe capturar error 401 y redirigir a `/` (login de visitante)
- `SesionesVisitaServicio.verificarToken()` valida expiración

### 3. Validación en Cada Acceso a Recurso (NUEVO)
- Antes de retornar bloques/contenido, verificar token con `verificarToken()`
- Si token está expirado o revocado, rechazar con 401
- Frontend redirige a entrada de visitante

### 4. Regeneración de QR (FUTURO OPCIONAL)
- Endpoint `POST /api/museo/qr/:id/regenerar` genera nuevo código UUID
- Invalida QR anterior automáticamente
- Útil para secciones de alto valor o rotación programada

### 5. Límite de Sesiones por QR (FUTURO OPCIONAL)
- Limitar a N sesiones activas simultáneas por QR
- Detectar y rechazar reutilización agresiva

---

## Consecuencias

### Positivas ✅
- Visitantes no pueden acceder indefinidamente tras salir
- Administrador tiene control manual para desactivar QRs
- Compatibilidad con regulaciones de privacidad
- UX razonable: 2 horas es suficiente para un recorrido típico

### Negativas ⚠️
- Si visitante recarga página → perderá acceso si token expiró
- Requiere coordinación: no desactivar QR mientras visitantes lo usan
- Requiere guardia de visita en endpoints de contenido

### Mitigaciones
- Mostrar mensaje claro sobre duración de sesión (2h)
- Log de todas las validaciones fallidas para auditoría
- Endpoint para que visitante verifique estado de su sesión

---

## Plan de Implementación

### Fase 1: Validación de Estado QR (1-2 horas)
1. Editar `sesiones-visita.servicio.ts` para validar `qr.activo`
2. Escribir test para QR desactivado
3. Probar manualmente

### Fase 2: Proteger Endpoints de Contenido (2-3 horas)
1. Crear endpoint público `GET /api/museo/secciones/:id/bloques-publico`
2. Validar token de visita antes de retornar bloques
3. Actualizar frontend para usar nuevo endpoint
4. Documentar en Swagger

### Fase 3: Validación en Guard de Visitante (1 hora)
1. Crear o mejorar `guardiaVisita` para verificar token en cada acceso
2. Implementar redirección a entrada si token inválido

### Fase 4: Regeneración de QR (FUTURO - no urgente)
1. Nuevo endpoint `POST /api/museo/qr/:id/regenerar`
2. Pruebas e2e para flujo completo

---

## Referencias

- [sesiones-visita.servicio.ts](backend/src/museo/sesiones-visita/sesiones-visita.servicio.ts)
- [secciones-bloques.controlador.ts](backend/src/museo/secciones-bloques/secciones-bloques.controlador.ts)
- [entrada-qr.component.ts](frontend/src/app/features/visitante/entrada-qr/entrada-qr.component.ts)
- [seccion-visitante.component.ts](frontend/src/app/features/visitante/seccion-visitante/seccion-visitante.component.ts)

---

## Próximos Pasos

1. ✅ Validar estado `activo` del QR en `iniciarSesion()`
2. 🔄 Crear endpoint público para bloques con validación de token
3. 🔄 Mejorar guard de visitante
4. 📋 Documentar duración de sesión en UI
