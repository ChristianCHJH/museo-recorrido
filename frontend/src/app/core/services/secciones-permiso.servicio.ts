import { Injectable } from '@angular/core';

import { HttpBaseService } from './http-base.service';

export interface SeccionPermiso {
  id: number;
  nombre: string;
  descripcion?: string | null;
  estado: boolean;
  fechaCreacion?: string | null;
  fechaActualizacion?: string | null;
  usuarioCreacion?: number | null;
  usuarioActualizacion?: number | null;
}

export type CrearSeccionPermisoPayload = {
  nombre: string;
  descripcion?: string | null;
  estado?: boolean;
  usuarioCreacion?: number | null;
  usuarioActualizacion?: number | null;
};

export type ActualizarSeccionPermisoPayload = Partial<CrearSeccionPermisoPayload>;

@Injectable({
  providedIn: 'root'
})
export class SeccionesPermisoServicio {
  constructor(private readonly http: HttpBaseService) {}

  obtenerSecciones() {
    return this.http.get<SeccionPermiso[]>('api/autenticacion/secciones-permiso');
  }

  crearSeccion(payload: CrearSeccionPermisoPayload) {
    return this.http.post<SeccionPermiso>('api/autenticacion/secciones-permiso', payload);
  }

  actualizarSeccion(id: number | string, payload: ActualizarSeccionPermisoPayload) {
    return this.http.patch<SeccionPermiso>(`api/autenticacion/secciones-permiso/${id}`, payload);
  }

  eliminarSeccion(id: number | string) {
    return this.http.delete<SeccionPermiso>(`api/autenticacion/secciones-permiso/${id}`);
  }

  actualizarEstadoSeccion(id: number | string, estado: boolean) {
    return this.http.patch<SeccionPermiso>(
      `api/autenticacion/secciones-permiso/${id}/estado`,
      { estado }
    );
  }
}
