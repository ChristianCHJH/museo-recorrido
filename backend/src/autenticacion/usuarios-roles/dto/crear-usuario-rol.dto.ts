import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class CrearUsuarioRolDto {
  @IsNumber()
  usuarioId: number;

  @IsNumber()
  rolId: number;

  @IsOptional()
  @IsBoolean()
  estado?: boolean;

  @IsOptional()
  @IsNumber()
  usuarioCreacion?: number;
}
