import { Column, DataType, Model, Table } from 'sequelize-typescript';
import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';

@Table({
  tableName: 'configuracion_museo',
  timestamps: false,
})
export class ConfiguracionMuseoEntidad extends Model<
  InferAttributes<ConfiguracionMuseoEntidad>,
  InferCreationAttributes<ConfiguracionMuseoEntidad>
> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: CreationOptional<string>;

  @Column({ type: DataType.STRING(200), allowNull: false })
  declare nombre: string;

  @Column({ type: DataType.STRING(300), allowNull: true })
  declare subtitulo: CreationOptional<string | null>;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare descripcion: CreationOptional<string | null>;

  @Column({ field: 'logo_url', type: DataType.STRING(500), allowNull: true })
  declare logoUrl: CreationOptional<string | null>;

  @Column({
    field: 'color_primario',
    type: DataType.STRING(20),
    allowNull: true,
    defaultValue: '#5D4037',
  })
  declare colorPrimario: CreationOptional<string | null>;

  @Column({
    field: 'color_secundario',
    type: DataType.STRING(20),
    allowNull: true,
    defaultValue: '#C5B358',
  })
  declare colorSecundario: CreationOptional<string | null>;

  @Column({
    field: 'color_terciario',
    type: DataType.STRING(20),
    allowNull: true,
    defaultValue: '#827717',
  })
  declare colorTerciario: CreationOptional<string | null>;

  @Column({
    field: 'fuente_principal',
    type: DataType.STRING(100),
    allowNull: true,
    defaultValue: 'Noto Serif',
  })
  declare fuentePrincipal: CreationOptional<string | null>;

  @Column({ field: 'sitio_web', type: DataType.STRING(300), allowNull: true })
  declare sitioWeb: CreationOptional<string | null>;

  @Column({
    field: 'correo_contacto',
    type: DataType.STRING(200),
    allowNull: true,
  })
  declare correoContacto: CreationOptional<string | null>;

  @Column({
    field: 'telefono_contacto',
    type: DataType.STRING(50),
    allowNull: true,
  })
  declare telefonoContacto: CreationOptional<string | null>;

  @Column({ type: DataType.STRING(400), allowNull: true })
  declare direccion: CreationOptional<string | null>;

  @Column({
    field: 'redes_sociales',
    type: DataType.JSONB,
    allowNull: true,
  })
  declare redesSociales: CreationOptional<object | null>;

  @Column({
    field: 'duracion_sesion_visita_minutos',
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 15,
  })
  declare duracionSesionVisitaMinutos: CreationOptional<number>;

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
