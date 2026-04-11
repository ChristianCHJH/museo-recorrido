import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { SeccionRecorridoEntidad } from './entidades/seccion-recorrido.entidad';
import { ExposicionEntidad } from '../exposiciones/entidades/exposicion.entidad';
import {
  ActualizarSeccionRecorridoDto,
  CambiarEstadoSeccionDto,
  CrearSeccionRecorridoDto,
  ReordenarSeccionesDto,
} from './dto/crear-seccion-recorrido.dto';

@Injectable()
export class SeccionesRecorridoServicio {
  constructor(
    @InjectModel(SeccionRecorridoEntidad)
    private readonly modelo: typeof SeccionRecorridoEntidad,
    @InjectConnection()
    private readonly sequelize: Sequelize,
  ) {}

  async obtenerTodas(): Promise<SeccionRecorridoEntidad[]> {
    return this.modelo.findAll({
      where: { eliminado: false },
      order: [['orden', 'ASC']],
    });
  }

  async obtenerPorExposicion(exposicionId: string): Promise<SeccionRecorridoEntidad[]> {
    return this.modelo.findAll({
      where: { exposicionId, eliminado: false },
      order: [['orden', 'ASC']],
    });
  }

  async obtenerPorId(id: string): Promise<SeccionRecorridoEntidad> {
    const seccion = await this.modelo.findOne({
      where: { id, eliminado: false },
      include: [ExposicionEntidad],
    });
    if (!seccion) {
      throw new NotFoundException(`Sección con id ${id} no encontrada`);
    }
    return seccion;
  }

  async crear(dto: CrearSeccionRecorridoDto): Promise<SeccionRecorridoEntidad> {
    return this.modelo.create(dto as Parameters<typeof this.modelo.create>[0]);
  }

  async actualizar(id: string, dto: ActualizarSeccionRecorridoDto): Promise<SeccionRecorridoEntidad> {
    const seccion = await this.obtenerPorId(id);
    return seccion.update({ ...dto });
  }

  async cambiarEstado(id: string, dto: CambiarEstadoSeccionDto): Promise<SeccionRecorridoEntidad> {
    const seccion = await this.obtenerPorId(id);
    return seccion.update({ estado: dto.estado });
  }

  async eliminar(id: string): Promise<void> {
    const seccion = await this.obtenerPorId(id);
    await seccion.update({ eliminado: true });
  }

  async reordenar(dto: ReordenarSeccionesDto): Promise<void> {
    await this.sequelize.transaction(async (t) => {
      for (const item of dto.items) {
        await this.modelo.update({ orden: item.orden }, { where: { id: item.id }, transaction: t });
      }
    });
  }
}
