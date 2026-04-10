import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Rol } from './entidades/rol.entidad';
import { CrearRolDto } from './dto/crear-rol.dto';
import { ActualizarRolDto } from './dto/actualizar-rol.dto';
import { CambiarEstadoRolDto } from './dto/cambiar-estado-rol.dto';
import { UsuarioRol } from '../usuarios-roles/entidades/usuario-rol.entidad';

@Injectable()
export class RolesServicio {
  constructor(
    @InjectModel(Rol) private readonly rolModelo: typeof Rol,
    @InjectModel(UsuarioRol) private readonly usuarioRolModelo: typeof UsuarioRol,
  ) {}

  crear(dto: CrearRolDto) {
    return this.rolModelo.create({
      rol: dto.rol,
      descripcion: dto.descripcion ?? null,
      estado: dto.estado ?? true,
      usuarioCreacion: dto.usuarioCreacion ?? null,
      usuarioActualizacion: dto.usuarioActualizacion ?? null,
    });
  }

  listar() {
    return this.rolModelo.findAll({
      where: { eliminado: false },
      order: [['fechaCreacion', 'DESC']],
    });
  }

  async buscarPorId(id: number) {
    const rol = await this.rolModelo.findByPk(id);
    if (!rol) {
      throw new NotFoundException(`Rol ${id} no encontrado`);
    }
    return rol;
  }

  async actualizar(id: number, dto: ActualizarRolDto) {
    const rol = await this.buscarPorId(id);
    return rol.update(dto);
  }

  async cambiarEstado(id: number, dto: CambiarEstadoRolDto) {
    const rol = await this.buscarPorId(id);
    rol.estado = dto.estado;
    return rol.save();
  }

  async listarNoAsignadosPorUsuario(usuarioId: number) {
    const rolesAsignados = await this.usuarioRolModelo.findAll({
      where: { usuarioId, estado: true },
      attributes: ['rolId'],
    });

    const idsAsignados = rolesAsignados.map((ur) => ur.rolId);

    return this.rolModelo.findAll({
      where: {
        estado: true,
        eliminado: false,
        ...(idsAsignados.length > 0 && { id: { [Op.notIn]: idsAsignados } }),
      },
      order: [['fechaCreacion', 'DESC']],
    });
  }
}
