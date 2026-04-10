import { IsBoolean } from 'class-validator';

export class CambiarEstadoRefreshTokenDto {
  @IsBoolean()
  revocado: boolean;
}
