import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SeccionesPermisoControlador } from './secciones-permiso.controlador';
import { SeccionesPermisoServicio } from './secciones-permiso.servicio';
import { SeccionPermiso } from './entidades/seccion-permiso.entidad';
import { Permiso } from '../permisos/entidades/permiso.entidad';
import { UsuarioPermiso } from '../usuarios-permisos/entidades/usuario-permiso.entidad';
import { RolPermiso } from '../roles-permisos/entidades/rol-permiso.entidad';

@Module({
  imports: [SequelizeModule.forFeature([SeccionPermiso, Permiso, UsuarioPermiso, RolPermiso])],
  controllers: [SeccionesPermisoControlador],
  providers: [SeccionesPermisoServicio],
  exports: [SeccionesPermisoServicio],
})
export class SeccionesPermisoModulo {}
