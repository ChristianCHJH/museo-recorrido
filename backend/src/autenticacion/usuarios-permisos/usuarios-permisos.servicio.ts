import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UsuarioPermiso } from './entidades/usuario-permiso.entidad';
import { VincularPermisosUsuarioDto } from './dto/vincular-permisos-usuario.dto';
import { Usuario } from '../usuarios/entidades/usuario.entidad';
import { Permiso } from '../permisos/entidades/permiso.entidad';
import { SeccionPermiso } from '../secciones-permiso/entidades/seccion-permiso.entidad';

@Injectable()
export class UsuariosPermisosServicio {
  constructor(
    @InjectModel(UsuarioPermiso)
    private readonly usuarioPermisoModelo: typeof UsuarioPermiso,
  ) {}

  private async buscarPorId(id: number) {
    const registro = await this.usuarioPermisoModelo.findByPk(id);
    if (!registro) {
      throw new NotFoundException(`Usuario-permiso ${id} no encontrado`);
    }
    return registro;
  }

  async listarPermisosPorUsuario(usuarioId: number) {
    return this.usuarioPermisoModelo.findAll({
      attributes: ['id', 'estado', 'usuarioCreacion', 'usuarioActualizacion', 'fechaCreacion', 'fechaActualizacion'],
      where: {
        usuarioId: usuarioId,
        estado: true,
      },
      include: [
        { model: Permiso, attributes: ['id', 'permiso'], include: [{ model: SeccionPermiso, attributes: ['id', 'nombre'] }] },
        { model: Usuario, as: 'usuarioCreador', attributes: ['nombreUsuario'] },
        { model: Usuario, as: 'usuarioActualizador', attributes: ['nombreUsuario'] },
      ],
      order: [['fechaCreacion', 'DESC']],
    });
  }

  async vincularPermisos(dto: VincularPermisosUsuarioDto) {
    const resultados: { permisoId: number; accion: 'insertado' | 'activado' }[] = [];

    for (const permisoId of dto.permisosIds) {
      const registroExistente = await this.usuarioPermisoModelo.findOne({
        where: {
          usuarioId: dto.usuarioId,
          permisoId: permisoId,
        },
      });

      if (registroExistente) {
        await registroExistente.update({ estado: true, fechaActualizacion: new Date() });
        resultados.push({ permisoId, accion: 'activado' });
      } else {
        await this.usuarioPermisoModelo.create({
          usuarioId: dto.usuarioId,
          permisoId: permisoId,
          estado: true,
          usuarioCreacion: dto.usuarioCreacion ?? null,
        });
        resultados.push({ permisoId, accion: 'insertado' });
      }
    }

    return {
      usuarioId: dto.usuarioId,
      permisosVinculados: resultados,
    };
  }

  async eliminar(id: number) {
    const registro = await this.buscarPorId(id);
    registro.eliminado = true;
    registro.fechaEliminacion = new Date();
    return registro.save();
  }
}
