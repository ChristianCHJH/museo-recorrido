import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class CrearSeccionRecorridoDto {
  @ApiProperty({ description: 'Identificador UUID de la exposición a la que pertenece la sección' })
  @IsUUID()
  @IsNotEmpty()
  exposicionId: string;

  @ApiProperty({ description: 'Nombre de la sección del recorrido', example: 'La fundación de la ciudad' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiPropertyOptional({ description: 'Subtítulo de la sección' })
  @IsOptional()
  @IsString()
  subtitulo?: string;

  @ApiPropertyOptional({ description: 'Descripción breve para vista previa' })
  @IsOptional()
  @IsString()
  descripcionBreve?: string;

  @ApiPropertyOptional({ description: 'Contenido histórico detallado de la sección' })
  @IsOptional()
  @IsString()
  contenidoHistorico?: string;

  @ApiPropertyOptional({ description: 'Datos curiosos relacionados con la sección' })
  @IsOptional()
  @IsString()
  datosCuriosos?: string;

  @ApiPropertyOptional({ description: 'Personajes históricos relacionados con la sección' })
  @IsOptional()
  @IsString()
  personajesRelacionados?: string;

  @ApiPropertyOptional({ description: 'Período histórico al que refiere la sección', example: 'Siglo XVIII' })
  @IsOptional()
  @IsString()
  periodoHistorico?: string;

  @ApiPropertyOptional({ description: 'Frase o cita destacada de la sección' })
  @IsOptional()
  @IsString()
  fraseDestacada?: string;

  @ApiPropertyOptional({ description: 'Orden de visualización dentro de la exposición', example: 1 })
  @IsOptional()
  @IsInt()
  orden?: number;

  @ApiPropertyOptional({ description: 'URL de la imagen principal de la sección' })
  @IsOptional()
  @IsString()
  imagenPrincipalUrl?: string;

  @ApiPropertyOptional({ description: 'URL del audio narrado de la sección' })
  @IsOptional()
  @IsString()
  audioUrl?: string;

  @ApiPropertyOptional({
    description: "Plantilla de visualización de la sección",
    example: 'estandar',
  })
  @IsOptional()
  @IsString()
  plantilla?: string;
}

export class ActualizarSeccionRecorridoDto extends PartialType(CrearSeccionRecorridoDto) {}

export class CambiarEstadoSeccionDto {
  @ApiProperty({ description: 'Estado activo/inactivo de la sección' })
  @IsBoolean()
  estado: boolean;
}

export class ItemOrdenSeccionDto {
  @ApiProperty({ description: 'Identificador UUID de la sección', example: 'uuid-aqui' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Nuevo orden de la sección', example: 1 })
  @IsInt()
  orden: number;
}

export class ReordenarSeccionesDto {
  @ApiProperty({
    description: 'Lista de secciones con su nuevo orden',
    type: [ItemOrdenSeccionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemOrdenSeccionDto)
  items: ItemOrdenSeccionDto[];
}
