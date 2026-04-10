import { PartialType } from '@nestjs/mapped-types';
import { CrearRefreshTokenDto } from './crear-refresh-token.dto';

export class ActualizarRefreshTokenDto extends PartialType(
  CrearRefreshTokenDto,
) {}
