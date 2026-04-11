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
import { CodigoQrEntidad } from '../../codigos-qr/entidades/codigo-qr.entidad';

@Table({
  tableName: 'sesiones_visita',
  timestamps: false,
})
export class SesionVisitaEntidad extends Model<
  InferAttributes<SesionVisitaEntidad>,
  InferCreationAttributes<SesionVisitaEntidad>
> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: CreationOptional<string>;

  @Column({ type: DataType.STRING(200), allowNull: false, unique: true })
  declare token: string;

  @ForeignKey(() => CodigoQrEntidad)
  @Column({ field: 'codigo_qr_id', type: DataType.UUID, allowNull: false })
  declare codigoQrId: string;

  @BelongsTo(() => CodigoQrEntidad)
  codigoQr: CodigoQrEntidad;

  @Column({ field: 'ip_origen', type: DataType.STRING(45), allowNull: true })
  declare ipOrigen: CreationOptional<string | null>;

  @Column({ field: 'user_agent', type: DataType.TEXT, allowNull: true })
  declare userAgent: CreationOptional<string | null>;

  @Column({ field: 'fecha_creacion', type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  declare fechaCreacion: CreationOptional<Date>;

  @Column({ field: 'fecha_expiracion', type: DataType.DATE, allowNull: false })
  declare fechaExpiracion: Date;

  @Column({ field: 'fecha_ultimo_acceso', type: DataType.DATE, allowNull: true })
  declare fechaUltimoAcceso: CreationOptional<Date | null>;

  @Column({ field: 'total_accesos', type: DataType.INTEGER, allowNull: false, defaultValue: 1 })
  declare totalAccesos: CreationOptional<number>;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare estado: CreationOptional<boolean>;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare eliminado: CreationOptional<boolean>;
}
