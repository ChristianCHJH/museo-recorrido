import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ElementosMultimediaServicio } from './elementos-multimedia.servicio';
import {
  ActualizarElementoMultimediaDto,
  AgregarVideoExternoDto,
  CambiarEstadoElementoDto,
  ReordenarMultimediaDto,
} from './dto/elementos-multimedia.dto';
import { ArchivoServicio } from '../archivos/archivo.servicio';

@ApiTags('museo/multimedia')
@ApiBearerAuth()
@Controller('museo/multimedia')
export class ElementosMultimediaControlador {
  constructor(
    private readonly servicio: ElementosMultimediaServicio,
    private readonly archivoServicio: ArchivoServicio,
  ) {}

  @Get('seccion/:seccionId')
  obtenerPorSeccion(@Param('seccionId', ParseUUIDPipe) seccionId: string) {
    return this.servicio.obtenerPorSeccion(seccionId);
  }

  @Post('seccion/:seccionId/imagen')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('archivo'))
  async subirImagen(
    @Param('seccionId', ParseUUIDPipe) seccionId: string,
    @UploadedFile() archivo: Express.Multer.File,
  ) {
    const { url, pesoBytes } = await this.archivoServicio.guardar(archivo, 'multimedia', seccionId);
    return this.servicio.crearDesdeArchivo(seccionId, 'imagen', url, pesoBytes);
  }

  @Post('seccion/:seccionId/video-local')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('archivo'))
  async subirVideoLocal(
    @Param('seccionId', ParseUUIDPipe) seccionId: string,
    @UploadedFile() archivo: Express.Multer.File,
  ) {
    const { url, pesoBytes } = await this.archivoServicio.guardar(archivo, 'multimedia', seccionId);
    return this.servicio.crearDesdeArchivo(seccionId, 'video_local', url, pesoBytes);
  }

  @Post('seccion/:seccionId/video-externo')
  agregarVideoExterno(
    @Param('seccionId', ParseUUIDPipe) seccionId: string,
    @Body() dto: AgregarVideoExternoDto,
  ) {
    return this.servicio.agregarVideoExterno(seccionId, dto);
  }

  @Patch('seccion/:seccionId/reordenar')
  reordenar(
    @Param('seccionId', ParseUUIDPipe) seccionId: string,
    @Body() dto: ReordenarMultimediaDto,
  ) {
    return this.servicio.reordenar(seccionId, dto);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarElementoMultimediaDto,
  ) {
    return this.servicio.actualizar(id, dto);
  }

  @Patch(':id/principal')
  marcarComoPrincipal(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('seccionId') seccionId: string,
  ) {
    return this.servicio.marcarComoPrincipal(id, seccionId);
  }

  @Patch(':id/estado')
  cambiarEstado(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CambiarEstadoElementoDto,
  ) {
    return this.servicio.cambiarEstado(id, dto);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicio.eliminar(id);
  }
}
