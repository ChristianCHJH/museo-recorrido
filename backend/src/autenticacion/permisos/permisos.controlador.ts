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
import { PermisosServicio } from './permisos.servicio';
import { CrearPermisoDto } from './dto/crear-permiso.dto';
import { ActualizarPermisoDto } from './dto/actualizar-permiso.dto';
import { CambiarEstadoPermisoDto } from './dto/cambiar-estado-permiso.dto';

@ApiTags('permisos')
@Controller('autenticacion/permisos')
export class PermisosControlador {
  constructor(private readonly permisosServicio: PermisosServicio) {}

  @Post()
  crear(@Body() dto: CrearPermisoDto) {
    return this.permisosServicio.crear(dto);
  }

  @Get()
  listar() {
    return this.permisosServicio.listar();
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.permisosServicio.buscarPorId(id);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarPermisoDto,
  ) {
    return this.permisosServicio.actualizar(id, dto);
  }

  @Patch(':id/estado')
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CambiarEstadoPermisoDto,
  ) {
    return this.permisosServicio.cambiarEstado(id, dto);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.permisosServicio.eliminar(id);
  }
}
