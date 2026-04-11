import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class CrearCodigoQrDto {
  @ApiPropertyOptional({ description: 'UUID de la sección a la que se asigna el QR' })
  @IsOptional()
  @IsUUID()
  seccionId?: string;

  @ApiPropertyOptional({ description: 'Nombre descriptivo interno del QR', example: 'QR Sala Fundadores - pared norte' })
  @IsOptional()
  @IsString()
  nombreDescriptivo?: string;
}

export class ActualizarCodigoQrDto extends PartialType(CrearCodigoQrDto) {}

export class CambiarEstadoQrDto {
  @ApiProperty({ description: 'Activa o desactiva el QR para aceptar escaneos' })
  @IsBoolean()
  activo: boolean;
}
