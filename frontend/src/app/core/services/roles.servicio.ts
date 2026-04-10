import { Injectable } from '@angular/core';
import { HttpBaseService } from './http-base.service';
import { map } from 'rxjs';

export interface Rol {
  id: number;
  rol: string;
  descripcion?: string | null;
  estado: boolean;
  usuarioCreacion?: number | null;
  usuarioActualizacion?: number | null;
  fechaCreacion?: string | null;
  fechaActualizacion?: string | null;
}

export interface CrearRolPayload {
  rol: string;
  descripcion?: string | null;
  estado?: boolean;
  usuarioCreacion?: number | null;
  usuarioActualizacion?: number | null;
}

export type ActualizarRolPayload = Partial<CrearRolPayload>;

@Injectable({
  providedIn: 'root'
})
export class RolesServicio {
  constructor(private readonly http: HttpBaseService) {}

  obtenerRoles() {
    return this.http
      .get<RolApiResponse>('api/autenticacion/roles')
      .pipe(map((response) => this.mapearRoles(response)));
  }

  crearRol(payload: CrearRolPayload) {
    return this.http.post<Rol>('api/autenticacion/roles', payload);
  }

  actualizarRol(id: number | string, payload: ActualizarRolPayload) {
    return this.http.patch<Rol>(`api/autenticacion/roles/${id}`, payload);
  }

  actualizarEstadoRol(id: number | string, estado: boolean) {
    return this.http.patch<Rol>(`api/autenticacion/roles/${id}/estado`, { estado });
  }

  private mapearRoles(response: RolApiResponse): Rol[] {
    const lista = Array.isArray(response)
      ? response
      : (response as RolApiWrapper).data || (response as RolApiWrapper).roles || [];

    return lista.map((rol) => this.mapearRol(rol));
  }

  private mapearRol(rol: RolApi): Rol {
    return {
      id: Number(rol.id),
      rol: String(rol.rol ?? ''),
      descripcion: rol.descripcion ?? null,
      estado: rol.estado ?? true,
      usuarioCreacion: rol.usuarioCreacion ?? null,
      usuarioActualizacion: rol.usuarioActualizacion ?? null,
      fechaCreacion: rol.fechaCreacion ?? null,
      fechaActualizacion: rol.fechaActualizacion ?? null
    };
  }
}

type RolApiResponse = RolApi[] | RolApiWrapper;

interface RolApiWrapper {
  data?: RolApi[];
  roles?: RolApi[];
}

interface RolApi {
  id: number | string;
  rol?: string;
  descripcion?: string | null;
  estado?: boolean;
  usuarioCreacion?: number | null;
  usuarioActualizacion?: number | null;
  fechaCreacion?: string | null;
  fechaActualizacion?: string | null;
}
