# CLAUDE.md — Frontend (proyecto_spa_ng)

SPA con Angular 18, PrimeNG 17, PrimeFlex 3.3, Standalone Components, Signals.

## Comandos

```bash
npm start              # Servidor desarrollo en http://localhost:4200
npm run build          # Build produccion a dist/
ng test                # Tests unitarios con Karma/Jasmine
ng generate component features/<feature>/<nombre>  # Generar componente
```

## Estructura del codigo

```
src/app/
├── core/                                ← Singleton (importado una vez en root)
│   ├── guards/
│   │   └── guardia-autenticacion.ts     ← CanActivateFn, protege rutas autenticadas
│   ├── interceptors/
│   │   └── autenticacion.interceptor.ts ← JWT auto-attach + refresh automatico con shareReplay
│   └── services/
│       └── http-base.service.ts         ← GET/POST/PATCH/DELETE con apiUrl prepend
├── shared/                              ← Reutilizable en toda la app
│   ├── shared.module.ts                 ← Exporta PrimeNG + componentes compartidos
│   ├── components/
│   │   ├── barra-lateral/               ← Menu lateral del panel
│   │   ├── boton/                       ← Boton reutilizable
│   │   └── entrada/                     ← Input reutilizable
│   └── directives/                      ← Directivas compartidas
└── features/                            ← Modulos de negocio (feature-first)
    ├── autenticacion/
    │   └── inicio-sesion/               ← Pagina de login
    ├── panel/                           ← Dashboard principal (shell con barra lateral)
    ├── usuarios/
    │   ├── usuarios-lista/              ← Listado de usuarios
    │   └── usuario-acceso/              ← Configuracion de acceso por usuario
    ├── roles/
    │   ├── roles-lista/                 ← Listado de roles
    │   └── rol-acceso/                  ← Asignacion de permisos a rol
    ├── permisos/
    │   └── permisos-lista/              ← Listado de permisos
    ├── secciones/
    │   └── secciones-permiso-lista/     ← Listado de secciones de permiso
    └── administracion/
        ├── empresa/                     ← Datos fiscales
        ├── negocios-lista/              ← CRUD negocios
        ├── tiendas-lista/               ← CRUD tiendas + horarios
        ├── almacenes-lista/             ← CRUD almacenes
        ├── configuraciones-lista/       ← Configuraciones clave-valor + IGV
        └── usuarios-tiendas-lista/      ← Vinculacion usuarios-tiendas
```

## Routing

- `/` → InicioSesionComponent (login)
- `/dashboard` → PanelComponent (canActivate: guardiaAutenticacion)
- `/dashboard/:vista` → PanelComponent carga features internamente segun `:vista`
- Lazy loading con `loadComponent()`

## Patrones establecidos

- **Estado:** Signals + `computed()` para reactividad local. RxJS solo para flujos HTTP.
- **DI:** `inject()` preferido sobre constructor injection. Servicios con `providedIn: 'root'`.
- **Formularios:** Reactive Forms con `FormBuilder.nonNullable.group()`.
- **Auto-unsubscribe:** `takeUntilDestroyed(destroyRef)` en subscripciones.
- **HTTP:** Todo via `HttpBaseService` que prepend `environment.apiUrl` (default: `http://localhost:3200`).
- **Componentes:** Standalone. Importan `SharedModule` para PrimeNG.

## Autenticacion

- `ServicioAutenticacion` maneja login, tokens (localStorage/sessionStorage), refresh
- `interceptorAutenticacion` agrega Bearer token y maneja 401 con refresh automatico
- `guardiaAutenticacion` protege rutas que requieren autenticacion
- Tokens almacenados bajo clave `spa.auth.tokens`

## Path aliases (tsconfig.json)

```typescript
@core/*      → src/app/core/*
@shared/*    → src/app/shared/*
@features/*  → src/app/features/*
@env/*       → src/environments/*
```

## Convenciones globales

Ver `CLAUDE.md` en la raiz del proyecto para convenciones compartidas (idioma, soft delete, respuesta API estandar, multi-tenancy).
