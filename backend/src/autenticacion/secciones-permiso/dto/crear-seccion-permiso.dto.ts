import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CrearSeccionPermisoDto {
  @ApiProperty({
    description: 'Nombre de la sección o módulo visible en la aplicación',
    example: 'Dashboard',
  })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiPropertyOptional({
    description: 'Descripción breve de la función de la sección',
    example: 'Vista principal con métricas del negocio',
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Estado lógico de la sección',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  estado?: boolean;

  @ApiPropertyOptional({
    description: 'ID del usuario que crea la sección',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  usuarioCreacion?: number;

  @ApiPropertyOptional({
    description: 'ID del usuario que actualiza por última vez la sección',
    example: 2,
  })
  @IsOptional()
  @IsNumber()
  usuarioActualizacion?: number;
}
