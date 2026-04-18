import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HttpBaseService } from '@core/services/http-base.service';
import { environment } from '@env/environment';

export interface SesionVisita {
  id: string;
  token: string;
  ipOrigen: string;
  userAgent: string;
  fechaCreacion: string;
  fechaExpiracion: string;
  totalAccesos: number;
  estado: boolean;
}

export interface RegistroAcceso {
  id: string;
  codigoQrId: string;
  ipOrigen: string;
  resultado: string;
  fechaAcceso: string;
}

export interface IniciarSesionRespuesta {
  token: string;
  seccionId: string;
}

const CLAVE_TOKEN = 'museo.visita.token';

@Injectable({ providedIn: 'root' })
export class SesionesVisitaServicio {
  private readonly http = inject(HttpBaseService);
  private readonly httpClient = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl.replace(/\/$/, '')}/api`;

  iniciarSesion(codigoQr: string): Observable<IniciarSesionRespuesta> {
    return this.http.post<IniciarSesionRespuesta>(
      `api/museo/visita/iniciar/${codigoQr}`,
      {}
    );
  }

  verificarToken(token: string): Observable<SesionVisita> {
    return this.httpClient.get<SesionVisita>(
      `${this.baseUrl}/museo/visita/verificar`,
      { headers: { 'X-Visita-Token': token } }
    );
  }

  obtenerSesionesActivas(): Observable<SesionVisita[]> {
    return this.http.get<SesionVisita[]>('api/museo/visita/sesiones');
  }

  revocarSesion(id: string): Observable<void> {
    return this.http.patch<void>(`api/museo/visita/sesiones/${id}/revocar`, {});
  }

  obtenerLogs(): Observable<RegistroAcceso[]> {
    return this.http.get<RegistroAcceso[]>('api/museo/visita/logs');
  }

  guardarToken(token: string): void {
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.setItem(CLAVE_TOKEN, token);
      } catch {
        // ignorar
      }
    }
  }

  obtenerToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      return window.sessionStorage.getItem(CLAVE_TOKEN);
    } catch {
      return null;
    }
  }

  limpiarToken(): void {
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.removeItem(CLAVE_TOKEN);
      } catch {
        // ignorar
      }
    }
  }
}
