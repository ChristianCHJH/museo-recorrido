import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { ExposicionEntidad } from './entidades/exposicion.entidad';
import {
  ActualizarExposicionDto,
  CambiarEstadoExposicionDto,
  CrearExposicionDto,
  ReordenarExposicionesDto,
} from './dto/crear-exposicion.dto';

@Injectable()
export class ExposicionesServicio {
  constructor(
    @InjectModel(ExposicionEntidad)
    private readonly modelo: typeof ExposicionEntidad,
    @InjectConnection()
    private readonly sequelize: Sequelize,
  ) {}

  async obtenerTodas(): Promise<ExposicionEntidad[]> {
    return this.modelo.findAll({
      where: { eliminado: false },
      order: [['orden', 'ASC']],
    });
  }

  async obtenerActivas(): Promise<ExposicionEntidad[]> {
    return this.modelo.findAll({
      where: { eliminado: false, estado: true },
      order: [['orden', 'ASC']],
    });
  }

  async obtenerPorId(id: string): Promise<ExposicionEntidad> {
    const exposicion = await this.modelo.findOne({
      where: { id, eliminado: false },
    });
    if (!exposicion) {
      throw new NotFoundException(`Exposición con id ${id} no encontrada`);
    }
    return exposicion;
  }

  async crear(dto: CrearExposicionDto): Promise<ExposicionEntidad> {
    return this.modelo.create(dto as any);
  }

  async actualizar(id: string, dto: ActualizarExposicionDto): Promise<ExposicionEntidad> {
    const exposicion = await this.obtenerPorId(id);
    return exposicion.update({ ...dto } as any);
  }

  async cambiarEstado(id: string, dto: CambiarEstadoExposicionDto): Promise<ExposicionEntidad> {
    const exposicion = await this.obtenerPorId(id);
    return exposicion.update({ estado: dto.estado });
  }

  async eliminar(id: string): Promise<void> {
    const exposicion = await this.obtenerPorId(id);
    await exposicion.update({ eliminado: true });
  }

  async reordenar(dto: ReordenarExposicionesDto): Promise<void> {
    await this.sequelize.transaction(async (t) => {
      for (const item of dto.items) {
        await this.modelo.update({ orden: item.orden }, { where: { id: item.id }, transaction: t });
      }
    });
  }
}
