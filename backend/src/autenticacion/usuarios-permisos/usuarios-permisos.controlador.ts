import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsuariosPermisosServicio } from './usuarios-permisos.servicio';
import { VincularPermisosUsuarioDto } from './dto/vincular-permisos-usuario.dto';

@ApiTags('usuarios-permisos')
@Controller('autenticacion/usuarios-permisos')
export class UsuariosPermisosControlador {
  constructor(private readonly servicio: UsuariosPermisosServicio) {}

  @Get('usuario/:usuarioId')
  listarPermisosPorUsuario(@Param('usuarioId', ParseIntPipe) usuarioId: number) {
    return this.servicio.listarPermisosPorUsuario(usuarioId);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicio.eliminar(id);
  }

  @Post('vincular')
  vincularPermisos(@Body() dto: VincularPermisosUsuarioDto) {
    return this.servicio.vincularPermisos(dto);
  }
}
