import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SeccionRecorridoEntidad } from './entidades/seccion-recorrido.entidad';
import { ExposicionesModulo } from '../exposiciones/exposiciones.modulo';
import { SeccionesRecorridoServicio } from './secciones-recorrido.servicio';
import { SeccionesRecorridoControlador } from './secciones-recorrido.controlador';

@Module({
  imports: [SequelizeModule.forFeature([SeccionRecorridoEntidad]), ExposicionesModulo],
  controllers: [SeccionesRecorridoControlador],
  providers: [SeccionesRecorridoServicio],
  exports: [SeccionesRecorridoServicio],
})
export class SeccionesRecorridoModulo {}
