import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ConfiguracionMuseoEntidad } from './entidades/configuracion-museo.entidad';
import {
  ActualizarConfiguracionMuseoDto,
  CambiarEstadoConfiguracionMuseoDto,
  CrearConfiguracionMuseoDto,
} from './dto/crear-configuracion-museo.dto';

@Injectable()
export class ConfiguracionMuseoServicio {
  constructor(
    @InjectModel(ConfiguracionMuseoEntidad)
    private readonly modelo: typeof ConfiguracionMuseoEntidad,
  ) {}

  async obtener(): Promise<ConfiguracionMuseoEntidad> {
    const configuracion = await this.modelo.findOne({
      where: { eliminado: false },
    });
    if (!configuracion) {
      throw new NotFoundException('Configuración del museo no encontrada');
    }
    return configuracion;
  }

  async crear(dto: CrearConfiguracionMuseoDto): Promise<ConfiguracionMuseoEntidad> {
    return this.modelo.create(dto as Parameters<typeof this.modelo.create>[0]);
  }

  async actualizar(dto: ActualizarConfiguracionMuseoDto): Promise<ConfiguracionMuseoEntidad> {
    const configuracion = await this.obtener();
    return configuracion.update({ ...dto });
  }

  async cambiarEstado(dto: CambiarEstadoConfiguracionMuseoDto): Promise<ConfiguracionMuseoEntidad> {
    const config = await this.obtener();
    await config.update({ estado: dto.estado, actualizadoEn: new Date() });
    return config;
  }
}
