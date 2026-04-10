import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RolesPermisosControlador } from './roles-permisos.controlador';
import { RolesPermisosServicio } from './roles-permisos.servicio';
import { RolPermiso } from './entidades/rol-permiso.entidad';
import { Rol } from '../roles/entidades/rol.entidad';
import { Permiso } from '../permisos/entidades/permiso.entidad';

@Module({
  imports: [SequelizeModule.forFeature([RolPermiso, Rol, Permiso])],
  controllers: [RolesPermisosControlador],
  providers: [RolesPermisosServicio],
})
export class RolesPermisosModulo {}
