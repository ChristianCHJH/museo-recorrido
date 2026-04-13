import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { HttpBaseService } from '@core/services/http-base.service';

export interface Exposicion {
  id: string;
  nombre: string;
  descripcion: string | null;
  tipo: string;
  imagenPortadaUrl: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  orden: number;
  estado: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

export interface CrearExposicionDto {
  nombre: string;
  descripcion?: string;
  tipo?: string;
  imagenPortadaUrl?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface ReordenarExposicionesDto {
  items: { id: string; orden: number }[];
}

@Injectable({ providedIn: 'root' })
export class ExposicionesServicio {
  private readonly http = inject(HttpBaseService);

  obtenerTodas(): Observable<Exposicion[]> {
    return this.http.get<Exposicion[]>('api/museo/exposiciones');
  }

  obtenerActivas(): Observable<Exposicion[]> {
    return this.obtenerTodas().pipe(
      map((exposiciones) => exposiciones.filter((e) => e.estado))
    );
  }

  crear(dto: CrearExposicionDto): Observable<Exposicion> {
    return this.http.post<Exposicion>('api/museo/exposiciones', dto);
  }

  actualizar(id: string, dto: Partial<CrearExposicionDto>): Observable<Exposicion> {
    return this.http.patch<Exposicion>(`api/museo/exposiciones/${id}`, dto);
  }

  cambiarEstado(id: string, estado: boolean): Observable<Exposicion> {
    return this.http.patch<Exposicion>(`api/museo/exposiciones/${id}/estado`, { estado });
  }

  reordenar(dto: ReordenarExposicionesDto): Observable<void> {
    return this.http.patch<void>('api/museo/exposiciones/reordenar', dto);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`api/museo/exposiciones/${id}`);
  }
}
