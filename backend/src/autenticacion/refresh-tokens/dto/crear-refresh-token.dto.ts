import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CrearRefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  jti: string;

  @IsNumber()
  usuarioId: number;

  @IsDateString()
  expira: string;

  @IsOptional()
  @IsBoolean()
  revocado?: boolean;

  @IsOptional()
  @IsString()
  reemplazadoPorJti?: string;

  @IsOptional()
  @IsString()
  hash?: string;

  @IsOptional()
  @IsString()
  ip?: string;

  @IsOptional()
  @IsString()
  agenteUsuario?: string;
}
