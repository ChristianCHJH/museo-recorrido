import { PartialType } from '@nestjs/mapped-types';
import { CrearSeccionPermisoDto } from './crear-seccion-permiso.dto';

export class ActualizarSeccionPermisoDto extends PartialType(
  CrearSeccionPermisoDto,
) {}
