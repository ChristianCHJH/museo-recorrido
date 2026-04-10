import { IsBoolean } from 'class-validator';

export class CambiarEstadoUsuarioRolDto {
  @IsBoolean()
  estado: boolean;
}
