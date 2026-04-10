import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { PermisosUsuarioServicio } from '@core/services/permisos-usuario.servicio';

export const guardiaPermiso =
  (...permisos: string[]): CanActivateFn =>
  () => {
    const servicioPermisos = inject(PermisosUsuarioServicio);
    const router = inject(Router);

    return servicioPermisos.tieneAlgunPermiso(permisos)
      ? true
      : router.createUrlTree(['/dashboard']);
  };
