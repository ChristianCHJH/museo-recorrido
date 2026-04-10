import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class CambiarEstadoSeccionPermisoDto {
  @ApiProperty({
    description: 'Nuevo estado lógico de la sección-permiso',
    example: false,
  })
  @IsBoolean()
  estado: boolean;
}
