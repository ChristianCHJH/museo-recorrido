import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { Usuario } from './entidades/usuario.entidad';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { CambiarEstadoUsuarioDto } from './dto/cambiar-estado-usuario.dto';

@Injectable()
export class UsuariosServicio {
  private readonly atributosPublicos: string[] = [
    'id',
    'nombreUsuario',
    'correo',
    'ultimaSesion',
    'usuarioCreacion',
    'usuarioActualizacion',
    'fechaCreacion',
    'fechaActualizacion',
    'estado',
  ] as const;

  constructor(
    @InjectModel(Usuario) private readonly usuarioModelo: typeof Usuario,
  ) {}

  async crear(dto: CrearUsuarioDto) {
    const contrasenaHash = await bcrypt.hash(dto.contrasena, 12);
    return this.usuarioModelo.create({
      nombreUsuario: dto.nombreUsuario,
      contrasenaHash,
      correo: dto.correo,
      estado: true,
      usuarioCreacion: dto.usuarioCreacion ?? null,
      usuarioActualizacion: null,
    });
  }

  listar() {
    return this.usuarioModelo.findAll({
      attributes: this.atributosPublicos,
      where: { eliminado: false },
      raw: true,
      order: [['fechaCreacion', 'DESC']],
    });
  }

  async buscarPorId(id: number) {
    const usuario = await this.usuarioModelo.findByPk(id);
    if (!usuario) {
      throw new NotFoundException(`Usuario ${id} no encontrado`);
    }
    return usuario;
  }

  async actualizar(id: number, dto: ActualizarUsuarioDto) {
    const usuario = await this.buscarPorId(id);
    const { contrasena, ...resto } = dto;
    const cambios: Partial<Usuario> & { contrasenaHash?: string } = {
      ...resto,
    };
    if (contrasena) {
      cambios.contrasenaHash = await bcrypt.hash(contrasena, 12);
    }
    return usuario.update(cambios);
  }

  async cambiarEstado(id: number, dto: CambiarEstadoUsuarioDto) {
    const usuario = await this.buscarPorId(id);
    usuario.estado = dto.estado;
    return usuario.save();
  }

  async eliminar(id: number) {
    const usuario = await this.buscarPorId(id);
    usuario.eliminado = true;
    usuario.fechaEliminacion = new Date();
    return usuario.save();
  }
}
