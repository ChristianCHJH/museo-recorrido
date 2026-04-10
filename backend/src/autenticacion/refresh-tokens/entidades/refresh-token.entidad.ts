import { Column, DataType, Model, Table } from 'sequelize-typescript';
import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';

@Table({
  tableName: 'refresh_token',
  timestamps: false,
})
export class RefreshToken extends Model<
  InferAttributes<RefreshToken>,
  InferCreationAttributes<RefreshToken>
> {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
  })
  declare jti: string;

  @Column({ field: 'usuario_id', type: DataType.BIGINT })
  declare usuarioId: number;

  @Column({ type: DataType.BOOLEAN })
  declare revocado: CreationOptional<boolean>;

  @Column({ field: 'expira_en', type: DataType.DATE })
  declare expira: Date;

  @Column({ field: 'reemplazado_por_jti', type: DataType.STRING })
  declare reemplazadoPorJti: CreationOptional<string | null>;

  @Column({ type: DataType.STRING, allowNull: false })
  declare hash: CreationOptional<string>;

  @Column({ type: DataType.STRING, allowNull: true })
  declare ip: CreationOptional<string | null>;

  @Column({ field: 'agente_usuario', type: DataType.STRING })
  declare agenteUsuario: CreationOptional<string | null>;

  @Column({ field: 'creado_en', type: DataType.DATE })
  declare creadoEn: CreationOptional<Date>;

  @Column({ field: 'actualizado_en', type: DataType.DATE })
  declare actualizadoEn: CreationOptional<Date | null>;
}
