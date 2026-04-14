import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { HttpBaseService } from '@core/services/http-base.service';

export interface DatosInicioSesion {
  correo: string;
  contrasena: string;
  recordarme: boolean;
}

export interface RespuestaInicioSesion {
  tokenAcceso: string;
  tipoToken: string;
  expiraEn: string;
  refreshToken: string;
}

interface RespuestaApi<T> {
  exito: boolean;
  mensaje: string;
  datos: T;
}

interface TokensAlmacenados {
  tokenAcceso: string;
  tokenRefresco: string;
  tipoToken: string;
  expiraEn: string;
}

@Injectable({
  providedIn: 'root'
})
export class AutenticacionServicio {
  private readonly claveAlmacenamientoTokens = 'spa.auth.tokens';

  constructor(private readonly http: HttpBaseService) {}

  iniciarSesion(datos: DatosInicioSesion): Observable<RespuestaInicioSesion> {
    const cuerpo = {
      correo: datos.correo,
      contrasena: datos.contrasena
    };

    return this.http.post<RespuestaApi<RespuestaInicioSesion>>('api/autenticacion/login', cuerpo).pipe(
      map((respuesta) => respuesta.datos),
      tap((tokens) => this.persistirTokens(tokens, datos.recordarme))
    );
  }

  refrescarTokens(): Observable<RespuestaInicioSesion> {
    const tokenRefresco = this.obtenerTokenRefresco();

    if (!tokenRefresco) {
      return throwError(() => new Error('Refresh token no disponible'));
    }

    return this.http
      .post<RespuestaApi<RespuestaInicioSesion>>('api/autenticacion/refresh', { jti: tokenRefresco })
      .pipe(
        map((respuesta) => respuesta.datos),
        tap((tokens) => this.persistirTokens(tokens))
      );
  }

  cerrarSesion(): void {
    this.limpiarTokensAlmacenados();
  }

  estaAutenticado(): boolean {
    return !!this.obtenerTokenAcceso();
  }

  obtenerTokenAcceso(): string | null {
    return this.obtenerTokensAlmacenados()?.tokenAcceso ?? null;
  }

  obtenerTokenRefresco(): string | null {
    return this.obtenerTokensAlmacenados()?.tokenRefresco ?? null;
  }

  obtenerCabeceraAutorizacion(): string | null {
    const tokens = this.obtenerTokensAlmacenados();

    if (!tokens?.tokenAcceso) {
      return null;
    }

    const tipoToken = tokens.tipoToken || 'Bearer';
    return `${tipoToken} ${tokens.tokenAcceso}`;
  }

  obtenerIdUsuarioAutenticado(): number | null {
    const token = this.obtenerTokenAcceso();
    if (!token) {
      return null;
    }

    try {
      const payload = this.decodificarPayloadJwt(token);
      const idUsuario = payload?.['sub'] ?? payload?.['id'] ?? payload?.['usuarioId'] ?? payload?.['userId'];
      return idUsuario !== undefined && idUsuario !== null ? Number(idUsuario) : null;
    } catch {
      return null;
    }
  }

  private decodificarPayloadJwt(token: string): Record<string, unknown> | null {
    try {
      const partes = token.split('.');
      if (partes.length !== 3) {
        return null;
      }
      const payload = partes[1];
      const decodificado = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodificado);
    } catch {
      return null;
    }
  }

  private persistirTokens(respuesta: RespuestaInicioSesion, recordarme?: boolean) {
    const almacenamiento = this.resolverAlmacenamiento(recordarme);

    if (!almacenamiento) {
      return;
    }

    const payload: TokensAlmacenados = {
      tokenAcceso: respuesta.tokenAcceso,
      tokenRefresco: respuesta.refreshToken,
      tipoToken: respuesta.tipoToken ?? 'Bearer',
      expiraEn: respuesta.expiraEn
    };

    almacenamiento.setItem(this.claveAlmacenamientoTokens, JSON.stringify(payload));
    this.obtenerAlmacenamientoAlternativo(almacenamiento)?.removeItem(this.claveAlmacenamientoTokens);
  }

  private obtenerTokensAlmacenados(): TokensAlmacenados | null {
    return this.leerTokensDeAlmacenamiento(this.obtenerAlmacenamiento('local')) ?? this.leerTokensDeAlmacenamiento(this.obtenerAlmacenamiento('session'));
  }

  private leerTokensDeAlmacenamiento(almacenamiento: Storage | null): TokensAlmacenados | null {
    if (!almacenamiento) {
      return null;
    }

    const valorCrudo = almacenamiento.getItem(this.claveAlmacenamientoTokens);

    if (!valorCrudo) {
      return null;
    }

    try {
      return JSON.parse(valorCrudo) as TokensAlmacenados;
    } catch {
      almacenamiento.removeItem(this.claveAlmacenamientoTokens);
      return null;
    }
  }

  private resolverAlmacenamiento(recordarme?: boolean): Storage | null {
    if (recordarme === true) {
      return this.obtenerAlmacenamiento('local');
    }

    if (recordarme === false) {
      return this.obtenerAlmacenamiento('session');
    }

    return this.obtenerAlmacenamientoConTokens() ?? this.obtenerAlmacenamiento('session') ?? this.obtenerAlmacenamiento('local');
  }

  private obtenerAlmacenamientoConTokens(): Storage | null {
    const local = this.obtenerAlmacenamiento('local');

    if (this.leerTokensDeAlmacenamiento(local)) {
      return local;
    }

    const sesion = this.obtenerAlmacenamiento('session');

    if (this.leerTokensDeAlmacenamiento(sesion)) {
      return sesion;
    }

    return null;
  }

  private obtenerAlmacenamientoAlternativo(actual: Storage): Storage | null {
    const local = this.obtenerAlmacenamiento('local');
    const sesion = this.obtenerAlmacenamiento('session');

    if (!local || !sesion) {
      return null;
    }

    return actual === local ? sesion : local;
  }

  private obtenerAlmacenamiento(tipo: 'local' | 'session'): Storage | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      return tipo === 'local' ? window.localStorage : window.sessionStorage;
    } catch {
      return null;
    }
  }

  private limpiarTokensAlmacenados() {
    this.obtenerAlmacenamiento('local')?.removeItem(this.claveAlmacenamientoTokens);
    this.obtenerAlmacenamiento('session')?.removeItem(this.claveAlmacenamientoTokens);
  }
}
