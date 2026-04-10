import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsuariosRolesServicio } from './usuarios-roles.servicio';
import { CambiarEstadoUsuarioRolDto } from './dto/cambiar-estado-usuario-rol.dto';
import { VincularRolesUsuarioDto } from './dto/vincular-roles-usuario.dto';

@ApiTags('usuarios-roles')
@Controller('autenticacion/usuarios-roles')
export class UsuariosRolesControlador {
  constructor(private readonly servicio: UsuariosRolesServicio) {}

  @Get('usuario/:usuarioId')
  listarRolesPorUsuario(@Param('usuarioId', ParseIntPipe) usuarioId: number) {
    return this.servicio.listarRolesPorUsuario(usuarioId);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicio.eliminar(id);
  }

  @Patch(':id/estado')
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CambiarEstadoUsuarioRolDto,
  ) {
    return this.servicio.cambiarEstado(id, dto);
  }

  @Post('vincular')
  vincularRol(@Body() dto: VincularRolesUsuarioDto) {
    return this.servicio.vincularRol(dto);
  }
}
