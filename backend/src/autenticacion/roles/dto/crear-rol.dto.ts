import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CrearRolDto {
  @IsString()
  @IsNotEmpty()
  rol: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsBoolean()
  estado?: boolean;

  @IsOptional()
  @IsNumber()
  usuarioCreacion?: number;

  @IsOptional()
  @IsNumber()
  usuarioActualizacion?: number;
}
