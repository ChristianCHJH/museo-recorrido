import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { ElementoMultimediaEntidad } from './entidades/elemento-multimedia.entidad';
import {
  ActualizarElementoMultimediaDto,
  AgregarVideoExternoDto,
  CambiarEstadoElementoDto,
  ReordenarMultimediaDto,
} from './dto/elementos-multimedia.dto';
import {
  ActualizarMediaDto,
  FiltrarMediaDto,
  ResultadoBibliotecaMedia,
  SubirArchivoLibreriaDto,
} from './dto/biblioteca-media.dto';
import { ArchivoServicio } from '../archivos/archivo.servicio';

@Injectable()
export class ElementosMultimediaServicio {
  constructor(
    @InjectModel(ElementoMultimediaEntidad)
    private readonly modelo: typeof ElementoMultimediaEntidad,
    @InjectConnection()
    private readonly sequelize: Sequelize,
    private readonly archivoServicio: ArchivoServicio,
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

  async obtenerBiblioteca(filtros: FiltrarMediaDto): Promise<ResultadoBibliotecaMedia> {
    const pagina = filtros.pagina ?? 1;
    const limite = filtros.limite ?? 20;
    const offset = (pagina - 1) * limite;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clausulaWhere: any = { eliminado: false };

    if (filtros.tipo) {
      clausulaWhere.tipo = filtros.tipo;
    }

    if (filtros.busqueda) {
      const patron = `%${filtros.busqueda}%`;
      clausulaWhere[Op.or] = [
        { titulo: { [Op.iLike]: patron } },
        { descripcion: { [Op.iLike]: patron } },
        { nombre: { [Op.iLike]: patron } },
      ];
    }

    const { count, rows } = await this.modelo.findAndCountAll({
      where: clausulaWhere,
      order: [['creadoEn', 'DESC']],
      limit: limite,
      offset,
    });

    return { items: rows, total: count, pagina, limite };
  }

  async obtenerUnoPorId(id: string): Promise<ElementoMultimediaEntidad> {
    const elemento = await this.modelo.findOne({ where: { id, eliminado: false } });
    if (!elemento) {
      throw new NotFoundException(`Medio con id ${id} no encontrado`);
    }
    return elemento;
  }

  async actualizarMedia(id: string, dto: ActualizarMediaDto): Promise<ElementoMultimediaEntidad> {
    const elemento = await this.obtenerUnoPorId(id);
    return elemento.update({ ...dto, actualizadoEn: new Date() } as any);
  }

  async eliminarMedia(id: string): Promise<void> {
    const elemento = await this.obtenerUnoPorId(id);
    await elemento.update({ eliminado: true });
  }

  async subirABiblioteca(
    archivo: Express.Multer.File,
    dto: SubirArchivoLibreriaDto,
  ): Promise<ElementoMultimediaEntidad> {
    const { url, pesoBytes } = await this.archivoServicio.guardar(archivo, 'multimedia', 'biblioteca');
    const tipo = this.detectarTipoDesdeArchivo(archivo.mimetype);

    return this.modelo.create({
      seccionId: null,
      tipo,
      url,
      pesoBytes,
      nombre: dto.nombre ?? null,
      descripcion: dto.descripcion ?? null,
      esPublico: dto.esPublico ?? true,
    } as any);
  }

  private detectarTipoDesdeArchivo(mimetype: string): string {
    if (mimetype.startsWith('image/')) return 'imagen';
    if (mimetype.startsWith('audio/')) return 'audio';
    if (mimetype.startsWith('video/')) return 'video_local';
    return 'imagen';
  }

  private detectarTipoVideoExterno(url: string): string {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'video_youtube';
    if (url.includes('vimeo.com')) return 'video_vimeo';
    return 'video_youtube';
  }
}
