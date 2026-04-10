import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, shareReplay, switchMap } from 'rxjs/operators';
import { AutenticacionServicio, RespuestaInicioSesion } from '@features/autenticacion/autenticacion.servicio';

let refrescarTokenEnProgreso$: Observable<RespuestaInicioSesion> | null = null;

export const interceptorAutenticacion: HttpInterceptorFn = (req, next) => {
  const servicioAutenticacion = inject(AutenticacionServicio);
  const urlNormalizada = req.url.toLowerCase();
  const esSolicitudLogin = urlNormalizada.includes('/autenticacion/login');
  const esSolicitudRefresh = urlNormalizada.includes('/autenticacion/refresh');
  const omitirCabeceraAuth = esSolicitudLogin || esSolicitudRefresh;
  const cabeceraAuth = servicioAutenticacion.obtenerCabeceraAutorizacion();

  const solicitudConAuth = cabeceraAuth && !omitirCabeceraAuth ? req.clone({ setHeaders: { Authorization: cabeceraAuth } }) : req;

  return next(solicitudConAuth).pipe(
    catchError((error: HttpErrorResponse) => {
      const tokenRefresco = servicioAutenticacion.obtenerTokenRefresco();
      const debeIntentarRefrescar =
        error.status === 401 && !esSolicitudLogin && !esSolicitudRefresh && !!tokenRefresco;

      if (!debeIntentarRefrescar) {
        return throwError(() => error);
      }

      if (!refrescarTokenEnProgreso$) {
        refrescarTokenEnProgreso$ = servicioAutenticacion.refrescarTokens().pipe(
          shareReplay(1),
          finalize(() => {
            refrescarTokenEnProgreso$ = null;
          })
        );
      }

      return refrescarTokenEnProgreso$.pipe(
        switchMap(() => {
          const cabeceraActualizada = servicioAutenticacion.obtenerCabeceraAutorizacion();

          if (!cabeceraActualizada) {
            return throwError(() => error);
          }

          const solicitudReintentada = solicitudConAuth.clone({
            setHeaders: { Authorization: cabeceraActualizada }
          });

          return next(solicitudReintentada);
        }),
        catchError((errorRefresco) => {
          servicioAutenticacion.cerrarSesion();
          return throwError(() => errorRefresco);
        })
      );
    })
  );
};
