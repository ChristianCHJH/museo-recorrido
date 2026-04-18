import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CodigosQrServicio } from './codigos-qr.servicio';
import { ActualizarCodigoQrDto, CambiarEstadoQrDto, CrearCodigoQrDto } from './dto/codigos-qr.dto';

@ApiTags('museo/qr')
@ApiBearerAuth()
@Controller('museo/qr')
export class CodigosQrControlador {
  constructor(private readonly servicio: CodigosQrServicio) {}

  @Get()
  obtenerTodos() {
    return this.servicio.obtenerTodos();
  }

  @Get('secciones-disponibles')
  obtenerSeccionesDisponibles(@Query('excluirQrId') excluirQrId?: string) {
    return this.servicio.obtenerSeccionesDisponibles(excluirQrId);
  }

  @Get('estadisticas/:id')
  obtenerEstadisticas(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicio.obtenerEstadisticas(id);
  }

  @Get(':id/descargar')
  async descargar(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const { buffer, nombre } = await this.servicio.obtenerImagenQr(id);
    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="${nombre}"`,
    });
    res.send(buffer);
  }

  @Get(':id')
  obtenerPorId(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicio.obtenerPorId(id);
  }

  @Post()
  crear(@Body() dto: CrearCodigoQrDto) {
    return this.servicio.crear(dto);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarCodigoQrDto,
  ) {
    return this.servicio.actualizar(id, dto);
  }

  @Patch(':id/estado')
  cambiarEstado(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CambiarEstadoQrDto,
  ) {
    return this.servicio.cambiarEstado(id, dto);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicio.eliminar(id);
  }

  @Post(':id/regenerar')
  regenerar(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicio.regenerar(id);
  }
}
