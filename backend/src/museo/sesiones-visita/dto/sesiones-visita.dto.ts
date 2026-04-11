import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class RevocarSesionDto {
  @ApiProperty({ description: 'Confirma la revocación de la sesión' })
  @IsBoolean()
  confirmar: boolean;
}
