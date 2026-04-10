import { IsBoolean } from 'class-validator';

export class CambiarEstadoRolPermisoDto {
  @IsBoolean()
  estado: boolean;
}
