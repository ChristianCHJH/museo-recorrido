import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { StringValue } from 'ms';
import ms = require('ms');
import { Usuario } from '../usuarios/entidades/usuario.entidad';
import { IniciarSesionDto } from './dto/iniciar-sesion.dto';
import { RefrescarTokenDto } from './dto/refrescar-token.dto';
import { CerrarSesionDto } from './dto/cerrar-sesion.dto';
import { RefreshTokensServicio } from '../refresh-tokens/refresh-tokens.servicio';
import { PayloadJwt } from './interfaces/payload-jwt.interface';

@Injectable()
export class AutenticacionServicio {
  private readonly duracionToken: string;
  private readonly duracionRefresh: string;
  private readonly duracionRefreshMs: number;

  constructor(
    @InjectModel(Usuario)
    private readonly usuarioModelo: typeof Usuario,
    private readonly jwtService: JwtService,
    private readonly refreshTokensServicio: RefreshTokensServicio,
  ) {
    this.duracionToken = process.env.JWT_EXPIRACION || '15m';
    this.duracionRefresh = process.env.JWT_REFRESH_EXPIRACION || '30d';
    const calculado = ms(this.duracionRefresh as StringValue);
    this.duracionRefreshMs =
      typeof calculado === 'number'
        ? calculado
        : ms('30d' as StringValue);
  }

  async iniciarSesion(dto: IniciarSesionDto) {
    const where = dto.correo
      ? { correo: dto.correo, estado: true }
      : { nombreUsuario: dto.nombreUsuario, estado: true };

    const usuario = await this.usuarioModelo.findOne({ where });
    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const coincide = await bcrypt.compare(
      dto.contrasena,
      usuario.contrasenaHash,
    );
    if (!coincide) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    await usuario.update({ ultimaSesion: new Date() });

    return this.emitirTokens(usuario);
  }

  async refrescarToken(dto: RefrescarTokenDto) {
    const refreshToken = await this.refreshTokensServicio.validarVigencia(
      dto.refreshToken,
    );
    const usuario = await this.usuarioModelo.findByPk(refreshToken.usuarioId);
    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return this.emitirTokens(usuario, refreshToken.jti);
  }

  async cerrarSesion(dto: CerrarSesionDto) {
    await this.refreshTokensServicio.revocar(dto.refreshToken);
    return { mensaje: 'Sesión cerrada correctamente' };
  }

  private async emitirTokens(usuario: Usuario, reemplazarJti?: string) {
    const payload: PayloadJwt = {
      sub: usuario.id,
      nombreUsuario: usuario.nombreUsuario,
    };
    const tokenAcceso = await this.jwtService.signAsync(payload);
    const jti = randomUUID();
    const expira = new Date(Date.now() + this.duracionRefreshMs);

    await this.refreshTokensServicio.crear({
      jti,
      usuarioId: usuario.id,
      expira: expira.toISOString(),
      revocado: false,
    });

    if (reemplazarJti) {
      await this.refreshTokensServicio.revocar(reemplazarJti, jti);
    }

    return {
      tokenAcceso,
      tipoToken: 'Bearer',
      expiraEn: this.duracionToken,
      refreshToken: jti,
    };
  }
}
