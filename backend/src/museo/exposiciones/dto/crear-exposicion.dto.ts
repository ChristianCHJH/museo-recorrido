import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class CrearExposicionDto {
  @ApiProperty({ description: 'Nombre de la exposición', example: 'Historia Colonial' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiPropertyOptional({ description: 'Descripción detallada de la exposición' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({
    description: "Tipo de exposición: 'permanente' o 'temporal'",
    example: 'permanente',
  })
  @IsOptional()
  @IsString()
  tipo?: string;

  @ApiPropertyOptional({ description: 'URL de la imagen de portada' })
  @IsOptional()
  @IsString()
  imagenPortadaUrl?: string;

  @ApiPropertyOptional({ description: 'Fecha de inicio de la exposición' })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiPropertyOptional({ description: 'Fecha de fin de la exposición' })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiPropertyOptional({ description: 'Orden de visualización', example: 1 })
  @IsOptional()
  @IsInt()
  orden?: number;
}

export class ActualizarExposicionDto extends PartialType(CrearExposicionDto) {}

export class CambiarEstadoExposicionDto {
  @ApiProperty({ description: 'Estado activo/inactivo de la exposición' })
  @IsBoolean()
  estado: boolean;
}

export class ItemOrdenDto {
  @ApiProperty({ description: 'Identificador UUID del registro', example: 'uuid-aqui' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Nuevo orden del registro', example: 1 })
  @IsInt()
  orden: number;
}

export class ReordenarExposicionesDto {
  @ApiProperty({
    description: 'Lista de items con su nuevo orden',
    type: [ItemOrdenDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemOrdenDto)
  items: ItemOrdenDto[];
}
