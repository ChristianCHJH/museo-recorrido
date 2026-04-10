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
import { SeccionPermiso } from '../../secciones-permiso/entidades/seccion-permiso.entidad';

@Table({
  tableName: 'permisos',
  timestamps: false,
})
export class Permiso extends Model<
  InferAttributes<Permiso>,
  InferCreationAttributes<Permiso>
> {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: CreationOptional<number>;

  @Column({ type: DataType.STRING(150) })
  declare permiso: string;

  @Column({ type: DataType.TEXT })
  declare descripcion: CreationOptional<string | null>;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare estado: CreationOptional<boolean>;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare eliminado: CreationOptional<boolean>;

  @Column({ field: 'fecha_eliminacion', type: DataType.DATE })
  declare fechaEliminacion: CreationOptional<Date | null>;

  @ForeignKey(() => SeccionPermiso)
  @Column({ field: 'seccion_id', type: DataType.BIGINT })
  declare seccionId: number;

  @BelongsTo(() => SeccionPermiso)
  declare seccion?: SeccionPermiso;

  @Column({ field: 'usuario_creacion', type: DataType.BIGINT })
  declare usuarioCreacion: CreationOptional<number | null>;

  @Column({ field: 'usuario_actualizacion', type: DataType.BIGINT })
  declare usuarioActualizacion: CreationOptional<number | null>;

  @Column({ field: 'fecha_creacion', type: DataType.DATE })
  declare fechaCreacion: CreationOptional<Date>;

  @Column({ field: 'fecha_actualizacion', type: DataType.DATE })
  declare fechaActualizacion: CreationOptional<Date | null>;
}
