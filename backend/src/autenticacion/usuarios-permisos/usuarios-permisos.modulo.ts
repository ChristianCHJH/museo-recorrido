import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsuariosPermisosControlador } from './usuarios-permisos.controlador';
import { UsuariosPermisosServicio } from './usuarios-permisos.servicio';
import { UsuarioPermiso } from './entidades/usuario-permiso.entidad';
import { Usuario } from '../usuarios/entidades/usuario.entidad';
import { Permiso } from '../permisos/entidades/permiso.entidad';

@Module({
  imports: [SequelizeModule.forFeature([UsuarioPermiso, Usuario, Permiso])],
  controllers: [UsuariosPermisosControlador],
  providers: [UsuariosPermisosServicio],
})
export class UsuariosPermisosModulo {}
