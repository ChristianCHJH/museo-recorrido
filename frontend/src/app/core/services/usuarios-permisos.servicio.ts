import { Injectable } from '@angular/core';
import { map } from 'rxjs';

import { HttpBaseService } from './http-base.service';
import { obtenerTexto, obtenerBooleano } from './api-mapper.util';

export interface UsuarioPermiso {
  id: number | string;
  nombre: string;
  seccion: string;
  fechaAsignacion: string;
  asignadoPor: string;
}

export interface UsuarioPermisoRelacionApi {
  id: string;
  estado: boolean;
  usuarioCreacion: string;
  usuarioActualizacion: string | null;
  fechaCreacion: string;
  fechaActualizacion: string | null;
  permiso: {
    id: string;
    permiso: string;
    seccion: {
      id: string;
      nombre: string;
    };
  };
  usuarioCreador: {
    nombreUsuario: string;
  } | null;
  usuarioActualizador: {
    nombreUsuario: string;
  } | null;
}

export interface PermisoAsignableUsuario {
  id: number | string;
  permiso: string;
  descripcion?: string | null;
  estado: boolean;
  seccionId: number | string;
  asignado: boolean;
}

export interface SeccionPermisoUsuario {
  id: number | string;
  nombre: string;
  descripcion?: string | null;
  estado: boolean;
  permisos: PermisoAsignableUsuario[];
}

export interface AsignarPermisosUsuarioPayload {
  usuarioId: number | string;
  permisos: Array<number | string>;
}

export interface VincularPermisosUsuarioPayload {
  usuarioId: number;
  permisosIds: number[];
  usuarioCreacion?: number | null;
}

export interface PermisoVinculado {
  permisoId: number;
  accion: 'activado' | 'insertado';
}

export interface VincularPermisosUsuarioResponse {
  usuarioId: number;
  permisosVinculados: PermisoVinculado[];
}

type SeccionesPermisoUsuarioResponse =
  | SeccionPermisoUsuarioApi[]
  | {
      data?: SeccionPermisoUsuarioApi[];
      permisos?: SeccionPermisoUsuarioApi[];
      items?: SeccionPermisoUsuarioApi[];
      secciones?: SeccionPermisoUsuarioApi[];
    };

type SeccionPermisoUsuarioApi = Record<string, unknown>;
type PermisoAsignableUsuarioApi = Record<string, unknown>;

@Injectable({
  providedIn: 'root'
})
export class UsuariosPermisosServicio {
  constructor(private readonly http: HttpBaseService) {}

  obtenerPermisosPorUsuario(usuarioId: string | number) {
    return this.http
      .get<UsuarioPermisoRelacionApi[]>(`api/autenticacion/usuarios-permisos/usuario/${usuarioId}`)
      .pipe(map((response) => this.mapearPermisosRelacion(response)));
  }

  obtenerSeccionesPermisosPorUsuario(usuarioId: string | number) {
    return this.http
      .get<SeccionesPermisoUsuarioResponse>(`api/autenticacion/secciones-permiso/usuario/${usuarioId}`)
      .pipe(map((response) => this.mapearSeccionesPermisos(response)));
  }

  asignarPermisosUsuario(payload: AsignarPermisosUsuarioPayload) {
    return this.http.post<void>('api/autenticacion/usuarios-permisos', payload);
  }

  eliminarPermisoUsuario(id: string | number) {
    return this.http.delete<void>(`api/autenticacion/usuarios-permisos/${id}`);
  }

  vincularPermisosUsuario(payload: VincularPermisosUsuarioPayload) {
    return this.http.post<VincularPermisosUsuarioResponse>(
      'api/autenticacion/usuarios-permisos/vincular',
      payload
    );
  }

  private mapearPermisosRelacion(response: UsuarioPermisoRelacionApi[]): UsuarioPermiso[] {
    if (!Array.isArray(response)) {
      return [];
    }

    return response.map((item) => ({
      id: item.id,
      nombre: item.permiso?.permiso || 'Sin nombre',
      seccion: item.permiso?.seccion?.nombre || 'Sin sección',
      fechaAsignacion: item.fechaActualizacion || item.fechaCreacion,
      asignadoPor:
        item.usuarioActualizador?.nombreUsuario ||
        item.usuarioCreador?.nombreUsuario ||
        'Sin registrar'
    }));
  }

  private mapearSeccionesPermisos(
    response: SeccionesPermisoUsuarioResponse
  ): SeccionPermisoUsuario[] {
    const lista = Array.isArray(response)
      ? response
      : response?.data || response?.permisos || response?.items || response?.secciones || [];

    if (!Array.isArray(lista) || !lista.length) {
      return [];
    }

    return lista.map((raw, index) => this.mapearSeccionPermiso(raw, index));
  }

  private mapearSeccionPermiso(
    raw: SeccionPermisoUsuarioApi,
    index: number
  ): SeccionPermisoUsuario {
    const permisosRaw = Array.isArray(raw?.['permisos'])
      ? (raw?.['permisos'] as PermisoAsignableUsuarioApi[])
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
    raw: PermisoAsignableUsuarioApi,
    index: number,
    seccion?: SeccionPermisoUsuarioApi
  ): PermisoAsignableUsuario {
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
