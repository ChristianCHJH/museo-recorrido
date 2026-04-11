import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ExposicionesServicio } from './exposiciones.servicio';
import {
  ActualizarExposicionDto,
  CambiarEstadoExposicionDto,
  CrearExposicionDto,
  ReordenarExposicionesDto,
} from './dto/crear-exposicion.dto';
import { Publica } from '../../autenticacion/autenticacion/decoradores/publica.decorador';

@ApiTags('museo/exposiciones')
@ApiBearerAuth()
@Controller('museo/exposiciones')
export class ExposicionesControlador {
  constructor(private readonly servicio: ExposicionesServicio) {}

  @Get()
  obtenerTodas() {
    return this.servicio.obtenerTodas();
  }

  @Publica()
  @Get('activas')
  obtenerActivas() {
    return this.servicio.obtenerActivas();
  }

  @Patch('reordenar')
  reordenar(@Body() dto: ReordenarExposicionesDto) {
    return this.servicio.reordenar(dto);
  }

  @Get(':id')
  obtenerPorId(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicio.obtenerPorId(id);
  }

  @Post()
  crear(@Body() dto: CrearExposicionDto) {
    return this.servicio.crear(dto);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarExposicionDto,
  ) {
    return this.servicio.actualizar(id, dto);
  }

  @Patch(':id/estado')
  cambiarEstado(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CambiarEstadoExposicionDto,
  ) {
    return this.servicio.cambiarEstado(id, dto);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicio.eliminar(id);
  }
}
