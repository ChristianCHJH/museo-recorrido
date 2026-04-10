import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

export interface RespuestaApi<T> {
  exito: boolean;
  mensaje: string;
  datos: T;
}

@Injectable()
export class RespuestaInterceptor<T> implements NestInterceptor<T, RespuestaApi<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<RespuestaApi<T>> {
    return next.handle().pipe(
      map((datos) => ({
        exito: true,
        mensaje: 'Operacion exitosa',
        datos,
      })),
    );
  }
}
