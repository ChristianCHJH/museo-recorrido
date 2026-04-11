import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CodigoQrEntidad } from './entidades/codigo-qr.entidad';
import { CodigosQrServicio } from './codigos-qr.servicio';
import { CodigosQrControlador } from './codigos-qr.controlador';
import { ArchivoModulo } from '../archivos/archivo.modulo';

@Module({
  imports: [SequelizeModule.forFeature([CodigoQrEntidad]), ArchivoModulo],
  controllers: [CodigosQrControlador],
  providers: [CodigosQrServicio],
  exports: [CodigosQrServicio],
})
export class CodigosQrModulo {}
