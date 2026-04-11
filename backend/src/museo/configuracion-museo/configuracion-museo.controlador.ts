import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfiguracionMuseoServicio } from './configuracion-museo.servicio';
import {
  ActualizarConfiguracionMuseoDto,
  CambiarEstadoConfiguracionMuseoDto,
} from './dto/crear-configuracion-museo.dto';
import { Publica } from '../../autenticacion/autenticacion/decoradores/publica.decorador';

@ApiTags('museo/configuracion')
@ApiBearerAuth()
@Controller('museo/configuracion')
export class ConfiguracionMuseoControlador {
  constructor(private readonly servicio: ConfiguracionMuseoServicio) {}

  @Publica()
  @ApiOperation({ summary: 'Obtener la configuración del museo' })
  @Get()
  obtener() {
    return this.servicio.obtener();
  }

  @ApiOperation({ summary: 'Actualizar la configuración del museo' })
  @Patch()
  actualizar(@Body() dto: ActualizarConfiguracionMuseoDto) {
    return this.servicio.actualizar(dto);
  }

  @ApiOperation({ summary: 'Cambiar estado de la configuración del museo' })
  @Patch('estado')
  cambiarEstado(@Body() dto: CambiarEstadoConfiguracionMuseoDto) {
    return this.servicio.cambiarEstado(dto);
  }
}
