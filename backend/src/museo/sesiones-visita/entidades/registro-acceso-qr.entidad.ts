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
import { CodigoQrEntidad } from '../../codigos-qr/entidades/codigo-qr.entidad';
import { SesionVisitaEntidad } from './sesion-visita.entidad';

@Table({
  tableName: 'registros_acceso_qr',
  timestamps: false,
})
export class RegistroAccesoQrEntidad extends Model<
  InferAttributes<RegistroAccesoQrEntidad>,
  InferCreationAttributes<RegistroAccesoQrEntidad>
> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: CreationOptional<string>;

  @ForeignKey(() => CodigoQrEntidad)
  @Column({ field: 'codigo_qr_id', type: DataType.UUID, allowNull: false })
  declare codigoQrId: string;

  @BelongsTo(() => CodigoQrEntidad)
  codigoQr: CodigoQrEntidad;

  @ForeignKey(() => SesionVisitaEntidad)
  @Column({ field: 'sesion_visita_id', type: DataType.UUID, allowNull: true })
  declare sesionVisitaId: CreationOptional<string | null>;

  @BelongsTo(() => SesionVisitaEntidad)
  sesionVisita: SesionVisitaEntidad;

  @Column({ field: 'ip_origen', type: DataType.STRING(45), allowNull: true })
  declare ipOrigen: CreationOptional<string | null>;

  @Column({ field: 'user_agent', type: DataType.TEXT, allowNull: true })
  declare userAgent: CreationOptional<string | null>;

  @Column({ type: DataType.STRING(30), allowNull: false })
  declare resultado: string;

  @Column({ field: 'fecha_acceso', type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  declare fechaAcceso: CreationOptional<Date>;
}
