import { IsNumber, IsOptional } from 'class-validator';

export class VincularRolesUsuarioDto {
  @IsNumber()
  usuarioId: number;

  @IsNumber()
  rolId: number;

  @IsOptional()
  @IsNumber()
  usuarioCreacion?: number;
}
