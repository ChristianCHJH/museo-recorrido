import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ExposicionEntidad } from './entidades/exposicion.entidad';
import { ExposicionesServicio } from './exposiciones.servicio';
import { ExposicionesControlador } from './exposiciones.controlador';

@Module({
  imports: [SequelizeModule.forFeature([ExposicionEntidad])],
  controllers: [ExposicionesControlador],
  providers: [ExposicionesServicio],
  exports: [ExposicionesServicio],
})
export class ExposicionesModulo {}
