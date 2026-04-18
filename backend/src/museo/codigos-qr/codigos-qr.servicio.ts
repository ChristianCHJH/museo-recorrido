import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { CodigoQrEntidad } from './entidades/codigo-qr.entidad';
import { SeccionRecorridoEntidad } from '../secciones-recorrido/entidades/seccion-recorrido.entidad';
import { ActualizarCodigoQrDto, CambiarEstadoQrDto, CrearCodigoQrDto } from './dto/codigos-qr.dto';
import { ArchivoServicio } from '../archivos/archivo.servicio';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class CodigosQrServicio {
  constructor(
    @InjectModel(CodigoQrEntidad)
    private readonly modelo: typeof CodigoQrEntidad,
    @InjectModel(SeccionRecorridoEntidad)
    private readonly modeloSeccion: typeof SeccionRecorridoEntidad,
    private readonly archivoServicio: ArchivoServicio,
  ) {}

  async obtenerTodos(): Promise<CodigoQrEntidad[]> {
    return this.modelo.findAll({
      where: { eliminado: false },
      include: [{ model: SeccionRecorridoEntidad, required: false }],
      order: [['creadoEn', 'DESC']],
    });
  }

  async obtenerPorId(id: string): Promise<CodigoQrEntidad> {
    const qr = await this.modelo.findOne({
      where: { id, eliminado: false },
      include: [{ model: SeccionRecorridoEntidad, required: false }],
    });
    if (!qr) throw new NotFoundException(`Código QR con id ${id} no encontrado`);
    return qr;
  }

  async obtenerPorCodigo(codigo: string): Promise<CodigoQrEntidad | null> {
    return this.modelo.findOne({
      where: { codigo, eliminado: false },
      include: [{ model: SeccionRecorridoEntidad, required: false }],
    });
  }

  async crear(dto: CrearCodigoQrDto): Promise<CodigoQrEntidad> {
    const codigo = uuidv4();
    const imagenQrUrl = await this.generarImagenQr(codigo);
    const qr = await this.modelo.create({
      ...dto,
      codigo,
      imagenQrUrl,
    } as any);
    return qr;
  }

  async actualizar(id: string, dto: ActualizarCodigoQrDto): Promise<CodigoQrEntidad> {
    const qr = await this.obtenerPorId(id);
    return qr.update({ ...dto, actualizadoEn: new Date() });
  }

  async cambiarEstado(id: string, dto: CambiarEstadoQrDto): Promise<CodigoQrEntidad> {
    const qr = await this.obtenerPorId(id);
    return qr.update({ activo: dto.activo, actualizadoEn: new Date() });
  }

  async eliminar(id: string): Promise<void> {
    const qr = await this.obtenerPorId(id);
    await qr.update({ eliminado: true });
  }

  async obtenerImagenQr(id: string): Promise<{ buffer: Buffer; nombre: string }> {
    const qr = await this.obtenerPorId(id);
    if (!qr.imagenQrUrl) throw new NotFoundException('El QR no tiene imagen generada');
    const rutaAbsoluta = path.join(process.cwd(), qr.imagenQrUrl);
    const buffer = fs.readFileSync(rutaAbsoluta);
    return { buffer, nombre: `qr-${qr.codigo}.png` };
  }

  async obtenerEstadisticas(id: string) {
    const qr = await this.obtenerPorId(id);
    return { totalEscaneos: qr.totalEscaneos, activo: qr.activo, codigo: qr.codigo };
  }

  async incrementarEscaneos(id: string): Promise<void> {
    await this.modelo.increment('totalEscaneos', { where: { id } });
  }

  async obtenerSeccionesDisponibles(excluirQrId?: string): Promise<any[]> {
    const seccionesOcupadas = await this.modelo.findAll({
      attributes: ['seccionId'],
      where: {
        seccionId: { [Op.ne]: null },
        eliminado: false,
        ...(excluirQrId && { id: { [Op.ne]: excluirQrId } } ),
      },
      raw: true,
    });
    const ocupadosIds = seccionesOcupadas
      .map(q => q.seccionId)
      .filter((id): id is string => id !== null);

    return this.modeloSeccion.findAll({
      attributes: ['id', 'nombre', 'subtitulo'],
      where: {
        eliminado: false,
        id: { [Op.notIn]: ocupadosIds.length > 0 ? ocupadosIds : [''] },
      },
      order: [['nombre', 'ASC']],
      raw: true,
    });
  }

  private async generarImagenQr(codigo: string): Promise<string> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const QRCode = require('qrcode') as typeof import('qrcode');
      const urlVisita = `${process.env.APP_URL || 'http://localhost:4200'}/r/${codigo}`;
      const directorio = path.join(process.cwd(), 'uploads', 'qr');
      fs.mkdirSync(directorio, { recursive: true });
      const nombreArchivo = `${codigo}.png`;
      const rutaCompleta = path.join(directorio, nombreArchivo);
      await QRCode.toFile(rutaCompleta, urlVisita, { type: 'png', width: 400 });
      return `/uploads/qr/${nombreArchivo}`;
    } catch {
      return '';
    }
  }
}
