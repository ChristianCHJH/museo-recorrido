import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PermisosControlador } from './permisos.controlador';
import { PermisosServicio } from './permisos.servicio';
import { Permiso } from './entidades/permiso.entidad';
import { SeccionPermiso } from '../secciones-permiso/entidades/seccion-permiso.entidad';
import { UsuarioPermiso } from '../usuarios-permisos/entidades/usuario-permiso.entidad';

@Module({
  imports: [
    SequelizeModule.forFeature([Permiso, SeccionPermiso, UsuarioPermiso]),
  ],
  controllers: [PermisosControlador],
  providers: [PermisosServicio],
  exports: [PermisosServicio],
})
export class PermisosModulo {}
