import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpBaseService } from '@core/services/http-base.service';

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

interface RespuestaApi<T> {
  datos: T;
  mensaje: string;
  exito: boolean;
}

@Injectable({ providedIn: 'root' })
export class BibliotecaMediaServicio {
  private readonly http = inject(HttpBaseService);

  listar(filtros: FiltrosMedia = {}): Observable<ResultadoBiblioteca> {
    const params: Record<string, string | number> = {};
    if (filtros.tipo) params['tipo'] = filtros.tipo;
    if (filtros.busqueda) params['busqueda'] = filtros.busqueda;
    if (filtros.pagina !== undefined) params['pagina'] = filtros.pagina;
    if (filtros.limite !== undefined) params['limite'] = filtros.limite;
    return this.http.get<RespuestaApi<ResultadoBiblioteca>>('api/museo/multimedia/biblioteca', { params }).pipe(map(r => r.datos));
  }

  obtenerUno(id: string): Observable<ElementoMedia> {
    return this.http.get<RespuestaApi<ElementoMedia>>(`api/museo/multimedia/biblioteca/${id}`).pipe(map(r => r.datos));
  }

  subir(archivo: File, metadata: { nombre?: string; descripcion?: string }): Observable<ElementoMedia> {
    const fd = new FormData();
    fd.append('archivo', archivo);
    if (metadata.nombre) fd.append('nombre', metadata.nombre);
    if (metadata.descripcion) fd.append('descripcion', metadata.descripcion);
    return this.http.post<RespuestaApi<ElementoMedia>>('api/museo/multimedia/biblioteca/subir', fd).pipe(map(r => r.datos));
  }

  actualizar(
    id: string,
    cambios: Partial<Pick<ElementoMedia, 'nombre' | 'titulo' | 'descripcion'>>
  ): Observable<ElementoMedia> {
    return this.http.patch<RespuestaApi<ElementoMedia>>(`api/museo/multimedia/biblioteca/${id}`, cambios).pipe(map(r => r.datos));
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<RespuestaApi<null>>(`api/museo/multimedia/biblioteca/${id}`).pipe(map(() => undefined));
  }
}
