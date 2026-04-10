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
import { SeccionesPermisoServicio } from './secciones-permiso.servicio';
import { CrearSeccionPermisoDto } from './dto/crear-seccion-permiso.dto';
import { ActualizarSeccionPermisoDto } from './dto/actualizar-seccion-permiso.dto';
import { CambiarEstadoSeccionPermisoDto } from './dto/cambiar-estado-seccion-permiso.dto';

@ApiTags('secciones-permiso')
@Controller('autenticacion/secciones-permiso')
export class SeccionesPermisoControlador {
  constructor(
    private readonly seccionesServicio: SeccionesPermisoServicio,
  ) {}

  @Post()
  crear(@Body() dto: CrearSeccionPermisoDto) {
    return this.seccionesServicio.crear(dto);
  }

  @Get()
  listar() {
    return this.seccionesServicio.listar();
  }

  @Get('usuario/:usuarioId')
  listarConPermisosPorUsuario(@Param('usuarioId', ParseIntPipe) usuarioId: number) {
    return this.seccionesServicio.listarConPermisosPorUsuario(usuarioId);
  }

  @Get('rol/:rolId')
  listarConPermisosPorRol(@Param('rolId', ParseIntPipe) rolId: number) {
    return this.seccionesServicio.listarConPermisosPorRol(rolId);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarSeccionPermisoDto,
  ) {
    return this.seccionesServicio.actualizar(id, dto);
  }

  @Patch(':id/estado')
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CambiarEstadoSeccionPermisoDto,
  ) {
    return this.seccionesServicio.cambiarEstado(id, dto);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.seccionesServicio.eliminar(id);
  }
}
