import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefrescarTokenDto {
  @ApiProperty({
    description: 'Identificador (jti) del refresh token vigente',
    example: 'd2fa6491-2b2c-4c0a-b1bd-84da3c0d8f4b',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
