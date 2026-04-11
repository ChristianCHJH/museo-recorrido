import {
  Controller,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { SesionesVisitaServicio } from './sesiones-visita.servicio';
import { Publica } from '../../autenticacion/autenticacion/decoradores/publica.decorador';

@ApiTags('museo/visita')
@Controller('museo/visita')
export class SesionesVisitaControlador {
  constructor(private readonly servicio: SesionesVisitaServicio) {}

  @Post('iniciar/:codigoQr')
  @Publica()
  iniciarSesion(@Param('codigoQr') codigoQr: string, @Req() req: Request) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';
    return this.servicio.iniciarSesion(codigoQr, ip, userAgent);
  }

  @Get('verificar')
  @Publica()
  @ApiHeader({ name: 'X-Visita-Token', description: 'Token de sesión de visita', required: true })
  verificarToken(@Headers('x-visita-token') token: string) {
    if (!token) throw new UnauthorizedException('Token de visita requerido');
    return this.servicio.verificarToken(token);
  }

  @Get('sesiones')
  @ApiBearerAuth()
  obtenerSesionesActivas() {
    return this.servicio.obtenerSesionesActivas();
  }

  @Patch('sesiones/:id/revocar')
  @ApiBearerAuth()
  revocarSesion(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicio.revocarSesion(id);
  }

  @Get('logs')
  @ApiBearerAuth()
  obtenerLogs() {
    return this.servicio.obtenerLogs();
  }
}
