import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpBaseService } from '@core/services/http-base.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Bloque } from '../modelos/bloque.modelo';

interface RespuestaApi<T> {
  datos: T;
  mensaje: string;
  exito: boolean;
}

@Injectable({ providedIn: 'root' })
export class BloquesServicio {
  private readonly http = inject(HttpBaseService);
  private readonly httpClient = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl.replace(/\/$/, '')}/api`;

  obtenerPorSeccion(seccionId: string): Observable<Bloque[]> {
    return this.http.get<RespuestaApi<Bloque[]>>(`api/museo/secciones/${seccionId}/bloques`).pipe(map(r => r.datos));
  }

  obtenerPorSeccionPublico(seccionId: string, token: string): Observable<Bloque[]> {
    return this.httpClient.get<RespuestaApi<Bloque[]>>(`${this.baseUrl}/museo/secciones/${seccionId}/bloques-publico`, {
      headers: { 'X-Visita-Token': token }
    }).pipe(map(r => r.datos));
  }

  guardarLote(seccionId: string, bloques: Bloque[]): Observable<Bloque[]> {
    const bloquesParaEnviar = bloques.map(b => ({
      id: b.id,
      tipo: b.tipo,
      orden: b.orden,
      config: b.config,
      estado: b.estado
    }));
    return this.http.put<RespuestaApi<Bloque[]>>(`api/museo/secciones/${seccionId}/bloques`, { bloques: bloquesParaEnviar }).pipe(map(r => r.datos));
  }

  crear(seccionId: string, bloque: Bloque): Observable<Bloque> {
    return this.http.post<RespuestaApi<Bloque>>(`api/museo/secciones/${seccionId}/bloques`, bloque).pipe(map(r => r.datos));
  }

  actualizar(bloqueId: string, cambios: Partial<Bloque>): Observable<Bloque> {
    return this.http.patch<RespuestaApi<Bloque>>(`api/museo/secciones/bloques/${bloqueId}`, cambios).pipe(map(r => r.datos));
  }

  eliminar(bloqueId: string): Observable<void> {
    return this.http.delete<RespuestaApi<null>>(`api/museo/secciones/bloques/${bloqueId}`).pipe(map(() => undefined));
  }

  reordenar(seccionId: string, items: Array<{ id: string; orden: number }>): Observable<void> {
    return this.http.patch<RespuestaApi<null>>(`api/museo/secciones/${seccionId}/bloques/reordenar`, { items }).pipe(map(() => undefined));
  }
}
