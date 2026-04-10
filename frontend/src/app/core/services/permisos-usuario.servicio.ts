import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PermisosUsuarioServicio {
  private readonly permisosUsuario = signal<string[]>([]);

  readonly permisos = this.permisosUsuario.asReadonly();

  establecerPermisos(permisos: string[]) {
    this.permisosUsuario.set(permisos);
  }

  limpiarPermisos() {
    this.permisosUsuario.set([]);
  }

  tienePermiso(permiso: string): boolean {
    return this.permisosUsuario().includes(permiso);
  }

  tieneAlgunPermiso(permisos: string[]): boolean {
    const actuales = this.permisosUsuario();
    return permisos.some((p) => actuales.includes(p));
  }

  tieneTodosLosPermisos(permisos: string[]): boolean {
    const actuales = this.permisosUsuario();
    return permisos.every((p) => actuales.includes(p));
  }
}
