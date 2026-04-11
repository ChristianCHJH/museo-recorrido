import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ElementoMultimediaEntidad } from './entidades/elemento-multimedia.entidad';
import { ElementosMultimediaServicio } from './elementos-multimedia.servicio';
import { ElementosMultimediaControlador } from './elementos-multimedia.controlador';
import { ArchivoModulo } from '../archivos/archivo.modulo';

@Module({
  imports: [SequelizeModule.forFeature([ElementoMultimediaEntidad]), ArchivoModulo],
  controllers: [ElementosMultimediaControlador],
  providers: [ElementosMultimediaServicio],
  exports: [ElementosMultimediaServicio],
})
export class ElementosMultimediaModulo {}
