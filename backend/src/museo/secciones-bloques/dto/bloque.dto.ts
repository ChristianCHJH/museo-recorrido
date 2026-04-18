import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { TipoBloque } from './tipos-bloque';

export class BloqueDto {
  @ApiPropertyOptional({ description: 'UUID del bloque (presente = actualizar, ausente = crear)' })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ description: 'Tipo de bloque de contenido', enum: TipoBloque })
  @IsEnum(TipoBloque)
  tipo: TipoBloque;

  @ApiProperty({ description: 'Posición del bloque dentro de la sección', example: 0 })
  @IsInt()
  orden: number;

  @ApiProperty({ description: 'Configuración específica del tipo de bloque (objeto JSON con multi-idioma)' })
  @IsObject()
  config: Record<string, any>;

  @ApiPropertyOptional({ description: 'Estado activo/inactivo del bloque', default: true })
  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}

export class GuardarBloquesDto {
  @ApiProperty({ description: 'Array completo de bloques de la sección', type: [BloqueDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BloqueDto)
  bloques: BloqueDto[];
}

export class ActualizarBloqueDto {
  @ApiPropertyOptional({ description: 'Configuración actualizada del bloque' })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Nuevo orden del bloque' })
  @IsOptional()
  @IsInt()
  orden?: number;

  @ApiPropertyOptional({ description: 'Estado activo/inactivo del bloque' })
  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}

export class ItemOrdenBloqueDto {
  @ApiProperty({ description: 'UUID del bloque' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Nuevo orden del bloque', example: 1 })
  @IsInt()
  orden: number;
}

export class ReordenarBloquesDto {
  @ApiProperty({ description: 'Lista de bloques con su nuevo orden', type: [ItemOrdenBloqueDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemOrdenBloqueDto)
  items: ItemOrdenBloqueDto[];
}
