import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  Model,
  Table,
} from 'sequelize-typescript';
import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { SeccionRecorridoEntidad } from '../../secciones-recorrido/entidades/seccion-recorrido.entidad';
import { TipoBloque } from '../dto/tipos-bloque';

@Table({
  tableName: 'seccion_bloques',
  timestamps: false,
  indexes: [
    {
      fields: ['seccion_id', 'orden'],
      name: 'idx_seccion_bloques_seccion_orden',
    },
  ],
})
export class SeccionBloqueEntidad extends Model<
  InferAttributes<SeccionBloqueEntidad>,
  InferCreationAttributes<SeccionBloqueEntidad>
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

  @BelongsTo(() => SeccionRecorridoEntidad, { as: 'seccion', foreignKey: 'seccionId' })
  seccion: SeccionRecorridoEntidad;

  @Column({ type: DataType.STRING(40), allowNull: false })
  declare tipo: TipoBloque;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare orden: CreationOptional<number>;

  @Column({ type: DataType.JSONB, allowNull: false, defaultValue: {} })
  declare config: CreationOptional<Record<string, any>>;

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
