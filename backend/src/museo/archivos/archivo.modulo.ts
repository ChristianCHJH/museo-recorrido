import { Module } from '@nestjs/common';
import { ArchivoServicio } from './archivo.servicio';

@Module({
  providers: [ArchivoServicio],
  exports: [ArchivoServicio],
})
export class ArchivoModulo {}
