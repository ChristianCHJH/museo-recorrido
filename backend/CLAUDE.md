# CLAUDE.md — Backend (proyecto_spa_bk)

API REST con NestJS 10, TypeScript 5.4, Sequelize 6.37, PostgreSQL.

## Comandos

```bash
npm install            # Instalar dependencias
npm run start:dev      # Desarrollo con hot reload (ts-node-dev)
npm run build          # Compilar para produccion (tsc)
npm run start          # Ejecutar build de produccion
```

## Variables de entorno

Archivo `.env` requerido:

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`, `DB_SCHEMA` — Conexion PostgreSQL
- `JWT_SECRETO` — Clave de firma JWT
- `JWT_EXPIRACION` — Duracion access token (default: 15m)
- `JWT_REFRESH_EXPIRACION` — Duracion refresh token (default: 30d)

## Estructura del codigo

```
src/
├── main.ts                          ← Punto de entrada (bootstrap, Swagger, CORS, prefijo /api)
├── modulo-aplicacion.ts             ← Modulo raiz (registra todos los modulos de dominio)
├── autenticacion/                   ← Dominio: seguridad y acceso
│   ├── autenticacion/               ← Login, logout, refresh, JWT estrategia y guardia
│   │   ├── decoradores/             ← @Publica() para endpoints sin JWT
│   │   ├── estrategias/             ← JwtEstrategia (Passport)
│   │   ├── guardias/                ← JwtGuardia
│   │   └── interfaces/              ← Payload JWT
│   ├── usuarios/                    ← CRUD usuarios, bcrypt
│   ├── roles/                       ← CRUD roles
│   ├── permisos/                    ← CRUD permisos individuales
│   ├── secciones-permiso/           ← Agrupacion de permisos por dominio
│   ├── roles-permisos/              ← Asignacion permisos a roles (M:N)
│   ├── usuarios-roles/              ← Asignacion roles a usuarios (M:N)
│   ├── usuarios-permisos/           ← Permisos directos a usuario (sin rol)
│   └── refresh-tokens/              ← Almacenamiento y revocacion de refresh tokens
└── administracion/                  ← Dominio: configuracion del negocio
    ├── empresa/                     ← Datos fiscales centralizados (RUC)
    ├── negocios/                    ← Unidades de negocio
    ├── tiendas/                     ← Locales/sucursales + horarios
    ├── almacenes/                   ← Depositos por tienda
    ├── configuraciones/             ← Configuraciones clave-valor + IGV
    └── usuarios-tiendas/            ← Vinculacion usuarios a tiendas (M:N)
```

Cada modulo sigue la estructura: `dto/`, `entidades/`, `<nombre>.servicio.ts`, `<nombre>.controlador.ts`, `<nombre>.modulo.ts`

## API

- Prefijo global: `/api`
- Swagger: `/api/docs`
- OpenAPI JSON: `/api/openapi.json`
- ValidationPipe global con `whitelist`, `forbidNonWhitelisted`, `transform`

## Convenciones especificas del backend

- Controladores delgados: solo orquestan validar → servicio → responder
- Servicios @Injectable con @InjectModel para acceso a DB
- Entidades Sequelize: `@Table({ tableName: 'nombre', timestamps: false })`
- DTOs: class-validator + `@ApiProperty` para Swagger. `PartialType` importar de `@nestjs/swagger`
- Errores: NotFoundException (404), UnauthorizedException (401), ConflictException (409), BadRequestException (400)
- Queries de listado SIEMPRE filtran `eliminado: false`

## Convenciones globales

Ver `CLAUDE.md` en la raiz del proyecto para convenciones compartidas (idioma, soft delete, columnas obligatorias, respuesta API estandar, multi-tenancy).
