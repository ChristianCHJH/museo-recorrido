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
import { ExposicionEntidad } from '../../exposiciones/entidades/exposicion.entidad';

@Table({
  tableName: 'secciones_recorrido',
  timestamps: false,
})
export class SeccionRecorridoEntidad extends Model<
  InferAttributes<SeccionRecorridoEntidad>,
  InferCreationAttributes<SeccionRecorridoEntidad>
> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: CreationOptional<string>;

  @ForeignKey(() => ExposicionEntidad)
  @Column({ field: 'exposicion_id', type: DataType.UUID, allowNull: false })
  declare exposicionId: string;

  @BelongsTo(() => ExposicionEntidad)
  exposicion: ExposicionEntidad;

  @Column({ type: DataType.STRING(200), allowNull: false })
  declare nombre: string;

  @Column({ type: DataType.STRING(300), allowNull: true })
  declare subtitulo: CreationOptional<string | null>;

  @Column({
    field: 'descripcion_breve',
    type: DataType.STRING(500),
    allowNull: true,
  })
  declare descripcionBreve: CreationOptional<string | null>;

  @Column({
    field: 'contenido_historico',
    type: DataType.TEXT,
    allowNull: true,
  })
  declare contenidoHistorico: CreationOptional<string | null>;

  @Column({ field: 'datos_curiosos', type: DataType.TEXT, allowNull: true })
  declare datosCuriosos: CreationOptional<string | null>;

  @Column({
    field: 'personajes_relacionados',
    type: DataType.TEXT,
    allowNull: true,
  })
  declare personajesRelacionados: CreationOptional<string | null>;

  @Column({
    field: 'periodo_historico',
    type: DataType.STRING(200),
    allowNull: true,
  })
  declare periodoHistorico: CreationOptional<string | null>;

  @Column({
    field: 'frase_destacada',
    type: DataType.STRING(500),
    allowNull: true,
  })
  declare fraseDestacada: CreationOptional<string | null>;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare orden: CreationOptional<number>;

  @Column({
    field: 'imagen_principal_url',
    type: DataType.STRING(500),
    allowNull: true,
  })
  declare imagenPrincipalUrl: CreationOptional<string | null>;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    defaultValue: 'estandar',
  })
  declare plantilla: CreationOptional<string>;

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
