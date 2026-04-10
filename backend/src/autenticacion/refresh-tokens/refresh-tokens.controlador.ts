import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RefreshTokensServicio } from './refresh-tokens.servicio';
import { CrearRefreshTokenDto } from './dto/crear-refresh-token.dto';
import { ActualizarRefreshTokenDto } from './dto/actualizar-refresh-token.dto';
import { CambiarEstadoRefreshTokenDto } from './dto/cambiar-estado-refresh-token.dto';

@ApiTags('refresh-tokens')
@Controller('autenticacion/refresh-tokens')
export class RefreshTokensControlador {
  constructor(private readonly servicio: RefreshTokensServicio) {}

  @Post()
  crear(@Body() dto: CrearRefreshTokenDto) {
    return this.servicio.crear(dto);
  }

  @Get()
  listar() {
    return this.servicio.listar();
  }

  @Get(':jti')
  buscarPorId(@Param('jti') jti: string) {
    return this.servicio.buscarPorId(jti);
  }

  @Patch(':jti')
  actualizar(@Param('jti') jti: string, @Body() dto: ActualizarRefreshTokenDto) {
    return this.servicio.actualizar(jti, dto);
  }

  @Patch(':jti/estado')
  cambiarEstado(
    @Param('jti') jti: string,
    @Body() dto: CambiarEstadoRefreshTokenDto,
  ) {
    return this.servicio.cambiarEstado(jti, dto);
  }

  @Delete(':jti')
  eliminar(@Param('jti') jti: string) {
    return this.servicio.eliminar(jti);
  }
}
