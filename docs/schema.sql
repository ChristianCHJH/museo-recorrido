-- =============================================================
-- MUSEO QR — Schema completo
-- PostgreSQL · schema: public
-- =============================================================
-- Ejecutar en orden. Las tablas de autenticación van primero
-- porque los módulos del museo no dependen de ellas, pero
-- conviene tenerlas todas en un solo script para levantar
-- la base desde cero.
-- =============================================================

-- -------------------------------------------------------------
-- Crear la base de datos (ignorar si ya existe)
-- -------------------------------------------------------------
SELECT 'CREATE DATABASE museo_qr_db'
WHERE NOT EXISTS (
    SELECT FROM pg_database WHERE datname = 'museo_qr_db'
)\gexec

\c museo_qr_db

-- -------------------------------------------------------------
-- 0. Extensiones
-- -------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()


-- =============================================================
-- BLOQUE 1 — Autenticación (prototipo existente)
-- =============================================================

CREATE TABLE IF NOT EXISTS permiso_secciones (
    id                   BIGSERIAL PRIMARY KEY,
    nombre               VARCHAR(150)  NOT NULL,
    descripcion          TEXT,
    estado               BOOLEAN       NOT NULL DEFAULT TRUE,
    eliminado            BOOLEAN       NOT NULL DEFAULT FALSE,
    fecha_eliminacion    TIMESTAMP,
    fecha_creacion       TIMESTAMP              DEFAULT NOW(),
    fecha_actualizacion  TIMESTAMP,
    usuario_creacion     BIGINT,
    usuario_actualizacion BIGINT
);

