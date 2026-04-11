import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { SequelizeModule } from '@nestjs/sequelize';
import { SeccionesPermisoModulo } from './autenticacion/secciones-permiso/secciones-permiso.modulo';
import { PermisosModulo } from './autenticacion/permisos/permisos.modulo';
import { RolesModulo } from './autenticacion/roles/roles.modulo';
import { RolesPermisosModulo } from './autenticacion/roles-permisos/roles-permisos.modulo';
import { UsuariosModulo } from './autenticacion/usuarios/usuarios.modulo';
import { UsuariosRolesModulo } from './autenticacion/usuarios-roles/usuarios-roles.modulo';
import { UsuariosPermisosModulo } from './autenticacion/usuarios-permisos/usuarios-permisos.modulo';
import { RefreshTokensModulo } from './autenticacion/refresh-tokens/refresh-tokens.modulo';
import { AutenticacionModulo } from './autenticacion/autenticacion/autenticacion.modulo';
import { JwtGuardia } from './autenticacion/autenticacion/guardias/jwt.guardia';
import { ConfiguracionMuseoModulo } from './museo/configuracion-museo/configuracion-museo.modulo';
import { ExposicionesModulo } from './museo/exposiciones/exposiciones.modulo';
import { SeccionesRecorridoModulo } from './museo/secciones-recorrido/secciones-recorrido.modulo';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'postgres',
      database: process.env.DB_NAME || 'proyecto_spa',
      schema: process.env.DB_SCHEMA || 'public',
      autoLoadModels: true,
      synchronize: false,
    }),
    SeccionesPermisoModulo,
    PermisosModulo,
    RolesModulo,
    RolesPermisosModulo,
    UsuariosModulo,
    UsuariosRolesModulo,
    UsuariosPermisosModulo,
    RefreshTokensModulo,
    AutenticacionModulo,
    ConfiguracionMuseoModulo,
    ExposicionesModulo,
    SeccionesRecorridoModulo,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuardia,
    },
  ],
})
export class ModuloAplicacion {}
