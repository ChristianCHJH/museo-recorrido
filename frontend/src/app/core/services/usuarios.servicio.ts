import { Injectable } from '@angular/core';
import { map } from 'rxjs';

import { HttpBaseService } from './http-base.service';
import { obtenerTexto, obtenerBooleano } from './api-mapper.util';

type RespuestaApiUsuarios =
  | UsuarioApi[]
  | { data?: UsuarioApi[]; usuarios?: UsuarioApi[]; items?: UsuarioApi[] };

type UsuarioApi = Record<string, unknown>;

export interface ElementoListaUsuario {
  id: string;
  nombreUsuario: string;
  correo: string;
  estado: string;
  activo: boolean;
  ultimaSesion: string;
  creado: string;
}

export interface DatosCrearUsuario {
  nombreUsuario: string;
  contrasena: string;
  correo: string;
  usuarioCreacion?: number | null;
}

export interface DatosActualizarUsuario {
  nombreUsuario?: string;
  correo?: string;
  contrasena?: string;
  usuarioActualizacion?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosServicio {
  constructor(private readonly http: HttpBaseService) {}

  obtenerUsuarios() {
    return this.http
      .get<RespuestaApiUsuarios>('api/autenticacion/usuarios')
      .pipe(map((respuesta) => this.mapearUsuarios(respuesta)));
  }

  crearUsuario(datos: DatosCrearUsuario) {
    return this.http
      .post<UsuarioApi>('api/autenticacion/usuarios', datos)
      .pipe(map((usuario) => this.mapearUsuario(usuario, 0)));
  }

  actualizarUsuario(id: string | number, datos: DatosActualizarUsuario) {
    return this.http
      .patch<UsuarioApi>(`api/autenticacion/usuarios/${id}`, datos)
      .pipe(map((usuario) => this.mapearUsuario(usuario, 0)));
  }

  eliminarUsuario(id: string | number) {
    return this.http
      .delete<UsuarioApi>(`api/autenticacion/usuarios/${id}`)
      .pipe(map((usuario) => this.mapearUsuario(usuario, 0)));
  }

  actualizarEstadoUsuario(id: string | number, estado: boolean) {
    return this.http
      .patch<UsuarioApi>(`api/autenticacion/usuarios/${id}/estado`, { estado })
      .pipe(map((usuario) => this.mapearUsuario(usuario, 0)));
  }

  private mapearUsuarios(respuesta: RespuestaApiUsuarios): ElementoListaUsuario[] {
    const lista = Array.isArray(respuesta)
      ? respuesta
      : respuesta?.data || respuesta?.usuarios || respuesta?.items || [];

    return lista.map((crudo, indice) => this.mapearUsuario(crudo, indice));
  }

  private mapearUsuario(crudo: UsuarioApi, indice: number): ElementoListaUsuario {
    const nombreUsuario =
      obtenerTexto(crudo, ['nombreUsuario', 'usuario', 'username', 'nombre']) ||
      this.generarNombreFallback(indice);

    const correo =
      obtenerTexto(crudo, ['correo', 'email']) || `${nombreUsuario.replace(/\s+/g, '.')}@example.com`;

    const estadoTexto = obtenerTexto(crudo, ['estado', 'estatus', 'status']);
    const activo = obtenerBooleano(crudo, ['estado', 'activo', 'enabled', 'isActive']);
    const estado =
      estadoTexto ||
      (activo === null ? 'Sin estado' : activo ? 'Activo' : 'Inactivo');

    const ultimaSesion =
      this.formatearFecha(
        obtenerTexto(crudo, ['ultimaSesion', 'ultimoIngreso', 'lastLogin', 'updatedAt'])
      ) || '-';

    const creado =
      this.formatearFecha(
        obtenerTexto(crudo, ['creado', 'creadoEn', 'createdAt', 'fechaCreacion'])
      ) || '-';

    return {
      id: String(obtenerTexto(crudo, ['id', '_id', 'usuarioId']) || indice + 1),
      nombreUsuario,
      correo,
      estado,
      activo: activo ?? (estado.toLowerCase() === 'activo'),
      ultimaSesion,
      creado
    };
  }

  private formatearFecha(valor: string | null): string | null {
    if (!valor) {
      return null;
    }

    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) {
      return valor;
    }

    return new Intl.DateTimeFormat('es-PE', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(fecha);
  }

  private generarNombreFallback(indice: number) {
    return `usuario-${indice + 1}`;
  }
}
