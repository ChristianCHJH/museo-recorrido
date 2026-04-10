import { Column, DataType, Model, Table } from 'sequelize-typescript';
import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';

@Table({
  tableName: 'roles',
  timestamps: false,
})
export class Rol extends Model<
  InferAttributes<Rol>,
  InferCreationAttributes<Rol>
> {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: CreationOptional<number>;

  @Column({ type: DataType.STRING(150) })
  declare rol: string;

  @Column({ type: DataType.TEXT })
  declare descripcion: CreationOptional<string | null>;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare estado: CreationOptional<boolean>;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare eliminado: CreationOptional<boolean>;

  @Column({ field: 'fecha_eliminacion', type: DataType.DATE })
  declare fechaEliminacion: CreationOptional<Date | null>;

  @Column({ field: 'usuario_creacion', type: DataType.BIGINT })
  declare usuarioCreacion: CreationOptional<number | null>;

  @Column({ field: 'usuario_actualizacion', type: DataType.BIGINT })
  declare usuarioActualizacion: CreationOptional<number | null>;

  @Column({ field: 'fecha_creacion', type: DataType.DATE })
  declare fechaCreacion: CreationOptional<Date>;

  @Column({ field: 'fecha_actualizacion', type: DataType.DATE })
  declare fechaActualizacion: CreationOptional<Date | null>;
}
