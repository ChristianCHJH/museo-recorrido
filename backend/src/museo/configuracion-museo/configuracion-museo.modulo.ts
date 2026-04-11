import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfiguracionMuseoEntidad } from './entidades/configuracion-museo.entidad';
import { ConfiguracionMuseoServicio } from './configuracion-museo.servicio';
import { ConfiguracionMuseoControlador } from './configuracion-museo.controlador';

@Module({
  imports: [SequelizeModule.forFeature([ConfiguracionMuseoEntidad])],
  controllers: [ConfiguracionMuseoControlador],
  providers: [ConfiguracionMuseoServicio],
  exports: [ConfiguracionMuseoServicio],
})
export class ConfiguracionMuseoModulo {}
