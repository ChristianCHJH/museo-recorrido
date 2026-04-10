import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { Rol } from '../../roles/entidades/rol.entidad';
import { Permiso } from '../../permisos/entidades/permiso.entidad';
import { Usuario } from '../../usuarios/entidades/usuario.entidad';

@Table({
  tableName: 'roles_permisos',
  timestamps: false,
})
export class RolPermiso extends Model<
  InferAttributes<RolPermiso>,
  InferCreationAttributes<RolPermiso>
> {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: CreationOptional<number>;

  @ForeignKey(() => Rol)
  @Column({ field: 'rol_id', type: DataType.BIGINT })
  declare rolId: number;

  @ForeignKey(() => Permiso)
  @Column({ field: 'permiso_id', type: DataType.BIGINT })
  declare permisoId: number;

  @BelongsTo(() => Rol)
  declare rol?: Rol;

  @BelongsTo(() => Permiso)
  declare permiso?: Permiso;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare estado: CreationOptional<boolean>;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare eliminado: CreationOptional<boolean>;

  @Column({ field: 'fecha_eliminacion', type: DataType.DATE })
  declare fechaEliminacion: CreationOptional<Date | null>;

  @ForeignKey(() => Usuario)
  @Column({ field: 'usuario_creacion', type: DataType.BIGINT })
  declare usuarioCreacion: CreationOptional<number | null>;

  @ForeignKey(() => Usuario)
  @Column({ field: 'usuario_actualizacion', type: DataType.BIGINT })
  declare usuarioActualizacion: CreationOptional<number | null>;

  @BelongsTo(() => Usuario, { foreignKey: 'usuarioCreacion', as: 'usuarioCreador' })
  declare usuarioCreador?: Usuario;

  @BelongsTo(() => Usuario, { foreignKey: 'usuarioActualizacion', as: 'usuarioActualizador' })
  declare usuarioActualizador?: Usuario;

  @Column({ field: 'fecha_creacion', type: DataType.DATE })
  declare fechaCreacion: CreationOptional<Date>;

  @Column({ field: 'fecha_actualizacion', type: DataType.DATE })
  declare fechaActualizacion: CreationOptional<Date | null>;
}
