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
import { SeccionRecorridoEntidad } from '../../secciones-recorrido/entidades/seccion-recorrido.entidad';

@Table({
  tableName: 'elementos_multimedia',
  timestamps: false,
})
export class ElementoMultimediaEntidad extends Model<
  InferAttributes<ElementoMultimediaEntidad>,
  InferCreationAttributes<ElementoMultimediaEntidad>
> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: CreationOptional<string>;

  @ForeignKey(() => SeccionRecorridoEntidad)
  @Column({ field: 'seccion_id', type: DataType.UUID, allowNull: false })
  declare seccionId: string;

  @BelongsTo(() => SeccionRecorridoEntidad)
  seccion: SeccionRecorridoEntidad;

  @Column({ type: DataType.STRING(20), allowNull: false })
  declare tipo: string;

  @Column({ type: DataType.STRING(500), allowNull: false })
  declare url: string;

  @Column({ field: 'url_miniatura', type: DataType.STRING(500), allowNull: true })
  declare urlMiniatura: CreationOptional<string | null>;

  @Column({ type: DataType.STRING(200), allowNull: true })
  declare titulo: CreationOptional<string | null>;

  @Column({ type: DataType.STRING(500), allowNull: true })
  declare descripcion: CreationOptional<string | null>;

  @Column({ field: 'es_principal', type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare esPrincipal: CreationOptional<boolean>;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare orden: CreationOptional<number>;

  @Column({ field: 'peso_bytes', type: DataType.BIGINT, allowNull: true })
  declare pesoBytes: CreationOptional<bigint | null>;

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
