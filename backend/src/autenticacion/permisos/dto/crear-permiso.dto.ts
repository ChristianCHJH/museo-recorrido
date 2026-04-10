import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CrearPermisoDto {
  @ApiProperty({
    description: 'Nombre del permiso o acción permitida',
    example: 'usuarios.crear',
  })
  @IsString()
  @IsNotEmpty()
  permiso: string;

  @ApiPropertyOptional({
    description: 'Descripción breve del permiso',
    example: 'Permite crear usuarios en el panel',
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({
    description: 'Identificador de la sección a la que pertenece el permiso',
    example: 3,
  })
  @IsNumber()
  seccionId: number;

  @ApiPropertyOptional({
    description: 'Estado lógico del permiso',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  estado?: boolean;

  @ApiPropertyOptional({
    description: 'Usuario que crea el permiso',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  usuarioCreacion?: number;

  @ApiPropertyOptional({
    description: 'Usuario que actualiza el permiso',
    example: 2,
  })
  @IsOptional()
  @IsNumber()
  usuarioActualizacion?: number;
}
