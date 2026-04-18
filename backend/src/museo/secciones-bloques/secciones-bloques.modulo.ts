import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SeccionBloqueEntidad } from './entidades/seccion-bloque.entidad';
import { SeccionesBloquesServicio } from './secciones-bloques.servicio';
import { SeccionesBloquesControlador } from './secciones-bloques.controlador';
import { SesionesVisitaModulo } from '../sesiones-visita/sesiones-visita.modulo';

@Module({
  imports: [SequelizeModule.forFeature([SeccionBloqueEntidad]), SesionesVisitaModulo],
  controllers: [SeccionesBloquesControlador],
  providers: [SeccionesBloquesServicio],
  exports: [SeccionesBloquesServicio],
})
export class SeccionesBloquesModulo {}
