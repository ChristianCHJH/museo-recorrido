import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
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

export class CrearElementoMultimediaDto {
  @ApiProperty({ description: 'Tipo de elemento', enum: ['imagen', 'video_local', 'video_youtube', 'video_vimeo'] })
  @IsString()
  @IsNotEmpty()
  tipo: string;

  @ApiProperty({ description: 'URL del archivo o enlace externo' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({ description: 'URL de miniatura (para videos)' })
  @IsOptional()
  @IsString()
  urlMiniatura?: string;

  @ApiPropertyOptional({ description: 'Título descriptivo del elemento' })
  @IsOptional()
  @IsString()
  titulo?: string;

  @ApiPropertyOptional({ description: 'Texto de apoyo al pie del elemento' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({ description: 'Orden dentro de la galería' })
  @IsOptional()
  @IsInt()
  orden?: number;

  @ApiPropertyOptional({ description: 'Tamaño del archivo en bytes' })
  @IsOptional()
  @IsInt()
  pesoBytes?: number;
}

export class AgregarVideoExternoDto {
  @ApiProperty({ description: 'URL del video de YouTube o Vimeo', example: 'https://www.youtube.com/watch?v=...' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({ description: 'Título del video' })
  @IsOptional()
  @IsString()
  titulo?: string;

  @ApiPropertyOptional({ description: 'Descripción del video' })
  @IsOptional()
  @IsString()
  descripcion?: string;
}

export class ActualizarElementoMultimediaDto extends PartialType(CrearElementoMultimediaDto) {}

export class CambiarEstadoElementoDto {
  @ApiProperty({ description: 'Estado activo/inactivo del elemento' })
  @IsBoolean()
  estado: boolean;
}

export class ItemOrdenMultimediaDto {
  @ApiProperty({ description: 'UUID del elemento multimedia' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Nuevo orden dentro de la galería' })
  @IsInt()
  orden: number;
}

export class ReordenarMultimediaDto {
  @ApiProperty({ type: [ItemOrdenMultimediaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemOrdenMultimediaDto)
  items: ItemOrdenMultimediaDto[];
}
