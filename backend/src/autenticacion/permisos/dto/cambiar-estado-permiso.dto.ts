import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class CambiarEstadoPermisoDto {
  @ApiProperty({
    description: 'Nuevo estado lógico para el permiso',
    example: false,
  })
  @IsBoolean()
  estado: boolean;
}
