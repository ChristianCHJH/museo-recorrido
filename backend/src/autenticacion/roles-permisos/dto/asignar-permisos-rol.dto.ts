import { IsArray, IsNumber, IsOptional } from 'class-validator';

export class AsignarPermisosRolDto {
  @IsNumber()
  rolId: number;

  @IsArray()
  @IsNumber({}, { each: true })
  permisoIds: number[];

  @IsOptional()
  @IsNumber()
  usuarioCreacion?: number;
}
