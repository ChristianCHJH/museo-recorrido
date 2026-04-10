import { ApiProperty } from '@nestjs/swagger';

export class PermisoConAsignacionDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  permiso: string;

  @ApiProperty({ nullable: true })
  descripcion: string | null;

  @ApiProperty()
  estado: boolean;

  @ApiProperty()
  seccionId: number;

  @ApiProperty()
  asignado: boolean;
}

export class SeccionPermisoConPermisosDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nombre: string;

  @ApiProperty({ nullable: true })
  descripcion: string | null;

  @ApiProperty()
  estado: boolean;

  @ApiProperty({ type: PermisoConAsignacionDto, isArray: true })
  permisos: PermisoConAsignacionDto[];
}
