import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpBaseService } from '@core/services/http-base.service';
import { Bloque } from '../modelos/bloque.modelo';

@Injectable({ providedIn: 'root' })
export class BloquesServicio {
  private readonly http = inject(HttpBaseService);

  obtenerPorSeccion(seccionId: string): Observable<Bloque[]> {
    return this.http.get<Bloque[]>(`api/museo/secciones/${seccionId}/bloques`);
  }

  guardarLote(seccionId: string, bloques: Bloque[]): Observable<Bloque[]> {
    return this.http.put<Bloque[]>(`api/museo/secciones/${seccionId}/bloques`, { bloques });
  }

  crear(seccionId: string, bloque: Bloque): Observable<Bloque> {
    return this.http.post<Bloque>(`api/museo/secciones/${seccionId}/bloques`, bloque);
  }

  actualizar(bloqueId: string, cambios: Partial<Bloque>): Observable<Bloque> {
    return this.http.patch<Bloque>(`api/museo/secciones/bloques/${bloqueId}`, cambios);
  }

  eliminar(bloqueId: string): Observable<void> {
    return this.http.delete<void>(`api/museo/secciones/bloques/${bloqueId}`);
  }

  reordenar(seccionId: string, items: Array<{ id: string; orden: number }>): Observable<void> {
    return this.http.patch<void>(`api/museo/secciones/${seccionId}/bloques/reordenar`, { items });
  }
}
