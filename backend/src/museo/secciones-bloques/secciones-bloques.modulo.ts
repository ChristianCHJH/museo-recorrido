import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SeccionBloqueEntidad } from './entidades/seccion-bloque.entidad';
import { SeccionesBloquesServicio } from './secciones-bloques.servicio';
import { SeccionesBloquesControlador } from './secciones-bloques.controlador';

@Module({
  imports: [SequelizeModule.forFeature([SeccionBloqueEntidad])],
  controllers: [SeccionesBloquesControlador],
  providers: [SeccionesBloquesServicio],
  exports: [SeccionesBloquesServicio],
})
export class SeccionesBloquesModulo {}
