import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CodigoQrEntidad } from './entidades/codigo-qr.entidad';
import { SeccionRecorridoEntidad } from '../secciones-recorrido/entidades/seccion-recorrido.entidad';
import { CodigosQrServicio } from './codigos-qr.servicio';
import { CodigosQrControlador } from './codigos-qr.controlador';
import { ArchivoModulo } from '../archivos/archivo.modulo';

@Module({
  imports: [SequelizeModule.forFeature([CodigoQrEntidad, SeccionRecorridoEntidad]), ArchivoModulo],
  controllers: [CodigosQrControlador],
  providers: [CodigosQrServicio],
  exports: [CodigosQrServicio],
})
export class CodigosQrModulo {}
