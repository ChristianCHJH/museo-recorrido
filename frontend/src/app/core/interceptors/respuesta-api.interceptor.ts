import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';

interface RespuestaApi<T> {
  exito: boolean;
  mensaje: string;
  datos: T;
}

function esRespuestaApi(body: unknown): body is RespuestaApi<unknown> {
  return (
    body !== null &&
    typeof body === 'object' &&
    'exito' in body &&
    'datos' in body
  );
}

export const interceptorRespuestaApi: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    map((evento) => {
      if (evento instanceof HttpResponse && esRespuestaApi(evento.body)) {
        return evento.clone({ body: evento.body.datos });
      }
      return evento;
    })
  );
};
