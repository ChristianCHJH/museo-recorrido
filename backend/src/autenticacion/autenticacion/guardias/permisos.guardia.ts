import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISOS_REQUERIDOS } from '../decoradores/permisos.decorador';

@Injectable()
export class PermisosGuardia implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permisosRequeridos = this.reflector.getAllAndOverride<string[]>(
      PERMISOS_REQUERIDOS,
      [context.getHandler(), context.getClass()],
    );

    if (!permisosRequeridos || permisosRequeridos.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.permisos) {
      return false;
    }

    return permisosRequeridos.some((permiso) =>
      user.permisos.includes(permiso),
    );
  }
}
