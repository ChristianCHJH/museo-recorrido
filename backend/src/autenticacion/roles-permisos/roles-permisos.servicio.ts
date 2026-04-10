import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { RolPermiso } from './entidades/rol-permiso.entidad';
import { AsignarPermisosRolDto } from './dto/asignar-permisos-rol.dto';
import { Permiso } from '../permisos/entidades/permiso.entidad';
import { Usuario } from '../usuarios/entidades/usuario.entidad';

@Injectable()
export class RolesPermisosServicio {
  constructor(
    @InjectModel(RolPermiso) private readonly rolPermisoModelo: typeof RolPermiso,
  ) {}

  private async buscarPorId(id: number) {
    const registro = await this.rolPermisoModelo.findByPk(id);
    if (!registro) {
      throw new NotFoundException(`Relación rol-permiso ${id} no encontrada`);
    }
    return registro;
  }

  async eliminar(id: number) {
    const registro = await this.buscarPorId(id);
    registro.eliminado = true;
    registro.fechaEliminacion = new Date();
    return registro.save();
  }

  listarPermisosPorRol(rolId: number) {
    return this.rolPermisoModelo.findAll({
      where: { rolId, estado: true },
      include: [
        { model: Permiso, attributes: ['id', 'permiso'] },
        { model: Usuario, as: 'usuarioCreador', attributes: ['nombreUsuario'] },
        { model: Usuario, as: 'usuarioActualizador', attributes: ['nombreUsuario'] },
      ],
      order: [['fechaCreacion', 'DESC']],
    });
  }

  async asignarPermisosARol(dto: AsignarPermisosRolDto) {
    const resultados: RolPermiso[] = [];

    for (const permisoId of dto.permisoIds) {
      const existente = await this.rolPermisoModelo.findOne({
        where: { rolId: dto.rolId, permisoId },
      });

      if (existente) {
        if (!existente.estado) {
          existente.estado = true;
          await existente.save();
        }
        resultados.push(existente);
      } else {
        const nuevo = await this.rolPermisoModelo.create({
          rolId: dto.rolId,
          permisoId,
          estado: true,
          usuarioCreacion: dto.usuarioCreacion ?? null,
        });
        resultados.push(nuevo);
      }
    }

    return resultados;
  }
}
