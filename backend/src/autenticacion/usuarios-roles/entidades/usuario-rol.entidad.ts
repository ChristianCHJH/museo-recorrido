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
import { Usuario } from '../../usuarios/entidades/usuario.entidad';
import { Rol } from '../../roles/entidades/rol.entidad';

@Table({
  tableName: 'usuarios_roles',
  timestamps: false,
})
export class UsuarioRol extends Model<
  InferAttributes<UsuarioRol>,
  InferCreationAttributes<UsuarioRol>
> {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: CreationOptional<number>;

  @ForeignKey(() => Usuario)
  @Column({ field: 'usuario_id', type: DataType.BIGINT })
  declare usuarioId: number;

  @ForeignKey(() => Rol)
  @Column({ field: 'rol_id', type: DataType.BIGINT })
  declare rolId: number;

  @BelongsTo(() => Usuario)
  declare usuario?: Usuario;

  @BelongsTo(() => Rol)
  declare rol?: Rol;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare estado: CreationOptional<boolean>;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare eliminado: CreationOptional<boolean>;

  @Column({ field: 'fecha_eliminacion', type: DataType.DATE })
  declare fechaEliminacion: CreationOptional<Date | null>;

  @Column({ field: 'usuario_creacion', type: DataType.BIGINT })
  declare usuarioCreacion: CreationOptional<number | null>;

  @Column({ field: 'fecha_creacion', type: DataType.DATE })
  declare fechaCreacion: CreationOptional<Date>;

  @Column({ field: 'fecha_actualizacion', type: DataType.DATE })
  declare fechaActualizacion: CreationOptional<Date | null>;
}
