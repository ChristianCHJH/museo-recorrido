import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { SeccionRecorridoEntidad } from './entidades/seccion-recorrido.entidad';
import { ExposicionEntidad } from '../exposiciones/entidades/exposicion.entidad';
import { ElementoMultimediaEntidad } from '../elementos-multimedia/entidades/elemento-multimedia.entidad';
import { SeccionBloqueEntidad } from '../secciones-bloques/entidades/seccion-bloque.entidad';
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
      include: [
        ExposicionEntidad,
        {
          model: SeccionBloqueEntidad,
          as: 'bloques',
          where: { eliminado: false },
          required: false,
          order: [['orden', 'ASC']],
        },
      ],
    });
    if (!seccion) {
      throw new NotFoundException(`Sección con id ${id} no encontrada`);
    }
    return seccion;
  }

  async crear(dto: CrearSeccionRecorridoDto): Promise<SeccionRecorridoEntidad> {
    return this.modelo.create(dto as any);
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

  async obtenerPublicaPorId(id: string): Promise<SeccionRecorridoEntidad> {
    const seccion = await this.modelo.findOne({
      where: { id, estado: true, eliminado: false },
      include: [
        ExposicionEntidad,
        {
          model: ElementoMultimediaEntidad,
          where: { estado: true, eliminado: false },
          required: false,
          order: [['orden', 'ASC']],
        },
        {
          model: SeccionBloqueEntidad,
          as: 'bloques',
          where: { eliminado: false, estado: true },
          required: false,
          order: [['orden', 'ASC']],
        },
      ],
    });
    if (!seccion) throw new NotFoundException(`Sección con id ${id} no encontrada o no está publicada`);
    return seccion;
  }

  async reordenar(dto: ReordenarSeccionesDto): Promise<void> {
    await this.sequelize.transaction(async (t) => {
      for (const item of dto.items) {
        await this.modelo.update({ orden: item.orden }, { where: { id: item.id }, transaction: t });
      }
    });
  }
}
