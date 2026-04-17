import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpBaseService } from '@core/services/http-base.service';
import { environment } from '@env/environment';

export interface ElementoMedia {
  id: string;
  nombre?: string;
  titulo?: string;
  descripcion?: string;
  tipo: 'imagen' | 'audio' | 'video';
  url: string;
  urlMiniatura?: string;
  esPublico: boolean;
  creadoEn: string;
}

export interface FiltrosMedia {
  tipo?: string;
  busqueda?: string;
  pagina?: number;
  limite?: number;
}

export interface ResultadoBiblioteca {
  items: ElementoMedia[];
  total: number;
  pagina: number;
  limite: number;
}

@Injectable({ providedIn: 'root' })
export class BibliotecaMediaServicio {
  private readonly http = inject(HttpBaseService);
  private readonly httpClient = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  listar(filtros: FiltrosMedia = {}): Observable<ResultadoBiblioteca> {
    let params: Record<string, string | number> = {};
    if (filtros.tipo) params['tipo'] = filtros.tipo;
    if (filtros.busqueda) params['busqueda'] = filtros.busqueda;
    if (filtros.pagina !== undefined) params['pagina'] = filtros.pagina;
    if (filtros.limite !== undefined) params['limite'] = filtros.limite;
    return this.http.get<ResultadoBiblioteca>('api/museo/multimedia/biblioteca', { params });
  }

  obtenerUno(id: string): Observable<ElementoMedia> {
    return this.http.get<ElementoMedia>(`api/museo/multimedia/biblioteca/${id}`);
  }

  subir(archivo: File, metadata: { nombre?: string; descripcion?: string }): Observable<ElementoMedia> {
    const fd = new FormData();
    fd.append('archivo', archivo);
    if (metadata.nombre) fd.append('nombre', metadata.nombre);
    if (metadata.descripcion) fd.append('descripcion', metadata.descripcion);
    return this.httpClient.post<ElementoMedia>(
      `${this.apiUrl.replace(/\/$/, '')}/api/museo/multimedia/biblioteca/subir`,
      fd
    );
  }

  actualizar(
    id: string,
    cambios: Partial<Pick<ElementoMedia, 'nombre' | 'titulo' | 'descripcion'>>
  ): Observable<ElementoMedia> {
    return this.http.patch<ElementoMedia>(`api/museo/multimedia/biblioteca/${id}`, cambios);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`api/museo/multimedia/biblioteca/${id}`);
  }
}
