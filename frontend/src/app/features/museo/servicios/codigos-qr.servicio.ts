import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HttpBaseService } from '@core/services/http-base.service';
import { environment } from '@env/environment';

export interface CodigoQr {
  id: string;
  codigo: string;
  nombreDescriptivo: string;
  imagenQrUrl: string | null;
  seccionId: string | null;
  seccion?: { id: string; nombre: string; subtitulo: string | null } | null;
  activo: boolean;
  totalEscaneos: number;
  creadoEn: string;
}

export interface SeccionDisponible {
  id: string;
  nombre: string;
  subtitulo: string | null;
}

export interface CrearQrDto {
  nombreDescriptivo: string;
  seccionId?: string | null;
}

@Injectable({ providedIn: 'root' })
export class CodigosQrServicio {
  private readonly http = inject(HttpBaseService);
  private readonly httpClient = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl.replace(/\/$/, '')}/api`;

  obtenerTodos(): Observable<CodigoQr[]> {
    return this.http.get<CodigoQr[]>('api/museo/qr');
  }

  obtenerSeccionesDisponibles(excluirQrId?: string): Observable<SeccionDisponible[]> {
    const options = excluirQrId ? { params: { excluirQrId } } : {};
    return this.http.get<SeccionDisponible[]>('api/museo/qr/secciones-disponibles', options);
  }

  crear(dto: CrearQrDto): Observable<CodigoQr> {
    return this.http.post<CodigoQr>('api/museo/qr', dto);
  }

  actualizar(id: string, dto: Partial<CrearQrDto>): Observable<CodigoQr> {
    return this.http.patch<CodigoQr>(`api/museo/qr/${id}`, dto);
  }

  cambiarEstado(id: string, activo: boolean): Observable<CodigoQr> {
    return this.http.patch<CodigoQr>(`api/museo/qr/${id}/estado`, { activo });
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`api/museo/qr/${id}`);
  }

  descargarQr(id: string): Observable<Blob> {
    return this.httpClient.get(`${this.baseUrl}/museo/qr/${id}/descargar`, {
      responseType: 'blob'
    });
  }
}
