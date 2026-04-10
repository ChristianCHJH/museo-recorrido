import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RolesServicio } from './roles.servicio';
import { CrearRolDto } from './dto/crear-rol.dto';
import { ActualizarRolDto } from './dto/actualizar-rol.dto';
import { CambiarEstadoRolDto } from './dto/cambiar-estado-rol.dto';

@ApiTags('roles')
@Controller('autenticacion/roles')
export class RolesControlador {
  constructor(private readonly rolesServicio: RolesServicio) {}

  @Post()
  crear(@Body() dto: CrearRolDto) {
    return this.rolesServicio.crear(dto);
  }

  @Get()
  listar() {
    return this.rolesServicio.listar();
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarRolDto,
  ) {
    return this.rolesServicio.actualizar(id, dto);
  }

  @Patch(':id/estado')
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CambiarEstadoRolDto,
  ) {
    return this.rolesServicio.cambiarEstado(id, dto);
  }

  @Get('no-asignados/usuario/:usuarioId')
  listarNoAsignadosPorUsuario(@Param('usuarioId', ParseIntPipe) usuarioId: number) {
    return this.rolesServicio.listarNoAsignadosPorUsuario(usuarioId);
  }
}
