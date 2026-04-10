import { Injectable } from '@angular/core';
import { map } from 'rxjs';

import { HttpBaseService } from './http-base.service';

export interface UsuarioRol {
  id: number | string;
  usuarioId: number | string;
  rolId: number | string;
  estado: boolean;
  fechaCreacion: string;
  fechaActualizacion?: string | null;
  rol?: {
    id: number | string;
    rol: string;
    descripcion?: string | null;
    estado: boolean;
  };
}

export interface UsuarioRolMapeado {
  id: number | string;
  rolId: number | string;
  nombre: string;
  descripcion: string;
  estado: 'Activo' | 'Inactivo';
}

export interface VincularRolUsuarioPayload {
  usuarioId: number;
  rolId: number;
  usuarioCreacion?: number | null;
}

export interface RolNoAsignado {
  id: number;
  rol: string;
  descripcion?: string | null;
  estado: boolean;
}

export interface VincularRolesResponse {
  success: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosRolesServicio {
  constructor(private readonly http: HttpBaseService) {}

  obtenerRolesPorUsuario(usuarioId: string | number) {
    return this.http
      .get<UsuarioRol[]>(`api/autenticacion/usuarios-roles/usuario/${usuarioId}`)
      .pipe(map((response) => this.mapearRolesUsuario(response)));
  }

  vincularRolUsuario(payload: VincularRolUsuarioPayload) {
    return this.http.post<VincularRolesResponse>(
      'api/autenticacion/usuarios-roles/vincular',
      payload
    );
  }

  eliminarRolUsuario(id: string | number) {
    return this.http.delete<void>(`api/autenticacion/usuarios-roles/${id}`);
  }

  cambiarEstadoRolUsuario(id: string | number, estado: boolean) {
    return this.http.patch<UsuarioRol>(
      `api/autenticacion/usuarios-roles/${id}/estado`,
      { estado }
    );
  }

  obtenerRolesNoAsignados(usuarioId: string | number) {
    return this.http.get<RolNoAsignado[]>(
      `api/autenticacion/roles/no-asignados/usuario/${usuarioId}`
    );
  }

  private mapearRolesUsuario(response: UsuarioRol[]): UsuarioRolMapeado[] {
    if (!Array.isArray(response)) {
      return [];
    }

    return response.map((item) => ({
      id: item.id,
      rolId: item.rolId,
      nombre: item.rol?.rol || 'Sin nombre',
      descripcion: item.rol?.descripcion || 'Sin descripcion',
      estado: item.estado ? 'Activo' : 'Inactivo'
    }));
  }
}