CREATE TABLE IF NOT EXISTS usuarios (
    id                    BIGSERIAL PRIMARY KEY,
    nombre_usuario        VARCHAR(150)  NOT NULL UNIQUE,
    contrasena_hash       TEXT          NOT NULL,
    correo                VARCHAR(150)  NOT NULL UNIQUE,
    estado                BOOLEAN       NOT NULL DEFAULT TRUE,
    eliminado             BOOLEAN       NOT NULL DEFAULT FALSE,
    fecha_eliminacion     TIMESTAMP,
    ultima_sesion         TIMESTAMP,
    usuario_creacion      BIGINT,
    usuario_actualizacion BIGINT,
    fecha_creacion        TIMESTAMP              DEFAULT NOW(),
    fecha_actualizacion   TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles (
    id                    BIGSERIAL PRIMARY KEY,
    rol                   VARCHAR(150)  NOT NULL UNIQUE,
    descripcion           TEXT,
    estado                BOOLEAN       NOT NULL DEFAULT TRUE,
    eliminado             BOOLEAN       NOT NULL DEFAULT FALSE,
    fecha_eliminacion     TIMESTAMP,
    usuario_creacion      BIGINT,
    usuario_actualizacion BIGINT,
    fecha_creacion        TIMESTAMP              DEFAULT NOW(),
    fecha_actualizacion   TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permisos (
    id                    BIGSERIAL PRIMARY KEY,
    permiso               VARCHAR(150)  NOT NULL,
    descripcion           TEXT,
    estado                BOOLEAN       NOT NULL DEFAULT TRUE,
    eliminado             BOOLEAN       NOT NULL DEFAULT FALSE,
    fecha_eliminacion     TIMESTAMP,
    seccion_id            BIGINT        REFERENCES permiso_secciones(id),
    usuario_creacion      BIGINT,
    usuario_actualizacion BIGINT,
    fecha_creacion        TIMESTAMP              DEFAULT NOW(),
    fecha_actualizacion   TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles_permisos (
    id                    BIGSERIAL PRIMARY KEY,
    rol_id                BIGINT        NOT NULL REFERENCES roles(id),
    permiso_id            BIGINT        NOT NULL REFERENCES permisos(id),
    estado                BOOLEAN       NOT NULL DEFAULT TRUE,
    eliminado             BOOLEAN       NOT NULL DEFAULT FALSE,
    fecha_eliminacion     TIMESTAMP,
    usuario_creacion      BIGINT,
    usuario_actualizacion BIGINT,
    fecha_creacion        TIMESTAMP              DEFAULT NOW(),
    fecha_actualizacion   TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuarios_roles (
    id                    BIGSERIAL PRIMARY KEY,
    usuario_id            BIGINT        NOT NULL REFERENCES usuarios(id),
    rol_id                BIGINT        NOT NULL REFERENCES roles(id),
    estado                BOOLEAN       NOT NULL DEFAULT TRUE,
    eliminado             BOOLEAN       NOT NULL DEFAULT FALSE,
    fecha_eliminacion     TIMESTAMP,
    usuario_creacion      BIGINT,
    fecha_creacion        TIMESTAMP              DEFAULT NOW(),
    fecha_actualizacion   TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuarios_permisos (
    id                    BIGSERIAL PRIMARY KEY,
    usuario_id            BIGINT        NOT NULL REFERENCES usuarios(id),
    permiso_id            BIGINT        NOT NULL REFERENCES permisos(id),
    estado                BOOLEAN       NOT NULL DEFAULT TRUE,
    eliminado             BOOLEAN       NOT NULL DEFAULT FALSE,
    fecha_eliminacion     TIMESTAMP,
    usuario_creacion      BIGINT,
    usuario_actualizacion BIGINT,
    fecha_creacion        TIMESTAMP              DEFAULT NOW(),
    fecha_actualizacion   TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refresh_token (
    jti                  VARCHAR(255)  PRIMARY KEY,
    usuario_id           BIGINT        NOT NULL REFERENCES usuarios(id),
    revocado             BOOLEAN       NOT NULL DEFAULT FALSE,
    expira_en            TIMESTAMP     NOT NULL,
    reemplazado_por_jti  VARCHAR(255),
    hash                 TEXT          NOT NULL,
    ip                   VARCHAR(45),
    agente_usuario       TEXT,
    creado_en            TIMESTAMP              DEFAULT NOW(),
    actualizado_en       TIMESTAMP
);


-- =============================================================
-- BLOQUE 2 — Museo (módulos nuevos)
-- =============================================================

-- -------------------------------------------------------------
-- 2.1. configuracion_museo  (instancia única)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS configuracion_museo (
    id                              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre                          VARCHAR(200) NOT NULL,
    subtitulo                       VARCHAR(300),
    descripcion                     TEXT,
    logo_url                        VARCHAR(500),
    color_primario                  VARCHAR(20),
    color_secundario                VARCHAR(20),
    color_acento                    VARCHAR(20),
    fuente_principal                VARCHAR(100),
    sitio_web                       VARCHAR(300),
    correo_contacto                 VARCHAR(200),
    telefono_contacto               VARCHAR(50),
    direccion                       VARCHAR(400),
    redes_sociales                  JSONB,
    duracion_sesion_visita_minutos  INTEGER      NOT NULL DEFAULT 120,
    estado                          BOOLEAN      NOT NULL DEFAULT TRUE,
    eliminado                       BOOLEAN      NOT NULL DEFAULT FALSE,
    creado_en                       TIMESTAMP    NOT NULL DEFAULT NOW(),
    actualizado_en                  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 2.2. exposiciones
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS exposiciones (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre            VARCHAR(200) NOT NULL,
    descripcion       TEXT,
    tipo              VARCHAR(50)  NOT NULL DEFAULT 'permanente',
    imagen_portada_url VARCHAR(500),
    fecha_inicio      DATE,
    fecha_fin         DATE,
    orden             INTEGER      NOT NULL DEFAULT 0,
    estado            BOOLEAN      NOT NULL DEFAULT TRUE,
    eliminado         BOOLEAN      NOT NULL DEFAULT FALSE,
    creado_en         TIMESTAMP    NOT NULL DEFAULT NOW(),
    actualizado_en    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 2.3. secciones_recorrido
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS secciones_recorrido (
    id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    exposicion_id         UUID          NOT NULL REFERENCES exposiciones(id),
    nombre                VARCHAR(200)  NOT NULL,
    subtitulo             VARCHAR(300),
    descripcion_breve     VARCHAR(500),
    contenido_historico   TEXT,
    datos_curiosos        TEXT,
    personajes_relacionados TEXT,
    periodo_historico     VARCHAR(200),
    frase_destacada       VARCHAR(500),
    orden                 INTEGER       NOT NULL DEFAULT 0,
    imagen_principal_url  VARCHAR(500),
    plantilla             VARCHAR(50)   NOT NULL DEFAULT 'estandar',
    estado                BOOLEAN       NOT NULL DEFAULT TRUE,
    eliminado             BOOLEAN       NOT NULL DEFAULT FALSE,
    creado_en             TIMESTAMP     NOT NULL DEFAULT NOW(),
    actualizado_en        TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 2.4. elementos_multimedia
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS elementos_multimedia (
    id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    seccion_id    UUID          NOT NULL REFERENCES secciones_recorrido(id),
    tipo          VARCHAR(20)   NOT NULL,   -- imagen | video_local | video_youtube | video_vimeo
    url           VARCHAR(500)  NOT NULL,
    url_miniatura VARCHAR(500),
    titulo        VARCHAR(200),
    descripcion   VARCHAR(500),
    es_principal  BOOLEAN       NOT NULL DEFAULT FALSE,
    orden         INTEGER       NOT NULL DEFAULT 0,
    peso_bytes    BIGINT,
    estado        BOOLEAN       NOT NULL DEFAULT TRUE,
    eliminado     BOOLEAN       NOT NULL DEFAULT FALSE,
    creado_en     TIMESTAMP     NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 2.5. codigos_qr
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS codigos_qr (
    id                 UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    seccion_id         UUID          REFERENCES secciones_recorrido(id),
    codigo             VARCHAR(100)  NOT NULL UNIQUE,
    nombre_descriptivo VARCHAR(200),
    imagen_qr_url      VARCHAR(500),
    activo             BOOLEAN       NOT NULL DEFAULT TRUE,
    total_escaneos     INTEGER       NOT NULL DEFAULT 0,
    estado             BOOLEAN       NOT NULL DEFAULT TRUE,
    eliminado          BOOLEAN       NOT NULL DEFAULT FALSE,
    creado_en          TIMESTAMP     NOT NULL DEFAULT NOW(),
    actualizado_en     TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 2.6. sesiones_visita
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sesiones_visita (
    id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    token               VARCHAR(200)  NOT NULL UNIQUE,
    codigo_qr_id        UUID          NOT NULL REFERENCES codigos_qr(id),
    ip_origen           VARCHAR(45),
    user_agent          TEXT,
    fecha_creacion      TIMESTAMP     NOT NULL DEFAULT NOW(),
    fecha_expiracion    TIMESTAMP     NOT NULL,
    fecha_ultimo_acceso TIMESTAMP,
    total_accesos       INTEGER       NOT NULL DEFAULT 1,
    estado              BOOLEAN       NOT NULL DEFAULT TRUE,
    eliminado           BOOLEAN       NOT NULL DEFAULT FALSE
);

-- -------------------------------------------------------------
-- 2.7. registros_acceso_qr  (append-only, sin soft delete)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS registros_acceso_qr (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_qr_id     UUID         NOT NULL REFERENCES codigos_qr(id),
    sesion_visita_id UUID         REFERENCES sesiones_visita(id),
    ip_origen        VARCHAR(45),
    user_agent       TEXT,
    resultado        VARCHAR(30)  NOT NULL,  -- token_emitido | token_valido | token_expirado | qr_inactivo | seccion_inactiva
    fecha_acceso     TIMESTAMP    NOT NULL DEFAULT NOW()
);


-- =============================================================
-- ÍNDICES
-- =============================================================

-- Autenticación
CREATE INDEX IF NOT EXISTS idx_usuarios_correo          ON usuarios(correo);
CREATE INDEX IF NOT EXISTS idx_refresh_token_usuario    ON refresh_token(usuario_id);

-- Museo
CREATE INDEX IF NOT EXISTS idx_exposiciones_estado      ON exposiciones(estado, eliminado);
CREATE INDEX IF NOT EXISTS idx_secciones_exposicion     ON secciones_recorrido(exposicion_id, eliminado);
CREATE INDEX IF NOT EXISTS idx_secciones_orden          ON secciones_recorrido(exposicion_id, orden);
CREATE INDEX IF NOT EXISTS idx_multimedia_seccion       ON elementos_multimedia(seccion_id, eliminado);
CREATE INDEX IF NOT EXISTS idx_qr_codigo                ON codigos_qr(codigo);
CREATE INDEX IF NOT EXISTS idx_qr_seccion               ON codigos_qr(seccion_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_token           ON sesiones_visita(token);
CREATE INDEX IF NOT EXISTS idx_sesiones_expiracion      ON sesiones_visita(fecha_expiracion, estado);
CREATE INDEX IF NOT EXISTS idx_registros_qr             ON registros_acceso_qr(codigo_qr_id, fecha_acceso);


-- =============================================================
-- DATOS INICIALES
-- =============================================================

-- Usuario admin por defecto  (contraseña: Admin1234!)
-- Hash generado con bcrypt rounds=10
INSERT INTO usuarios (nombre_usuario, contrasena_hash, correo, estado, fecha_creacion)
VALUES (
    'admin',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin@museo.local',
    TRUE,
    NOW()
)
ON CONFLICT (nombre_usuario) DO NOTHING;

-- Configuración inicial del museo
INSERT INTO configuracion_museo (nombre, subtitulo, color_primario, color_secundario, color_acento)
VALUES (
    'Museo',
    'Preservando la memoria',
    '#4a2c0a',
    '#8b6340',
    '#c8a96e'
)
ON CONFLICT DO NOTHING;
