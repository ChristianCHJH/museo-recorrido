import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UsuarioRol } from './entidades/usuario-rol.entidad';
import { CambiarEstadoUsuarioRolDto } from './dto/cambiar-estado-usuario-rol.dto';
import { VincularRolesUsuarioDto } from './dto/vincular-roles-usuario.dto';
import { Rol } from '../roles/entidades/rol.entidad';

@Injectable()
export class UsuariosRolesServicio {
  constructor(
    @InjectModel(UsuarioRol)
    private readonly usuarioRolModelo: typeof UsuarioRol,
  ) {}

  private async buscarPorId(id: number) {
    const registro = await this.usuarioRolModelo.findByPk(id);
    if (!registro) {
      throw new NotFoundException(`Usuario-rol ${id} no encontrado`);
    }
    return registro;
  }

  async cambiarEstado(id: number, dto: CambiarEstadoUsuarioRolDto) {
    const registro = await this.buscarPorId(id);
    registro.estado = dto.estado;
    return registro.save();
  }

  async eliminar(id: number) {
    const registro = await this.buscarPorId(id);
    registro.eliminado = true;
    registro.fechaEliminacion = new Date();
    return registro.save();
  }

  listarRolesPorUsuario(usuarioId: number) {
    return this.usuarioRolModelo.findAll({
      where: { usuarioId, estado: true },
      include: [{ model: Rol, attributes: ['id', 'rol'] }],
      order: [['fechaCreacion', 'DESC']],
    });
  }

  async vincularRol(dto: VincularRolesUsuarioDto) {
    const existente = await this.usuarioRolModelo.findOne({
      where: { usuarioId: dto.usuarioId, rolId: dto.rolId },
    });

    if (existente) {
      if (!existente.estado) {
        existente.estado = true;
        existente.usuarioCreacion = dto.usuarioCreacion ?? null;
        existente.fechaActualizacion = new Date();
        await existente.save();
      }
    } else {
      await this.usuarioRolModelo.create({
        usuarioId: dto.usuarioId,
        rolId: dto.rolId,
        estado: true,
        usuarioCreacion: dto.usuarioCreacion ?? null,
      });
    }

    return { success: true };
  }
}
