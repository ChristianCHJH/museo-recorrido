import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

export interface ElementoMultimedia {
  id: string;
  seccionId: string;
  tipo: string;
  url: string;
  urlMiniatura: string | null;
  titulo: string | null;
  descripcion: string | null;
  esPrincipal: boolean;
  orden: number;
  estado: boolean;
}

@Injectable({ providedIn: 'root' })
export class MultimediaServicio {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl.replace(/\/$/, '')}/api`;

  obtenerPorSeccion(seccionId: string): Observable<ElementoMultimedia[]> {
    return this.http.get<ElementoMultimedia[]>(
      `${this.baseUrl}/museo/multimedia/seccion/${seccionId}`
    );
  }

  subirImagen(seccionId: string, archivo: File): Observable<ElementoMultimedia> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post<ElementoMultimedia>(
      `${this.baseUrl}/museo/multimedia/seccion/${seccionId}/imagen`,
      formData
    );
  }

  agregarVideoExterno(
    seccionId: string,
    url: string,
    titulo?: string
  ): Observable<ElementoMultimedia> {
    return this.http.post<ElementoMultimedia>(
      `${this.baseUrl}/museo/multimedia/seccion/${seccionId}/video-externo`,
      { url, titulo }
    );
  }

  actualizar(
    id: string,
    dto: { titulo?: string; descripcion?: string }
  ): Observable<ElementoMultimedia> {
    return this.http.patch<ElementoMultimedia>(
      `${this.baseUrl}/museo/multimedia/${id}`,
      dto
    );
  }

  cambiarEstado(id: string, estado: boolean): Observable<ElementoMultimedia> {
    return this.http.patch<ElementoMultimedia>(
      `${this.baseUrl}/museo/multimedia/${id}/estado`,
      { estado }
    );
  }

  marcarPrincipal(id: string): Observable<ElementoMultimedia> {
    return this.http.patch<ElementoMultimedia>(
      `${this.baseUrl}/museo/multimedia/${id}/principal`,
      {}
    );
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/museo/multimedia/${id}`);
  }
}
