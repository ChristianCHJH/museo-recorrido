import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { RefreshToken } from './entidades/refresh-token.entidad';
import { CrearRefreshTokenDto } from './dto/crear-refresh-token.dto';
import { ActualizarRefreshTokenDto } from './dto/actualizar-refresh-token.dto';
import { CambiarEstadoRefreshTokenDto } from './dto/cambiar-estado-refresh-token.dto';

@Injectable()
export class RefreshTokensServicio {
  constructor(
    @InjectModel(RefreshToken)
    private readonly refreshModelo: typeof RefreshToken,
  ) {}

  crear(dto: CrearRefreshTokenDto) {
    return this.refreshModelo.create({
      jti: dto.jti,
      usuarioId: dto.usuarioId,
      expira: new Date(dto.expira),
      hash: dto.hash ?? dto.jti,
      revocado: dto.revocado ?? false,
      reemplazadoPorJti: dto.reemplazadoPorJti ?? null,
      ip: dto.ip ?? null,
      agenteUsuario: dto.agenteUsuario ?? null,
    });
  }

  listar() {
    return this.refreshModelo.findAll({
      order: [['creadoEn', 'DESC']],
    });
  }

  async buscarPorId(jti: string) {
    const token = await this.refreshModelo.findByPk(jti);
    if (!token) {
      throw new NotFoundException(`Refresh token ${jti} no encontrado`);
    }
    return token;
  }

  async validarVigencia(jti: string) {
    const token = await this.buscarPorId(jti);
    if (token.revocado) {
      throw new UnauthorizedException('El token de sesión fue revocado');
    }
    if (token.expira && token.expira.getTime() < Date.now()) {
      throw new UnauthorizedException('El token de sesión expiró');
    }
    return token;
  }

  async actualizar(jti: string, dto: ActualizarRefreshTokenDto) {
    const token = await this.buscarPorId(jti);
    if (dto.expira) {
      dto.expira = new Date(dto.expira).toISOString();
    }
    return token.update({
      ...dto,
      hash: dto.hash ?? token.hash,
      expira: dto.expira ? new Date(dto.expira) : token.expira,
    });
  }

  async cambiarEstado(jti: string, dto: CambiarEstadoRefreshTokenDto) {
    const token = await this.buscarPorId(jti);
    token.revocado = dto.revocado;
    return token.save();
  }

  async eliminar(jti: string) {
    return this.revocar(jti);
  }

  async revocar(jti: string, reemplazadoPorJti?: string) {
    const token = await this.buscarPorId(jti);
    token.revocado = true;
    token.reemplazadoPorJti = reemplazadoPorJti ?? token.reemplazadoPorJti;
    return token.save();
  }
}
