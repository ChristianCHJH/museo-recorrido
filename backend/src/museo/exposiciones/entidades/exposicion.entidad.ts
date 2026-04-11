import { Column, DataType, Model, Table } from 'sequelize-typescript';
import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';

@Table({
  tableName: 'exposiciones',
  timestamps: false,
})
export class ExposicionEntidad extends Model<
  InferAttributes<ExposicionEntidad>,
  InferCreationAttributes<ExposicionEntidad>
> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: CreationOptional<string>;

  @Column({ type: DataType.STRING(200), allowNull: false })
  declare nombre: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare descripcion: CreationOptional<string | null>;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    defaultValue: 'permanente',
  })
  declare tipo: CreationOptional<string>;

  @Column({
    field: 'imagen_portada_url',
    type: DataType.STRING(500),
    allowNull: true,
  })
  declare imagenPortadaUrl: CreationOptional<string | null>;

  @Column({ field: 'fecha_inicio', type: DataType.DATE, allowNull: true })
  declare fechaInicio: CreationOptional<Date | null>;

  @Column({ field: 'fecha_fin', type: DataType.DATE, allowNull: true })
  declare fechaFin: CreationOptional<Date | null>;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare orden: CreationOptional<number>;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare estado: CreationOptional<boolean>;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare eliminado: CreationOptional<boolean>;

  @Column({
    field: 'creado_en',
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare creadoEn: CreationOptional<Date>;

  @Column({
    field: 'actualizado_en',
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare actualizadoEn: CreationOptional<Date>;
}
