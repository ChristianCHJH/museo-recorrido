import { SetMetadata } from '@nestjs/common';

export const PERMISOS_REQUERIDOS = 'permisosRequeridos';
export const Permisos = (...permisos: string[]) =>
  SetMetadata(PERMISOS_REQUERIDOS, permisos);
