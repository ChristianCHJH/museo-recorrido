import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AutenticacionServicio } from '@features/autenticacion/autenticacion.servicio';

export const guardiaAutenticacion: CanActivateFn = () => {
  const servicioAutenticacion = inject(AutenticacionServicio);
  const router = inject(Router);

  return servicioAutenticacion.estaAutenticado() ? true : router.createUrlTree(['/']);
};
