import { PartialType } from '@nestjs/mapped-types';
import { CrearUsuarioPermisoDto } from './crear-usuario-permiso.dto';

export class ActualizarUsuarioPermisoDto extends PartialType(
  CrearUsuarioPermisoDto,
) {}
