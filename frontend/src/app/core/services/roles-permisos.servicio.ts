import { Injectable } from '@angular/core';
import { map } from 'rxjs';

import { HttpBaseService } from './http-base.service';
import { obtenerTexto, obtenerBooleano } from './api-mapper.util';

export interface RolPermiso {
  id: number | string;
  nombre: string;
  descripcion?: string | null;
  seccion: string;
  asignadoPor: string;
  fechaAsignacion: string;
}

export interface RolPermisoRelacionApi {
  id: number | string;
  rolId: number | string;
  permisoId: number | string;
  estado: boolean;
  usuarioCreacion?: number | null;
  usuarioActualizacion?: number | null;
  fechaCreacion: string;
  fechaActualizacion?: string | null;
  permiso?: {
    id: number | string;
    permiso: string;
    descripcion?: string | null;
    seccion?: {
      id: number | string;
      nombre: string;
    };
  };
  usuarioCreador?: {
    nombreUsuario?: string;
  };
  usuarioActualizador?: {
    nombreUsuario?: string;
  } | null;
}

export interface PermisoAsignableRol {
  id: number | string;
  permiso: string;
  descripcion?: string | null;
  estado: boolean;
  seccionId: number | string;
  asignado: boolean;
}

export interface SeccionPermisoRol {
  id: number | string;
  nombre: string;
  descripcion?: string | null;
  estado: boolean;
  permisos: PermisoAsignableRol[];
}

export interface VincularPermisosRolPayload {
  rolId: number;
  permisoIds: number[];
  usuarioCreacion?: number | null;
}

export interface PermisoVinculadoRol {
  id: number;
  rolId: number;
  permisoId: number;
  estado: boolean;
  usuarioCreacion?: number | null;
  fechaCreacion: string;
  fechaActualizacion?: string | null;
}

type SeccionesPermisoRolResponse =
  | SeccionPermisoRolApi[]
  | {
      data?: SeccionPermisoRolApi[];
      permisos?: SeccionPermisoRolApi[];
      items?: SeccionPermisoRolApi[];
      secciones?: SeccionPermisoRolApi[];
    };

type SeccionPermisoRolApi = Record<string, unknown>;
type PermisoAsignableRolApi = Record<string, unknown>;

@Injectable({
  providedIn: 'root'
})
export class RolesPermisosServicio {
  constructor(private readonly http: HttpBaseService) {}

  obtenerPermisosPorRol(rolId: string | number) {
    return this.http
      .get<RolPermisoRelacionApi[]>(`api/autenticacion/roles-permisos/rol/${rolId}`)
      .pipe(map((response) => this.mapearPermisosRelacion(response)));
  }

  obtenerSeccionesPermisosPorRol(rolId: string | number) {
    return this.http
      .get<SeccionesPermisoRolResponse>(`api/autenticacion/secciones-permiso/rol/${rolId}`)
      .pipe(map((response) => this.mapearSeccionesPermisos(response)));
  }

  vincularPermisosRol(payload: VincularPermisosRolPayload) {
    return this.http.post<PermisoVinculadoRol[]>(
      'api/autenticacion/roles-permisos/asignar',
      payload
    );
  }

  eliminarPermisoRol(id: string | number) {
    return this.http.delete<void>(`api/autenticacion/roles-permisos/${id}`);
  }

  private mapearPermisosRelacion(response: RolPermisoRelacionApi[]): RolPermiso[] {
    if (!Array.isArray(response)) {
      return [];
    }

    return response.map((item) => ({
      id: item.id,
      nombre: item.permiso?.permiso || 'Sin nombre',
      descripcion: item.permiso?.descripcion ?? null,
      seccion: item.permiso?.seccion?.nombre || 'Sin seccion',
      asignadoPor:
        item.usuarioActualizador?.nombreUsuario ||
        item.usuarioCreador?.nombreUsuario ||
        'Sistema',
      fechaAsignacion: item.fechaActualizacion || item.fechaCreacion
    }));
  }

  private mapearSeccionesPermisos(
    response: SeccionesPermisoRolResponse
  ): SeccionPermisoRol[] {
    const lista = Array.isArray(response)
      ? response
      : response?.data || response?.permisos || response?.items || response?.secciones || [];

    if (!Array.isArray(lista) || !lista.length) {
      return [];
    }

    return lista.map((raw, index) => this.mapearSeccionPermiso(raw, index));
  }

  private mapearSeccionPermiso(
    raw: SeccionPermisoRolApi,
    index: number
  ): SeccionPermisoRol {
    const permisosRaw = Array.isArray(raw?.['permisos'])
      ? (raw?.['permisos'] as PermisoAsignableRolApi[])
      : [];
    const permisos = permisosRaw.map((permiso, permisoIndex) =>
      this.mapearPermisoAsignable(permiso, permisoIndex, raw)
    );

    return {
      id: obtenerTexto(raw, ['id', 'seccionId']) || index + 1,
      nombre: obtenerTexto(raw, ['nombre', 'seccion']) || `Seccion ${index + 1}`,
      descripcion: obtenerTexto(raw, ['descripcion']) ?? null,
      estado: obtenerBooleano(raw, ['estado', 'activo']) ?? true,
      permisos
    };
  }

  private mapearPermisoAsignable(
    raw: PermisoAsignableRolApi,
    index: number,
    seccion?: SeccionPermisoRolApi
  ): PermisoAsignableRol {
    const seccionId =
      obtenerTexto(raw, ['seccionId']) ||
      obtenerTexto(seccion, ['id', 'seccionId']) ||
      '';

    return {
      id: obtenerTexto(raw, ['id', 'permisoId', 'idPermiso']) || index + 1,
      permiso:
        obtenerTexto(raw, ['permiso', 'nombre', 'nombrePermiso', 'permisoNombre']) ||
        `Permiso ${index + 1}`,
      descripcion: obtenerTexto(raw, ['descripcion']) ?? null,
      estado: obtenerBooleano(raw, ['estado', 'activo']) ?? true,
      seccionId,
      asignado: obtenerBooleano(raw, ['asignado']) ?? false
    };
  }
}
