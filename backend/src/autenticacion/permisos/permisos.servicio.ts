import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Permiso } from './entidades/permiso.entidad';
import { CrearPermisoDto } from './dto/crear-permiso.dto';
import { ActualizarPermisoDto } from './dto/actualizar-permiso.dto';
import { CambiarEstadoPermisoDto } from './dto/cambiar-estado-permiso.dto';
import { SeccionPermiso } from '../secciones-permiso/entidades/seccion-permiso.entidad';

@Injectable()
export class PermisosServicio {
  constructor(
    @InjectModel(Permiso)
    private readonly permisoModelo: typeof Permiso,
  ) {}

  crear(dto: CrearPermisoDto) {
    return this.permisoModelo.create({
      permiso: dto.permiso,
      descripcion: dto.descripcion ?? null,
      seccionId: dto.seccionId,
      estado: dto.estado ?? true,
      usuarioCreacion: dto.usuarioCreacion ?? null,
      usuarioActualizacion: dto.usuarioActualizacion ?? null,
    });
  }

  listar() {
    return this.permisoModelo.findAll({
      where: { eliminado: false },
      include: [{ model: SeccionPermiso }],
      order: [['fechaCreacion', 'DESC']],
    });
  }

  async buscarPorId(id: number) {
    const permiso = await this.permisoModelo.findByPk(id, {
      include: [{ model: SeccionPermiso }],
    });
    if (!permiso) {
      throw new NotFoundException(`Permiso ${id} no encontrado`);
    }
    return permiso;
  }

  async actualizar(id: number, dto: ActualizarPermisoDto) {
    const permiso = await this.buscarPorId(id);
    return permiso.update(dto);
  }

  async cambiarEstado(id: number, dto: CambiarEstadoPermisoDto) {
    const permiso = await this.buscarPorId(id);
    permiso.estado = dto.estado;
    return permiso.save();
  }

  async eliminar(id: number) {
    const permiso = await this.buscarPorId(id);
    permiso.eliminado = true;
    permiso.fechaEliminacion = new Date();
    return permiso.save();
  }
}
