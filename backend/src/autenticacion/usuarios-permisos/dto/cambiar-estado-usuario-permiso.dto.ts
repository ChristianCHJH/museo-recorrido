import { IsBoolean } from 'class-validator';

export class CambiarEstadoUsuarioPermisoDto {
  @IsBoolean()
  estado: boolean;
}
