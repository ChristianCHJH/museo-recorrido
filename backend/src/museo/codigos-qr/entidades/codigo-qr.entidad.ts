import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
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
  tableName: 'codigos_qr',
  timestamps: false,
})
export class CodigoQrEntidad extends Model<
  InferAttributes<CodigoQrEntidad>,
  InferCreationAttributes<CodigoQrEntidad>
> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: CreationOptional<string>;

  @ForeignKey(() => SeccionRecorridoEntidad)
  @Column({ field: 'seccion_id', type: DataType.UUID, allowNull: true })
  declare seccionId: CreationOptional<string | null>;

  @BelongsTo(() => SeccionRecorridoEntidad)
  seccion: SeccionRecorridoEntidad;

  @Column({ type: DataType.STRING(100), allowNull: false, unique: true })
  declare codigo: string;

  @Column({ field: 'nombre_descriptivo', type: DataType.STRING(200), allowNull: true })
  declare nombreDescriptivo: CreationOptional<string | null>;

  @Column({ field: 'imagen_qr_url', type: DataType.STRING(500), allowNull: true })
  declare imagenQrUrl: CreationOptional<string | null>;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare activo: CreationOptional<boolean>;

  @Column({ field: 'total_escaneos', type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare totalEscaneos: CreationOptional<number>;

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
