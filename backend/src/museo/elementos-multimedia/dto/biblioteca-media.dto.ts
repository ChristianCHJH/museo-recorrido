import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class SubirArchivoLibreriaDto {
  @ApiPropertyOptional({ description: 'Nombre amigable para identificar el medio en la biblioteca' })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({ description: 'Descripción corta del medio' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({ description: 'Indica si el medio es público', default: true })
  @IsOptional()
  @IsBoolean()
  esPublico?: boolean;
}

export class FiltrarMediaDto {
  @ApiPropertyOptional({ description: 'Tipo de medio', enum: ['imagen', 'audio', 'video_local', 'video_youtube', 'video_vimeo'] })
  @IsOptional()
  @IsString()
  tipo?: string;

  @ApiPropertyOptional({ description: 'Texto a buscar en título, descripción o nombre del medio' })
  @IsOptional()
  @IsString()
  busqueda?: string;

  @ApiPropertyOptional({ description: 'Número de página (inicia en 1)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pagina?: number;

  @ApiPropertyOptional({ description: 'Cantidad de resultados por página (máximo 100)', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limite?: number;
}

export class ActualizarMediaDto {
  @ApiPropertyOptional({ description: 'Nombre amigable para identificar el medio en la biblioteca' })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({ description: 'Título descriptivo del medio' })
  @IsOptional()
  @IsString()
  titulo?: string;

  @ApiPropertyOptional({ description: 'Descripción corta del medio' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({ description: 'Indica si el medio es público' })
  @IsOptional()
  @IsBoolean()
  esPublico?: boolean;
}

export interface ResultadoBibliotecaMedia {
  items: import('../entidades/elemento-multimedia.entidad').ElementoMultimediaEntidad[];
  total: number;
  pagina: number;
  limite: number;
}
