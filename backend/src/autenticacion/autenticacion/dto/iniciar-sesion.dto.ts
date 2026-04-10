import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  ValidateIf,
} from 'class-validator';

export class IniciarSesionDto {
  @ApiPropertyOptional({
    description:
      'Nombre de usuario. Obligatorio si no se envía el correo electrónico',
    example: 'admin.spa',
  })
  @ValidateIf((obj: IniciarSesionDto) => !obj.correo)
  @IsString()
  @IsNotEmpty()
  nombreUsuario?: string;

  @ApiPropertyOptional({
    description:
      'Correo electrónico registrado del usuario. Obligatorio si no se envía el nombre de usuario',
    example: 'admin@gmail.com',
  })
  @ValidateIf((obj: IniciarSesionDto) => !obj.nombreUsuario)
  @IsEmail()
  @IsNotEmpty()
  correo?: string;

  @ApiProperty({
    description: 'Contraseña en texto plano (será verificada con bcrypt)',
    example: 'MiPassword123',
  })
  @IsString()
  @IsNotEmpty()
  contrasena: string;
}
