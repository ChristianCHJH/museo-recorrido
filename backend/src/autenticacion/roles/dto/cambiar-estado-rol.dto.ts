import { IsBoolean } from 'class-validator';

export class CambiarEstadoRolDto {
  @IsBoolean()
  estado: boolean;
}
