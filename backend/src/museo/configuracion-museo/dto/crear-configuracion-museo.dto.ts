import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CrearConfiguracionMuseoDto {
  @ApiProperty({ description: 'Nombre del museo', example: 'Museo Regional de Historia' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiPropertyOptional({ description: 'Subtítulo descriptivo del museo' })
  @IsOptional()
  @IsString()
  subtitulo?: string;

  @ApiPropertyOptional({ description: 'Descripción general del museo' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({ description: 'URL del logo del museo' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Color primario en formato hex', example: '#5D4037' })
  @IsOptional()
  @IsString()
  colorPrimario?: string;

  @ApiPropertyOptional({ description: 'Color secundario en formato hex', example: '#C5B358' })
  @IsOptional()
  @IsString()
  colorSecundario?: string;

  @ApiPropertyOptional({ description: 'Color terciario en formato hex', example: '#827717' })
  @IsOptional()
  @IsString()
  colorTerciario?: string;

  @ApiPropertyOptional({ description: 'Fuente tipográfica principal', example: 'Noto Serif' })
  @IsOptional()
  @IsString()
  fuentePrincipal?: string;

  @ApiPropertyOptional({ description: 'URL del sitio web del museo' })
  @IsOptional()
  @IsString()
  sitioWeb?: string;

  @ApiPropertyOptional({ description: 'Correo electrónico de contacto' })
  @IsOptional()
  @IsEmail()
  correoContacto?: string;

  @ApiPropertyOptional({ description: 'Teléfono de contacto' })
  @IsOptional()
  @IsString()
  telefonoContacto?: string;

  @ApiPropertyOptional({ description: 'Dirección física del museo' })
  @IsOptional()
  @IsString()
  direccion?: string;

  @ApiPropertyOptional({ description: 'Redes sociales en formato JSON' })
  @IsOptional()
  @IsObject()
  redesSociales?: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Duración de la sesión de visita en minutos',
    example: 120,
  })
  @IsOptional()
  @IsInt()
  duracionSesionVisitaMinutos?: number;

  @ApiPropertyOptional({ description: 'Estado activo/inactivo de la configuración' })
  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}

export class ActualizarConfiguracionMuseoDto extends PartialType(CrearConfiguracionMuseoDto) {}

export class CambiarEstadoConfiguracionMuseoDto {
  @ApiProperty({ description: 'Estado activo o inactivo de la configuración' })
  @IsBoolean()
  estado: boolean;
}
