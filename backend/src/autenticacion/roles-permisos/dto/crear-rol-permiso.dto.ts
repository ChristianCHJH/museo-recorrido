import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class CrearRolPermisoDto {
  @IsNumber()
  rolId: number;

  @IsNumber()
  permisoId: number;

  @IsOptional()
  @IsBoolean()
  estado?: boolean;

  @IsOptional()
  @IsNumber()
  usuarioCreacion?: number;
}
