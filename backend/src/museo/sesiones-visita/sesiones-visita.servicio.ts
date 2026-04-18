import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import { SesionVisitaEntidad } from './entidades/sesion-visita.entidad';
import { RegistroAccesoQrEntidad } from './entidades/registro-acceso-qr.entidad';
import { CodigoQrEntidad } from '../codigos-qr/entidades/codigo-qr.entidad';
import { CodigosQrServicio } from '../codigos-qr/codigos-qr.servicio';
import { SeccionRecorridoEntidad } from '../secciones-recorrido/entidades/seccion-recorrido.entidad';
import { ConfiguracionMuseoServicio } from '../configuracion-museo/configuracion-museo.servicio';

@Injectable()
export class SesionesVisitaServicio {
  constructor(
    @InjectModel(SesionVisitaEntidad)
    private readonly modeloSesion: typeof SesionVisitaEntidad,
    @InjectModel(RegistroAccesoQrEntidad)
    private readonly modeloRegistro: typeof RegistroAccesoQrEntidad,
    private readonly codigosQrServicio: CodigosQrServicio,
    private readonly configuracionServicio: ConfiguracionMuseoServicio,
  ) {}

  async iniciarSesion(
    codigoQr: string,
    ipOrigen: string,
    userAgent: string,
  ): Promise<{ token: string; seccionId: string }> {
    const qr = await this.codigosQrServicio.obtenerPorCodigo(codigoQr);

    if (!qr) {
      throw new NotFoundException('Código QR no encontrado');
    }

    if (!qr.activo) {
      await this.registrarAcceso(qr.id, null, ipOrigen, userAgent, 'qr_inactivo');
      throw new BadRequestException('Este código QR está desactivado');
    }

    if (!qr.seccionId) {
      await this.registrarAcceso(qr.id, null, ipOrigen, userAgent, 'qr_sin_seccion');
      throw new BadRequestException('Este QR no tiene una sección asignada');
    }

    if (!(qr.seccion as SeccionRecorridoEntidad)?.estado) {
      await this.registrarAcceso(qr.id, null, ipOrigen, userAgent, 'seccion_inactiva');
      throw new BadRequestException('La sección asociada no está disponible');
    }

    const configuracion = await this.configuracionServicio.obtener();
    const duracion = configuracion.duracionSesionVisitaMinutos;
    const token = uuidv4();
    const ahora = new Date();
    const fechaExpiracion = new Date(ahora.getTime() + duracion * 60 * 1000);

    const sesion = await this.modeloSesion.create({
      token,
      codigoQrId: qr.id,
      ipOrigen,
      userAgent,
      fechaExpiracion,
      fechaCreacion: ahora,
      fechaUltimoAcceso: ahora,
    } as any);

    await this.registrarAcceso(qr.id, sesion.id, ipOrigen, userAgent, 'token_emitido');
    await this.codigosQrServicio.incrementarEscaneos(qr.id);

    return { token, seccionId: qr.seccionId };
  }

  async verificarToken(token: string): Promise<SesionVisitaEntidad> {
    const sesion = await this.modeloSesion.findOne({
      where: { token, eliminado: false },
      include: [CodigoQrEntidad],
    });

    if (!sesion) throw new UnauthorizedException('Token de visita inválido');
    if (!sesion.estado) throw new UnauthorizedException('Sesión revocada');
    if (new Date() > sesion.fechaExpiracion) {
      throw new UnauthorizedException('El token de visita ha expirado');
    }

    await sesion.update({
      fechaUltimoAcceso: new Date(),
      totalAccesos: sesion.totalAccesos + 1,
    });

    return sesion;
  }

  async obtenerSesionesActivas(): Promise<SesionVisitaEntidad[]> {
    return this.modeloSesion.findAll({
      where: {
        eliminado: false,
        estado: true,
        fechaExpiracion: { [Op.gt]: new Date() },
      },
      include: [CodigoQrEntidad],
      order: [['fechaCreacion', 'DESC']],
    });
  }

  async revocarSesion(id: string): Promise<void> {
    const sesion = await this.modeloSesion.findOne({ where: { id, eliminado: false } });
    if (!sesion) throw new NotFoundException(`Sesión con id ${id} no encontrada`);
    await sesion.update({ estado: false });
  }

  async obtenerLogs(): Promise<RegistroAccesoQrEntidad[]> {
    return this.modeloRegistro.findAll({
      include: [CodigoQrEntidad],
      order: [['fechaAcceso', 'DESC']],
      limit: 500,
    });
  }

  private async registrarAcceso(
    codigoQrId: string,
    sesionVisitaId: string | null,
    ipOrigen: string,
    userAgent: string,
    resultado: string,
  ): Promise<void> {
    await this.modeloRegistro.create({
      codigoQrId,
      sesionVisitaId,
      ipOrigen,
      userAgent,
      resultado,
    } as any);
  }
}
