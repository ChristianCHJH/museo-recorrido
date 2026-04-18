import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { SesionesVisitaServicio } from '@features/museo/servicios/sesiones-visita.servicio';
import { catchError, map, of } from 'rxjs';

export const guardiaVisita: CanActivateFn = () => {
  const sesionServicio = inject(SesionesVisitaServicio);
  const router = inject(Router);
  const token = sesionServicio.obtenerToken();

  if (!token) {
    router.navigate(['/']);
    return false;
  }

  return sesionServicio.verificarToken(token).pipe(
    map(() => true),
    catchError(() => {
      sesionServicio.limpiarToken();
      router.navigate(['/']);
      return of(false);
    })
  );
};
