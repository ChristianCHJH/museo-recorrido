import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { AutenticacionControlador } from './autenticacion.controlador';
import { AutenticacionServicio } from './autenticacion.servicio';
import { Usuario } from '../usuarios/entidades/usuario.entidad';
import { UsuarioRol } from '../usuarios-roles/entidades/usuario-rol.entidad';
import { RolPermiso } from '../roles-permisos/entidades/rol-permiso.entidad';
import { UsuarioPermiso } from '../usuarios-permisos/entidades/usuario-permiso.entidad';
import { RefreshTokensModulo } from '../refresh-tokens/refresh-tokens.modulo';
import { JwtEstrategia } from './estrategias/jwt.estrategia';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRETO || 'cambia_estoseguro',
        signOptions: {
          expiresIn: process.env.JWT_EXPIRACION || '15m',
        },
      }),
    }),
    SequelizeModule.forFeature([Usuario, UsuarioRol, RolPermiso, UsuarioPermiso]),
    RefreshTokensModulo,
  ],
  controllers: [AutenticacionControlador],
  providers: [AutenticacionServicio, JwtEstrategia],
  exports: [AutenticacionServicio],
})
export class AutenticacionModulo {}
