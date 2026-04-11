import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HttpBaseService } from '@core/services/http-base.service';
import { environment } from '@env/environment';

export interface SeccionRecorrido {
  id: string;
  exposicionId: string;
  titulo: string;
  descripcion: string;
  audioUrl: string | null;
  textoAlternativo: string | null;
  orden: number;
  estado: boolean;
  creadoEn: string;
}

export interface CrearSeccionDto {
  exposicionId: string;
  titulo: string;
  descripcion?: string;
}

@Injectable({ providedIn: 'root' })
export class SeccionesRecorridoServicio {
  private readonly http = inject(HttpBaseService);
  private readonly httpClient = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  obtenerPorExposicion(exposicionId: string): Observable<SeccionRecorrido[]> {
    return this.http.get<SeccionRecorrido[]>(`api/museo/secciones/exposicion/${exposicionId}`);
  }

  obtenerPorId(id: string): Observable<SeccionRecorrido> {
    return this.http.get<SeccionRecorrido>(`api/museo/secciones/${id}`);
  }

  crear(dto: CrearSeccionDto): Observable<SeccionRecorrido> {
    return this.http.post<SeccionRecorrido>('api/museo/secciones', dto);
  }

  actualizar(id: string, dto: Partial<CrearSeccionDto>): Observable<SeccionRecorrido> {
    return this.http.patch<SeccionRecorrido>(`api/museo/secciones/${id}`, dto);
  }

  cambiarEstado(id: string, estado: boolean): Observable<SeccionRecorrido> {
    return this.http.patch<SeccionRecorrido>(`api/museo/secciones/${id}/estado`, { estado });
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`api/museo/secciones/${id}`);
  }

  obtenerPublica(id: string, token: string): Observable<SeccionRecorrido> {
    const url = `${this.apiUrl.replace(/\/$/, '')}/api/museo/secciones/publica/${id}`;
    return this.httpClient.get<SeccionRecorrido>(url, {
      headers: { 'X-Visita-Token': token }
    });
  }
}
