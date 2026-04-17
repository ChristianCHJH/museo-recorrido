import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SeccionesBloquesServicio } from './secciones-bloques.servicio';
import {
  ActualizarBloqueDto,
  BloqueDto,
  GuardarBloquesDto,
  ReordenarBloquesDto,
} from './dto/bloque.dto';

@ApiTags('museo/secciones')
@ApiBearerAuth()
@Controller('museo/secciones')
export class SeccionesBloquesControlador {
  constructor(private readonly servicio: SeccionesBloquesServicio) {}

  @Get(':id/bloques')
  async obtenerBloques(@Param('id', ParseUUIDPipe) id: string) {
    const datos = await this.servicio.obtenerPorSeccion(id);
    return { datos, mensaje: 'Bloques obtenidos correctamente', exito: true };
  }

  @Put(':id/bloques')
  async guardarBloques(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: GuardarBloquesDto,
  ) {
    const datos = await this.servicio.guardarLote(id, dto);
    return { datos, mensaje: 'Bloques guardados correctamente', exito: true };
  }

  @Post(':id/bloques')
  async crearBloque(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: BloqueDto,
  ) {
    const datos = await this.servicio.crear(id, dto);
    return { datos, mensaje: 'Bloque creado correctamente', exito: true };
  }

  @Patch(':id/bloques/reordenar')
  async reordenarBloques(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReordenarBloquesDto,
  ) {
    await this.servicio.reordenar(dto.items);
    return { datos: null, mensaje: 'Bloques reordenados correctamente', exito: true };
  }

  @Patch('bloques/:bloqueId')
  async actualizarBloque(
    @Param('bloqueId', ParseUUIDPipe) bloqueId: string,
    @Body() dto: ActualizarBloqueDto,
  ) {
    const datos = await this.servicio.actualizar(bloqueId, dto);
    return { datos, mensaje: 'Bloque actualizado correctamente', exito: true };
  }

  @Delete('bloques/:bloqueId')
  async eliminarBloque(@Param('bloqueId', ParseUUIDPipe) bloqueId: string) {
    await this.servicio.eliminar(bloqueId);
    return { datos: null, mensaje: 'Bloque eliminado correctamente', exito: true };
  }
}
