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
import { RolesPermisosServicio } from './roles-permisos.servicio';
import { AsignarPermisosRolDto } from './dto/asignar-permisos-rol.dto';

@ApiTags('roles-permisos')
@Controller('autenticacion/roles-permisos')
export class RolesPermisosControlador {
  constructor(private readonly servicio: RolesPermisosServicio) {}

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicio.eliminar(id);
  }

  @Get('rol/:rolId')
  listarPermisosPorRol(@Param('rolId', ParseIntPipe) rolId: number) {
    return this.servicio.listarPermisosPorRol(rolId);
  }

  @Post('asignar')
  asignarPermisosARol(@Body() dto: AsignarPermisosRolDto) {
    return this.servicio.asignarPermisosARol(dto);
  }
}
