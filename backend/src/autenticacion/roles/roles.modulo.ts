import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RolesControlador } from './roles.controlador';
import { RolesServicio } from './roles.servicio';
import { Rol } from './entidades/rol.entidad';
import { UsuarioRol } from '../usuarios-roles/entidades/usuario-rol.entidad';

@Module({
  imports: [SequelizeModule.forFeature([Rol, UsuarioRol])],
  controllers: [RolesControlador],
  providers: [RolesServicio],
  exports: [RolesServicio],
})
export class RolesModulo {}
