import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SesionVisitaEntidad } from './entidades/sesion-visita.entidad';
import { RegistroAccesoQrEntidad } from './entidades/registro-acceso-qr.entidad';
import { SesionesVisitaServicio } from './sesiones-visita.servicio';
import { SesionesVisitaControlador } from './sesiones-visita.controlador';
import { CodigosQrModulo } from '../codigos-qr/codigos-qr.modulo';
import { SeccionesRecorridoModulo } from '../secciones-recorrido/secciones-recorrido.modulo';
import { ConfiguracionMuseoModulo } from '../configuracion-museo/configuracion-museo.modulo';

@Module({
  imports: [
    SequelizeModule.forFeature([SesionVisitaEntidad, RegistroAccesoQrEntidad]),
    CodigosQrModulo,
    forwardRef(() => SeccionesRecorridoModulo),
    ConfiguracionMuseoModulo,
  ],
  controllers: [SesionesVisitaControlador],
  providers: [SesionesVisitaServicio],
  exports: [SesionesVisitaServicio],
})
export class SesionesVisitaModulo {}
