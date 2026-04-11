import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { SeccionesRecorridoServicio } from './secciones-recorrido.servicio';
import { SesionesVisitaServicio } from '../sesiones-visita/sesiones-visita.servicio';
import { Publica } from '../../autenticacion/autenticacion/decoradores/publica.decorador';
import {
  ActualizarSeccionRecorridoDto,
  CambiarEstadoSeccionDto,
  CrearSeccionRecorridoDto,
  ReordenarSeccionesDto,
} from './dto/crear-seccion-recorrido.dto';

@ApiTags('museo/secciones')
@ApiBearerAuth()
@Controller('museo/secciones')
export class SeccionesRecorridoControlador {
  constructor(
    private readonly servicio: SeccionesRecorridoServicio,
    private readonly sesionesServicio: SesionesVisitaServicio,
  ) {}

  @Get()
  obtenerTodas() {
    return this.servicio.obtenerTodas();
  }

  @Get('exposicion/:exposicionId')
  obtenerPorExposicion(@Param('exposicionId', ParseUUIDPipe) exposicionId: string) {
    return this.servicio.obtenerPorExposicion(exposicionId);
  }

  @Patch('reordenar')
  reordenar(@Body() dto: ReordenarSeccionesDto) {
    return this.servicio.reordenar(dto);
  }

  @Get(':id')
  obtenerPorId(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicio.obtenerPorId(id);
  }

  @Post()
  crear(@Body() dto: CrearSeccionRecorridoDto) {
    return this.servicio.crear(dto);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarSeccionRecorridoDto,
  ) {
    return this.servicio.actualizar(id, dto);
  }

  @Patch(':id/estado')
  cambiarEstado(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CambiarEstadoSeccionDto,
  ) {
    return this.servicio.cambiarEstado(id, dto);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicio.eliminar(id);
  }

  @Get('publica/:id')
  @Publica()
  @ApiHeader({ name: 'X-Visita-Token', description: 'Token de sesión de visita', required: true })
  async obtenerPublica(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-visita-token') token: string,
  ) {
    if (!token) throw new UnauthorizedException('Token de visita requerido');
    await this.sesionesServicio.verificarToken(token);
    return this.servicio.obtenerPublicaPorId(id);
  }
}
