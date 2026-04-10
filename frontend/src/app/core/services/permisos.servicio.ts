import { Injectable } from '@angular/core';
import { HttpBaseService } from './http-base.service';
import { map } from 'rxjs';

export interface Permiso {
  id: number;
  permiso: string;
  descripcion?: string | null;
  seccionId: number;
  seccionNombre?: string | null;
  estado: boolean;
  fechaCreacion?: string | null;
  fechaActualizacion?: string | null;
}

export interface CrearPermisoPayload {
  permiso: string;
  descripcion?: string | null;
  seccionId: number;
  estado?: boolean;
  usuarioCreacion?: number | null;
  usuarioActualizacion?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class PermisosServicio {
  constructor(private readonly http: HttpBaseService) {}

  obtenerPermisos() {
    return this.http
      .get<PermisoSeccionResponse | PermisoApi[]>(`api/autenticacion/permisos`)
      .pipe(map((response) => this.mapearPermisos(response)));
  }

  crearPermiso(payload: CrearPermisoPayload) {
    return this.http.post<Permiso>('api/autenticacion/permisos', payload);
  }

  actualizarPermiso(id: number | string, payload: Partial<CrearPermisoPayload>) {
    return this.http.patch<Permiso>(`api/autenticacion/permisos/${id}`, payload);
  }

  actualizarEstadoPermiso(id: number | string, estado: boolean) {
    return this.http.patch<Permiso>(`api/autenticacion/permisos/${id}/estado`, { estado });
  }

  private mapearPermisos(
    response: PermisoSeccionResponse | PermisoApi[] | PermisoSeccion[]
  ): Permiso[] {
    const permisos: Permiso[] = [];

    if (Array.isArray(response)) {
      for (const permiso of response as PermisoApi[]) {
        permisos.push(this.mapPermiso(permiso, permiso.seccion));
      }
      return permisos;
    }

    const wrapper = response as PermisoSeccionWrapper;
    const secciones = wrapper.data || wrapper.permisos || [];

    for (const seccion of secciones) {
      const lista = seccion.permisos || [];
      for (const permiso of lista) {
        permisos.push(this.mapPermiso(permiso, seccion));
      }
    }

    return permisos;
  }

  private mapPermiso(permiso: PermisoApi, seccion?: PermisoSeccion): Permiso {
    return {
      id: Number(permiso.id),
      permiso: String(permiso.permiso),
      descripcion: permiso.descripcion ?? null,
      seccionId: Number(permiso.seccionId ?? seccion?.id ?? 0),
      seccionNombre: seccion?.nombre || (permiso as any)?.seccion?.nombre || null,
      estado: permiso.estado ?? true,
      fechaCreacion: permiso.fechaCreacion ?? null,
      fechaActualizacion: permiso.fechaActualizacion ?? null
    };
  }
}

type PermisoSeccionResponse = PermisoSeccionWrapper | PermisoSeccion[];

interface PermisoSeccionWrapper {
  data?: PermisoSeccion[];
  permisos?: PermisoSeccion[];
}

interface PermisoSeccion {
  id?: number | string;
  nombre?: string;
  descripcion?: string | null;
  permisos?: PermisoApi[];
}

interface PermisoApi {
  id: number | string;
  permiso: string;
  descripcion?: string | null;
  estado?: boolean;
  seccionId?: number | string;
  fechaCreacion?: string | null;
  fechaActualizacion?: string | null;
  seccion?: {
    id?: number | string;
    nombre?: string;
    descripcion?: string | null;
  };
}
