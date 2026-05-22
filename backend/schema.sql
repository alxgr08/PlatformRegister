-- ============================================================================
--  Sistema de Registro de Evento y Charlas
--  Esquema de base de datos para Supabase / PostgreSQL
--
--  Como usarlo:
--    1. Entra a tu proyecto en https://supabase.com
--    2. Menu lateral -> SQL Editor -> New query
--    3. Pega TODO este archivo y presiona "Run"
--  (Ejecutar ANTES de iniciar el backend por primera vez.)
-- ============================================================================

-- ----- Tabla: asistente  (base de pre-registro + nuevos registrados) --------
create table if not exists asistente (
    id                    bigint generated always as identity primary key,
    dni                   varchar(20)  not null unique,
    nombre_completo       varchar(200) not null,
    nombre                varchar(150),
    apellidos             varchar(150),
    celular               varchar(30),
    correo                varchar(150),
    especialidad          varchar(150),
    tipo_documento        varchar(20),
    terminos_cmr          boolean,
    terminos_condiciones  boolean,
    fecha_registro_origen varchar(40),
    tipo_registro         varchar(50)  not null default 'PRE-REGISTRADO',
    fecha_ingreso_evento  timestamp,
    creado_en             timestamp    not null default now()
);

-- Si la tabla ya existia, agrega las columnas nuevas (Excel) de forma segura.
alter table asistente add column if not exists nombre                varchar(150);
alter table asistente add column if not exists apellidos             varchar(150);
alter table asistente add column if not exists tipo_documento        varchar(20);
alter table asistente add column if not exists terminos_cmr          boolean;
alter table asistente add column if not exists terminos_condiciones  boolean;
alter table asistente add column if not exists fecha_registro_origen varchar(40);

create index if not exists idx_asistente_dni     on asistente (dni);
create index if not exists idx_asistente_ingreso on asistente (fecha_ingreso_evento);

-- ----- Tabla: charla  (charlas / salas) -------------------------------------
create table if not exists charla (
    id          bigint generated always as identity primary key,
    nombre      varchar(200) not null,
    sala        varchar(100) not null,
    hora_inicio timestamp    not null,
    hora_fin    timestamp    not null,
    aforo       integer      not null default 0  check (aforo >= 0),
    registrados integer      not null default 0  check (registrados >= 0),
    oculta      boolean      not null default false,
    creado_en   timestamp    not null default now()
);

-- ----- Tabla: registro_charla  (asistentes inscritos en charlas) ------------
--  La restriccion unica impide que un DNI se inscriba dos veces en la misma charla.
create table if not exists registro_charla (
    id            bigint generated always as identity primary key,
    charla_id     bigint      not null references charla(id)    on delete cascade,
    asistente_id  bigint      not null references asistente(id) on delete cascade,
    dni           varchar(20) not null,
    registrado_en timestamp   not null default now(),
    constraint uk_registro_charla unique (charla_id, asistente_id)
);

create index if not exists idx_registro_charla_charla    on registro_charla (charla_id);
create index if not exists idx_registro_charla_asistente on registro_charla (asistente_id);

-- ============================================================================
--  DATOS DE EJEMPLO (opcional)  -  ejecutar solo una vez
--  Charlas de prueba para tener contenido en la pantalla de Salas.
-- ============================================================================
insert into charla (nombre, sala, hora_inicio, hora_fin, aforo) values
    ('Inteligencia Artificial en Salud', 'Sala A', '2026-05-21 09:00:00', '2026-05-21 10:00:00', 80),
    ('Cardiologia Moderna',              'Sala B', '2026-05-21 09:00:00', '2026-05-21 10:00:00', 50),
    ('Innovacion en Cirugia',            'Sala A', '2026-05-21 10:30:00', '2026-05-21 11:30:00', 80),
    ('Salud Publica y Prevencion',       'Sala C', '2026-05-21 12:00:00', '2026-05-21 13:00:00', 120);

-- ============================================================================
--  TIEMPO REAL (opcional, recomendado)
--  Habilita la replicacion Realtime para que el frontend reciba en vivo los
--  cambios de aforo / contadores sin recargar. Ejecutar una vez:
-- ============================================================================
-- alter publication supabase_realtime add table charla;
-- alter publication supabase_realtime add table registro_charla;
