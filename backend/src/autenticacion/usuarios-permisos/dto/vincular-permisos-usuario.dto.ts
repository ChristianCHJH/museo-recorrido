import { IsArray, IsInt, IsOptional, ArrayMinSize } from 'class-validator';

export class VincularPermisosUsuarioDto {
  @IsInt()
  usuarioId: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  permisosIds: number[];

  @IsOptional()
  @IsInt()
  usuarioCreacion?: number;
}
