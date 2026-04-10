import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SeccionPermiso } from './entidades/seccion-permiso.entidad';
import { CrearSeccionPermisoDto } from './dto/crear-seccion-permiso.dto';
import { ActualizarSeccionPermisoDto } from './dto/actualizar-seccion-permiso.dto';
import { CambiarEstadoSeccionPermisoDto } from './dto/cambiar-estado-seccion-permiso.dto';
import { Permiso } from '../permisos/entidades/permiso.entidad';
import { UsuarioPermiso } from '../usuarios-permisos/entidades/usuario-permiso.entidad';
import { RolPermiso } from '../roles-permisos/entidades/rol-permiso.entidad';

@Injectable()
export class SeccionesPermisoServicio {
  constructor(
    @InjectModel(SeccionPermiso)
    private readonly seccionesModelo: typeof SeccionPermiso,
    @InjectModel(UsuarioPermiso)
    private readonly usuarioPermisoModelo: typeof UsuarioPermiso,
    @InjectModel(RolPermiso)
    private readonly rolPermisoModelo: typeof RolPermiso,
  ) {}

  crear(dto: CrearSeccionPermisoDto) {
    return this.seccionesModelo.create({
      ...dto,
      estado: dto.estado ?? true,
    });
  }

  listar() {
    return this.seccionesModelo.findAll({
      where: { eliminado: false },
      include: [
        {
          model: Permiso,
          where: { eliminado: false },
          required: false,
          attributes: [
            'id',
            'permiso',
            'descripcion',
            'estado',
            'seccionId',
            'fechaCreacion',
            'fechaActualizacion',
          ],
        },
      ],
      order: [['fechaCreacion', 'DESC']],
    });
  }

  async listarConPermisosPorUsuario(usuarioId: number) {
    const [secciones, permisosAsignados] = await Promise.all([
      this.seccionesModelo.findAll({
        include: [
          {
            model: Permiso,
            attributes: [
              'id',
              'permiso',
              'descripcion',
              'estado',
              'seccionId',
              'fechaCreacion',
              'fechaActualizacion',
            ],
          },
        ],
        order: [['fechaCreacion', 'DESC']],
      }),
      this.usuarioPermisoModelo.findAll({
        where: { usuarioId, estado: true },
        attributes: ['permisoId'],
      }),
    ]);

    const permisosAsignadosSet = new Set(
      permisosAsignados.map((registro) => registro.permisoId),
    );

    return secciones.map((seccion) => ({
      id: seccion.id,
      nombre: seccion.nombre,
      descripcion: seccion.descripcion,
      estado: seccion.estado,
      fechaCreacion: seccion.fechaCreacion,
      fechaActualizacion: seccion.fechaActualizacion,
      usuarioCreacion: seccion.usuarioCreacion,
      usuarioActualizacion: seccion.usuarioActualizacion,
      permisos: (seccion.permisos ?? []).map((permiso) => ({
        id: permiso.id,
        permiso: permiso.permiso,
        descripcion: permiso.descripcion,
        estado: permiso.estado,
        seccionId: permiso.seccionId,
        fechaCreacion: permiso.fechaCreacion,
        fechaActualizacion: permiso.fechaActualizacion,
        asignado: permisosAsignadosSet.has(permiso.id),
      })),
    }));
  }

  async listarConPermisosPorRol(rolId: number) {
    const [secciones, permisosAsignados] = await Promise.all([
      this.seccionesModelo.findAll({
        include: [
          {
            model: Permiso,
            attributes: [
              'id',
              'permiso',
              'descripcion',
              'estado',
              'seccionId',
              'fechaCreacion',
              'fechaActualizacion',
            ],
          },
        ],
        order: [['fechaCreacion', 'DESC']],
      }),
      this.rolPermisoModelo.findAll({
        where: { rolId, estado: true },
        attributes: ['permisoId'],
      }),
    ]);

    const permisosAsignadosSet = new Set(
      permisosAsignados.map((registro) => registro.permisoId),
    );

    return secciones.map((seccion) => ({
      id: seccion.id,
      nombre: seccion.nombre,
      descripcion: seccion.descripcion,
      estado: seccion.estado,
      fechaCreacion: seccion.fechaCreacion,
      fechaActualizacion: seccion.fechaActualizacion,
      usuarioCreacion: seccion.usuarioCreacion,
      usuarioActualizacion: seccion.usuarioActualizacion,
      permisos: (seccion.permisos ?? []).map((permiso) => ({
        id: permiso.id,
        permiso: permiso.permiso,
        descripcion: permiso.descripcion,
        estado: permiso.estado,
        seccionId: permiso.seccionId,
        fechaCreacion: permiso.fechaCreacion,
        fechaActualizacion: permiso.fechaActualizacion,
        asignado: permisosAsignadosSet.has(permiso.id),
      })),
    }));
  }

  async buscarPorId(id: number) {
    const seccion = await this.seccionesModelo.findByPk(id, {
      include: [
        {
          model: Permiso,
          attributes: [
            'id',
            'permiso',
            'descripcion',
            'estado',
            'seccionId',
            'fechaCreacion',
            'fechaActualizacion',
          ],
        },
      ],
    });
    if (!seccion) {
      throw new NotFoundException(`Sección de permiso ${id} no encontrada`);
    }
    return seccion;
  }

  async actualizar(id: number, dto: ActualizarSeccionPermisoDto) {
    const seccion = await this.buscarPorId(id);
    return seccion.update(dto);
  }

  async cambiarEstado(id: number, dto: CambiarEstadoSeccionPermisoDto) {
    const seccion = await this.buscarPorId(id);
    seccion.estado = dto.estado;
    return seccion.save();
  }

  async eliminar(id: number) {
    const seccion = await this.buscarPorId(id);
    seccion.eliminado = true;
    seccion.fechaEliminacion = new Date();
    return seccion.save();
  }
}
