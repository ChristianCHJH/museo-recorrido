import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AutenticacionServicio } from './autenticacion.servicio';
import { IniciarSesionDto } from './dto/iniciar-sesion.dto';
import { RefrescarTokenDto } from './dto/refrescar-token.dto';
import { CerrarSesionDto } from './dto/cerrar-sesion.dto';
import { Publica } from './decoradores/publica.decorador';

@ApiTags('autenticacion')
@Controller('autenticacion')
export class AutenticacionControlador {
  constructor(private readonly autenticacionServicio: AutenticacionServicio) {}

  @Publica()
  @Post('login')
  iniciarSesion(@Body() dto: IniciarSesionDto) {
    return this.autenticacionServicio.iniciarSesion(dto);
  }

  @Publica()
  @Post('refresh')
  refrescar(@Body() dto: RefrescarTokenDto) {
    return this.autenticacionServicio.refrescarToken(dto);
  }

  @Publica()
  @Post('logout')
  cerrarSesion(@Body() dto: CerrarSesionDto) {
    return this.autenticacionServicio.cerrarSesion(dto);
  }

  @Get('perfil')
  perfil(@Request() req: { user: unknown }) {
    return req.user;
  }
}
