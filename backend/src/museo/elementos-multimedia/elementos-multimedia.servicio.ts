import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { ElementoMultimediaEntidad } from './entidades/elemento-multimedia.entidad';
import {
  ActualizarElementoMultimediaDto,
  AgregarVideoExternoDto,
  CambiarEstadoElementoDto,
  ReordenarMultimediaDto,
} from './dto/elementos-multimedia.dto';

@Injectable()
export class ElementosMultimediaServicio {
  constructor(
    @InjectModel(ElementoMultimediaEntidad)
    private readonly modelo: typeof ElementoMultimediaEntidad,
    @InjectConnection()
    private readonly sequelize: Sequelize,
  ) {}

  async obtenerPorSeccion(seccionId: string): Promise<ElementoMultimediaEntidad[]> {
    return this.modelo.findAll({
      where: { seccionId, eliminado: false },
      order: [['orden', 'ASC']],
    });
  }

  async obtenerPorId(id: string): Promise<ElementoMultimediaEntidad> {
    const elemento = await this.modelo.findOne({ where: { id, eliminado: false } });
    if (!elemento) {
      throw new NotFoundException(`Elemento multimedia con id ${id} no encontrado`);
    }
    return elemento;
  }

  async crearDesdeArchivo(
    seccionId: string,
    tipo: string,
    url: string,
    pesoBytes: number,
    extras: Partial<ActualizarElementoMultimediaDto> = {},
  ): Promise<ElementoMultimediaEntidad> {
    return this.modelo.create({ seccionId, tipo, url, pesoBytes, ...extras } as any);
  }

  async agregarVideoExterno(
    seccionId: string,
    dto: AgregarVideoExternoDto,
  ): Promise<ElementoMultimediaEntidad> {
    const tipo = this.detectarTipoVideoExterno(dto.url);
    return this.modelo.create({
      seccionId,
      tipo,
      url: dto.url,
      titulo: dto.titulo,
      descripcion: dto.descripcion,
    } as any);
  }

  async actualizar(id: string, dto: ActualizarElementoMultimediaDto): Promise<ElementoMultimediaEntidad> {
    const elemento = await this.obtenerPorId(id);
    return elemento.update({ ...dto, actualizadoEn: new Date() } as any);
  }

  async marcarComoPrincipal(id: string, seccionId: string): Promise<ElementoMultimediaEntidad> {
    await this.sequelize.transaction(async (t) => {
      await this.modelo.update({ esPrincipal: false }, { where: { seccionId, eliminado: false }, transaction: t });
      await this.modelo.update({ esPrincipal: true }, { where: { id }, transaction: t });
    });
    return this.obtenerPorId(id);
  }

  async cambiarEstado(id: string, dto: CambiarEstadoElementoDto): Promise<ElementoMultimediaEntidad> {
    const elemento = await this.obtenerPorId(id);
    return elemento.update({ estado: dto.estado, actualizadoEn: new Date() });
  }

  async eliminar(id: string): Promise<void> {
    const elemento = await this.obtenerPorId(id);
    await elemento.update({ eliminado: true });
  }

  async reordenar(seccionId: string, dto: ReordenarMultimediaDto): Promise<void> {
    await this.sequelize.transaction(async (t) => {
      for (const item of dto.items) {
        await this.modelo.update(
          { orden: item.orden },
          { where: { id: item.id, seccionId }, transaction: t },
        );
      }
    });
  }

  private detectarTipoVideoExterno(url: string): string {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'video_youtube';
    if (url.includes('vimeo.com')) return 'video_vimeo';
    return 'video_youtube';
  }
}
