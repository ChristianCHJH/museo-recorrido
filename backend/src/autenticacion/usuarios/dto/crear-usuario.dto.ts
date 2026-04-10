import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsEmail,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CrearUsuarioDto {
  @ApiProperty({
    description: 'Nombre completo o alias del usuario',
    example: 'Christian Jara',
  })
  @IsString()
  @IsNotEmpty()
  nombreUsuario: string;

  @ApiProperty({
    description: 'Contraseña en texto plano (será hasheada con bcrypt)',
    example: 'MiContrasenaSegura123',
  })
  @IsString()
  @IsNotEmpty()
  contrasena: string;

  @ApiProperty({
    description: 'Correo electrónico de contacto',
    example: 'admin@gmail.com',
  })
  @IsEmail()
  correo: string;

  @ApiPropertyOptional({
    description: 'Identificador del usuario que creó el registro',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  usuarioCreacion?: number;
}
