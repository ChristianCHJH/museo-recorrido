import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class CambiarEstadoUsuarioDto {
  @ApiProperty({
    description: 'Nuevo estado lógico del usuario',
    example: true,
  })
  @IsBoolean()
  estado: boolean;
}
