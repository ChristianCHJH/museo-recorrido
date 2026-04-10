import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsuariosRolesControlador } from './usuarios-roles.controlador';
import { UsuariosRolesServicio } from './usuarios-roles.servicio';
import { UsuarioRol } from './entidades/usuario-rol.entidad';
import { Usuario } from '../usuarios/entidades/usuario.entidad';
import { Rol } from '../roles/entidades/rol.entidad';

@Module({
  imports: [SequelizeModule.forFeature([UsuarioRol, Usuario, Rol])],
  controllers: [UsuariosRolesControlador],
  providers: [UsuariosRolesServicio],
})
export class UsuariosRolesModulo {}
