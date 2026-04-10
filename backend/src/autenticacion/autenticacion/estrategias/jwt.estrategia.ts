import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectModel } from '@nestjs/sequelize';
import { PayloadJwt } from '../interfaces/payload-jwt.interface';
import { UsuarioRol } from '../../usuarios-roles/entidades/usuario-rol.entidad';
import { RolPermiso } from '../../roles-permisos/entidades/rol-permiso.entidad';
import { UsuarioPermiso } from '../../usuarios-permisos/entidades/usuario-permiso.entidad';
import { Permiso } from '../../permisos/entidades/permiso.entidad';

@Injectable()
export class JwtEstrategia extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(UsuarioRol) private readonly usuarioRolModelo: typeof UsuarioRol,
    @InjectModel(RolPermiso) private readonly rolPermisoModelo: typeof RolPermiso,
    @InjectModel(UsuarioPermiso) private readonly usuarioPermisoModelo: typeof UsuarioPermiso,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRETO || 'cambia_estoseguro',
    });
  }

  async validate(payload: PayloadJwt) {
    const [rolesUsuario, permisosDirectos] = await Promise.all([
      this.usuarioRolModelo.findAll({
        where: { usuarioId: payload.sub, estado: true },
        attributes: ['rolId'],
      }),
      this.usuarioPermisoModelo.findAll({
        where: { usuarioId: payload.sub, estado: true },
        include: [{ model: Permiso, attributes: ['permiso'] }],
      }),
    ]);

    const permisosSet = new Set<string>();

    permisosDirectos.forEach((up) => {
      if (up.permiso) {
        permisosSet.add(up.permiso.permiso);
      }
    });

    const rolIds = rolesUsuario.map((ur) => ur.rolId);
    if (rolIds.length > 0) {
      const permisosRoles = await this.rolPermisoModelo.findAll({
        where: { rolId: rolIds, estado: true },
        include: [{ model: Permiso, attributes: ['permiso'] }],
      });
      permisosRoles.forEach((rp) => {
        if (rp.permiso) {
          permisosSet.add(rp.permiso.permiso);
        }
      });
    }

    return {
      sub: payload.sub,
      nombreUsuario: payload.nombreUsuario,
      permisos: Array.from(permisosSet),
    };
  }
}
