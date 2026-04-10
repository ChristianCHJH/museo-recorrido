import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class ExcepcionHttpFiltro implements ExceptionFilter {
  catch(excepcion: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const respuesta = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let mensaje = 'Error interno del servidor';

    if (excepcion instanceof HttpException) {
      status = excepcion.getStatus();
      const respuestaExcepcion = excepcion.getResponse();
      mensaje =
        typeof respuestaExcepcion === 'string'
          ? respuestaExcepcion
          : (respuestaExcepcion as { message?: string | string[] }).message
            ? Array.isArray(
                (respuestaExcepcion as { message: string | string[] }).message,
              )
              ? (
                  respuestaExcepcion as { message: string[] }
                ).message.join(', ')
              : ((respuestaExcepcion as { message: string }).message)
            : mensaje;
    }

    respuesta.status(status).json({
      exito: false,
      mensaje,
      datos: null,
    });
  }
}
