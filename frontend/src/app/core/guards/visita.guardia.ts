import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { SesionesVisitaServicio } from '@features/museo/servicios/sesiones-visita.servicio';

export const guardiaVisita: CanActivateFn = () => {
  const sesionServicio = inject(SesionesVisitaServicio);
  const router = inject(Router);
  const token = sesionServicio.obtenerToken();
  if (!token) {
    router.navigate(['/']);
    return false;
  }
  return true;
};
