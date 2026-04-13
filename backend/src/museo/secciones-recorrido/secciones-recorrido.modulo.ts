import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SeccionRecorridoEntidad } from './entidades/seccion-recorrido.entidad';
import { ExposicionesModulo } from '../exposiciones/exposiciones.modulo';
import { ElementosMultimediaModulo } from '../elementos-multimedia/elementos-multimedia.modulo';
import { SesionesVisitaModulo } from '../sesiones-visita/sesiones-visita.modulo';
import { ArchivoModulo } from '../archivos/archivo.modulo';
import { SeccionesRecorridoServicio } from './secciones-recorrido.servicio';
import { SeccionesRecorridoControlador } from './secciones-recorrido.controlador';

@Module({
  imports: [
    SequelizeModule.forFeature([SeccionRecorridoEntidad]),
    ExposicionesModulo,
    ElementosMultimediaModulo,
    ArchivoModulo,
    forwardRef(() => SesionesVisitaModulo),
  ],
  controllers: [SeccionesRecorridoControlador],
  providers: [SeccionesRecorridoServicio],
  exports: [SeccionesRecorridoServicio],
})
export class SeccionesRecorridoModulo {}
