import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RefreshTokensControlador } from './refresh-tokens.controlador';
import { RefreshTokensServicio } from './refresh-tokens.servicio';
import { RefreshToken } from './entidades/refresh-token.entidad';

@Module({
  imports: [SequelizeModule.forFeature([RefreshToken])],
  controllers: [RefreshTokensControlador],
  providers: [RefreshTokensServicio],
  exports: [RefreshTokensServicio],
})
export class RefreshTokensModulo {}
