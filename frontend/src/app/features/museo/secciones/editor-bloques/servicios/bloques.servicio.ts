import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpBaseService } from '@core/services/http-base.service';
import { Bloque } from '../modelos/bloque.modelo';

interface RespuestaApi<T> {
  datos: T;
  mensaje: string;
  exito: boolean;
}

@Injectable({ providedIn: 'root' })
export class BloquesServicio {
  private readonly http = inject(HttpBaseService);

  obtenerPorSeccion(seccionId: string): Observable<Bloque[]> {
    return this.http.get<RespuestaApi<Bloque[]>>(`api/museo/secciones/${seccionId}/bloques`).pipe(map(r => r.datos));
  }

  guardarLote(seccionId: string, bloques: Bloque[]): Observable<Bloque[]> {
    return this.http.put<RespuestaApi<Bloque[]>>(`api/museo/secciones/${seccionId}/bloques`, { bloques }).pipe(map(r => r.datos));
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
