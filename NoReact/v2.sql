create database UG;

USE UG;

-- ==============================================================================
-- 1. USUARIOS Y PERMISOS
-- ==============================================================================
create table user (
    idUser bigint not null auto_increment primary key,
    name varchar(100) not null,
    last_name varchar(30),
    second_last_name varchar(30),
    email varchar(150) not null,
    password varchar(64) not null,
    status boolean not null
);

create table module (
    idModule bigint not null auto_increment primary key,
    name varchar(50) not null,
    description varchar(150) not null,
    area varchar(50) not null,
    status boolean not null
);

create table profile (
    idProfile bigint not null auto_increment primary key,
    nickname varchar(50),
    description varchar(300),
    key_add boolean not null,
    key_delete boolean not null,
    key_edit boolean not null,
    key_export boolean not null
);

create table permissions (
    idPermission bigint not null auto_increment primary key,
    idUser bigint not null,
    idModule bigint not null,
    idProfile bigint not null,
    foreign key (idUser) references user (idUser),
    foreign key (idModule) references module (idModule),
    foreign key (idProfile) references profile (idProfile),
    unique (idUser, idModule)
);

-- ==============================================================================
-- 2. CATÁLOGOS
-- ==============================================================================
CREATE TABLE pais (
    idPais BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    codigo VARCHAR(5),
    status BOOLEAN NOT NULL DEFAULT 1
);

CREATE TABLE estado (
    idEstado BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    idPais BIGINT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    status BOOLEAN NOT NULL DEFAULT 1,
    FOREIGN KEY (idPais) REFERENCES pais (idPais)
);

CREATE TABLE municipio (
    idMunicipio BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    idEstado BIGINT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    status BOOLEAN NOT NULL DEFAULT 1,
    FOREIGN KEY (idEstado) REFERENCES estado (idEstado)
);

CREATE TABLE localidad (
    idLocalidad BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    idMunicipio BIGINT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    latitud VARCHAR(30),
    longitud VARCHAR(30),
    altitud VARCHAR(20),
    status BOOLEAN NOT NULL DEFAULT 1,
    FOREIGN KEY (idMunicipio) REFERENCES municipio (idMunicipio)
);

CREATE TABLE orden (
    idOrden BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    status BOOLEAN NOT NULL DEFAULT 1
);

CREATE TABLE familia (
    idFamilia BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    idOrden BIGINT,
    nombre VARCHAR(100) NOT NULL,
    status BOOLEAN NOT NULL DEFAULT 1,
    FOREIGN KEY (idOrden) REFERENCES orden (idOrden)
);

CREATE TABLE subfamilia (
    idSubfamilia BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    idFamilia BIGINT,
    nombre VARCHAR(100) NOT NULL,
    status BOOLEAN NOT NULL DEFAULT 1,
    FOREIGN KEY (idFamilia) REFERENCES familia (idFamilia)
);

CREATE TABLE tribu (
    idTribu BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    idSubfamilia BIGINT,
    nombre VARCHAR(100) NOT NULL,
    status BOOLEAN NOT NULL DEFAULT 1,
    FOREIGN KEY (idSubfamilia) REFERENCES subfamilia (idSubfamilia)
);

CREATE TABLE genero (
    idGenero BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    idTribu BIGINT,
    nombre VARCHAR(100) NOT NULL,
    status BOOLEAN NOT NULL DEFAULT 1,
    FOREIGN KEY (idTribu) REFERENCES tribu (idTribu)
);

CREATE TABLE especie (
    idEspecie BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    idGenero BIGINT,
    nombre VARCHAR(100) NOT NULL,
    subespecie VARCHAR(100),
    status BOOLEAN NOT NULL DEFAULT 1,
    FOREIGN KEY (idGenero) REFERENCES genero (idGenero)
);

CREATE TABLE tipo (
    idTipo BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    status BOOLEAN NOT NULL DEFAULT 1
);

CREATE TABLE determinador (
    idDeterminador BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(60),
    apellido_materno VARCHAR(60),
    correo VARCHAR(100),
    institucion VARCHAR(150),
    status BOOLEAN NOT NULL DEFAULT 1
);

CREATE TABLE colector (
    idColector BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(60),
    apellido_materno VARCHAR(60),
    correo VARCHAR(100),
    institucion VARCHAR(150),
    status BOOLEAN NOT NULL DEFAULT 1
);

CREATE TABLE planta_hospedera (
    idPlanta BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    familia_botanica VARCHAR(100),
    nombre_cientifico VARCHAR(150) NOT NULL,
    nombre_comun VARCHAR(150),
    status BOOLEAN NOT NULL DEFAULT 1
);

CREATE TABLE organismo_hospedero (
    idOrganismo BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    familia_hospedera VARCHAR(100),
    nombre_organismo VARCHAR(150) NOT NULL,
    status BOOLEAN NOT NULL DEFAULT 1
);

CREATE TABLE coleccion (
    idColeccion BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    acronimo VARCHAR(50) NOT NULL, -- Ej: LTC-ICA
    nombre_institucion VARCHAR(255),
    status BOOLEAN NOT NULL DEFAULT 1
);

CREATE TABLE cita (
    idCita BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(500) NOT NULL,
    autores VARCHAR(500),
    anio SMALLINT,
    revista VARCHAR(200),
    volumen VARCHAR(50),
    paginas VARCHAR(50),
    referencia_completa TEXT,
    status BOOLEAN NOT NULL DEFAULT 1
);

-- =========================================================================================
-- Tabla de segunda opcion (no se usa directamente en el sistemas, pero se queda por si escala)
-- Nos ahorramos crear tablas para cada nivel taxonomico, con esta tabla se puede crear cualquier nivel taxonomico
-- Por ejemplo:
-- idTaxon | idPadre | rango      | nombre                     | status
-- 1       | NULL    | Orden      | Hymenoptera                | 1
-- 2       | 1       | Familia    | Formicidae                 | 1
-- 3       | 2       | Subfamilia | Myrmicinae                 | 1
-- 4       | 3       | Tribu      | Pheidolini                 | 1
-- 5       | 4       | Genero     | Pheidole                   | 1
-- 6       | 5       | Especie    | Pheidole pilosior          | 1
-- 7       | 6       | Subespecie | Pheidole pilosior pilosior | 1
-- 8       | 2       | Subfamilia | Formicinae                 | 1

CREATE TABLE taxonomia (
    idTaxon BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    idPadre BIGINT NULL, -- Apunta al idTaxon del nivel superior
    rango VARCHAR(50) NOT NULL, -- Ej: 'Orden', 'Familia', 'Genero', 'Especie'
    nombre VARCHAR(100) NOT NULL,
    status BOOLEAN NOT NULL DEFAULT 1,
    FOREIGN KEY (idPadre) REFERENCES taxonomia (idTaxon)
);
-- =========================================================================================

-- ==============================================================================
-- 5. TABLA PRINCIPAL
-- ==============================================================================
CREATE TABLE especimenes (
    id_especimen BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_pais BIGINT NULL,
    id_estado BIGINT NULL,
    id_municipio BIGINT NULL,
    id_localidad BIGINT NULL,
    id_orden BIGINT NULL,
    id_familia BIGINT NULL,
    id_subfamilia BIGINT NULL,
    id_tribu BIGINT NULL,
    id_genero BIGINT NULL,
    id_especie BIGINT NULL,
    id_tipo BIGINT NULL,
    id_colector BIGINT NULL,
    id_determinador BIGINT NULL,
    id_planta BIGINT NULL,
    id_organismo_huesped BIGINT NULL,
    id_coleccion BIGINT NULL,
    id_cita BIGINT NULL,
    --
    anio_identificacion INT NULL,
    nombre_comun VARCHAR(255) NULL,
    nombre_cientifico VARCHAR(255) NULL,
    fecha_colecta DATE NULL,
    altitud INT NULL,
    datos_ecologicos TEXT NULL,
    num_individuos INT DEFAULT 1,
    envio_identificacion VARCHAR(255) NULL,
    anio_catalogacion INT NULL,
    latitud_n DECIMAL(10, 8) NULL,
    longitud_o DECIMAL(11, 8) NULL,
    numero_frasco VARCHAR(50) NULL,
    status BOOLEAN NOT NULL DEFAULT 1,
    --
    CONSTRAINT fk_esp_especie FOREIGN KEY (id_especie) REFERENCES especie (idEspecie),
    CONSTRAINT fk_esp_localidad FOREIGN KEY (id_localidad) REFERENCES localidad (idLocalidad),
    CONSTRAINT fk_esp_orden FOREIGN KEY (id_orden) REFERENCES orden (idOrden),
    CONSTRAINT fk_esp_familia FOREIGN KEY (id_familia) REFERENCES familia (idFamilia),
    CONSTRAINT fk_esp_subfamilia FOREIGN KEY (id_subfamilia) REFERENCES subfamilia (idSubfamilia),
    CONSTRAINT fk_esp_tribu FOREIGN KEY (id_tribu) REFERENCES tribu (idTribu),
    CONSTRAINT fk_esp_genero FOREIGN KEY (id_genero) REFERENCES genero (idGenero),
    CONSTRAINT fk_esp_tipo FOREIGN KEY (id_tipo) REFERENCES tipo (idTipo),
    CONSTRAINT fk_esp_colector FOREIGN KEY (id_colector) REFERENCES colector (idColector),
    CONSTRAINT fk_esp_determinador FOREIGN KEY (id_determinador) REFERENCES determinador (idDeterminador),
    CONSTRAINT fk_esp_planta FOREIGN KEY (id_planta) REFERENCES planta_hospedera (idPlanta),
    CONSTRAINT fk_esp_organismo_huesped FOREIGN KEY (id_organismo_huesped) REFERENCES organismo_hospedero (idOrganismo),
    CONSTRAINT fk_esp_coleccion FOREIGN KEY (id_coleccion) REFERENCES coleccion (idColeccion),
    CONSTRAINT fk_esp_cita FOREIGN KEY (id_cita) REFERENCES cita (idCita)
);

-- ==============================================================================
-- 6. TABLAS DE MÓDULOS
-- ==============================================================================

CREATE TABLE fototeca (
    id_foto INT AUTO_INCREMENT PRIMARY KEY,
    id_colector bigint NULL,
    id_determinador bigint NULL,
    id_especimen bigint NOT NULL,
    ruta_archivo VARCHAR(255) NOT NULL,
    descripcion_foto VARCHAR(255) NULL,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status BOOLEAN NOT NULL DEFAULT 1,
    CONSTRAINT fk_foto_colector FOREIGN KEY (id_colector) REFERENCES colector (idColector),
    CONSTRAINT fk_foto_determinador FOREIGN KEY (id_determinador) REFERENCES determinador (idDeterminador),
    CONSTRAINT fk_foto_especimen FOREIGN KEY (id_especimen) REFERENCES especimenes (id_especimen)
);

CREATE TABLE prestamo (
    idprestamo BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_especimen BIGINT NOT NULL,
    nombre_cientifico VARCHAR(100) NOT NULL,
    nombre_comun VARCHAR(100) NOT NULL,
    prestatario VARCHAR(100) NOT NULL,
    telefono_prestatario VARCHAR(15),
    correo_prestatario VARCHAR(100),
    institucion_prestatario VARCHAR(150),
    prestamista VARCHAR(100) NOT NULL,
    telefono_prestamista VARCHAR(15),
    correo_prestamista VARCHAR(100),
    institucion_origen VARCHAR(150),
    fecha_prestamo DATE NOT NULL,
    fecha_devolucion_estimada DATE,
    fecha_devolucion_real DATE,
    estado_prestamo VARCHAR(50) DEFAULT 'Activo',
    proposito VARCHAR(250),
    condicion_al_prestar VARCHAR(250),
    observaciones TEXT,
    status BOOLEAN NOT NULL DEFAULT 1,
    CONSTRAINT fk_prestamo_especimen FOREIGN KEY (id_especimen) REFERENCES especimenes (id_especimen)
);

-- ==============================================================================
-- 7. TABLAS DE APROBACIONES
-- ==============================================================================

-- Solicitud de ALTA enviada por un usuario no-admin.
-- Los usuarios no-admin solo pueden pedir el REGISTRO de nuevos especímenes.
-- Una vez aprobada, el admin crea el espécimen en la tabla `especimenes`.
-- Modificar o eliminar especímenes existentes es responsabilidad exclusiva del admin.
--
-- estado: PENDIENTE → el admin aún no la ha revisado
--         REGRESADA → el admin la devolvió con comentarios para corregir
--         APROBADA  → el admin aceptó y creó el espécimen (id_especimen queda registrado)
--         RECHAZADA → el admin rechazó definitivamente la solicitud

CREATE TABLE solicitud_especimen (
    id_solicitud BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT NOT NULL, -- quien envía la solicitud
    id_especimen BIGINT NULL, -- NULL mientras está PENDIENTE/REGRESADA; se llena al APROBAR
    estado ENUM(
        'PENDIENTE',
        'APROBADA',
        'RECHAZADA',
        'REGRESADA'
    ) NOT NULL DEFAULT 'PENDIENTE',
    datos_propuestos JSON NOT NULL, -- campos del espécimen propuesto (completos)
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_sol_usuario FOREIGN KEY (id_usuario) REFERENCES user (idUser),
    CONSTRAINT fk_sol_especimen FOREIGN KEY (id_especimen) REFERENCES especimenes (id_especimen)
);

-- Historial de cada acción del admin sobre una solicitud.
-- Permite múltiples ciclos de "regresar → corregir → reenviar".
-- accion: 'APROBADA' | 'RECHAZADA' | 'REGRESADA'

CREATE TABLE revision_solicitud (
    id_revision BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_solicitud BIGINT NOT NULL, -- solicitud que se revisa
    id_revisor BIGINT NOT NULL, -- admin que toma la acción
    accion ENUM(
        'APROBADA',
        'RECHAZADA',
        'REGRESADA'
    ) NOT NULL,
    comentarios TEXT NULL, -- obligatorio si accion = 'REGRESADA', recomendado si 'RECHAZADA'
    fecha_revision TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rev_solicitud FOREIGN KEY (id_solicitud) REFERENCES solicitud_especimen (id_solicitud),
    CONSTRAINT fk_rev_revisor FOREIGN KEY (id_revisor) REFERENCES user (idUser)
);

-- ==============================================================================

insert into
    profile (
        nickname,
        description,
        key_add,
        key_delete,
        key_edit,
        key_export
    )
values (
        'Administrador',
        'Acceso completo: puede agregar, eliminar, editar y exportar en sus módulos asignados',
        1,
        1,
        1,
        1
    ),
    (
        'Editor',
        'Puede registrar, modificar y exportar, pero NO eliminar registros',
        1,
        0,
        1,
        1
    ),
    (
        'Capturista',
        'Puede registrar, modificar y exportar, pero NO eliminar registros',
        1,
        0,
        0,
        0
    ),
    (
        'Consultor',
        'Solo lectura: puede ver y exportar información, sin modificar',
        0,
        0,
        0,
        1
    ),
    (
        'Sin Acceso',
        'Usuario activo en el sistema pero sin permisos operativos en el módulo',
        0,
        0,
        0,
        0
    );

insert into
    module (
        name,
        description,
        area,
        status
    )
values (
        'Usuarios',
        'Administracion de usuarios',
        'Seguridad',
        1
    ),
    (
        'Perfiles',
        'Administracion de perfiles',
        'Seguridad',
        1
    ),
    (
        'Catalogos',
        'Paises, estados, localidades, plantas, citas',
        'Administrativo',
        1
    ),
    (
        'Aprobaciones',
        'Consulta y aprobracion de solucitudes de datos',
        'Administrativo',
        1
    ),
    (
        'Prestamos',
        'Prestamo de ejemplares',
        'Administrativo',
        1
    ),
    (
        'Registro de Ejemplares',
        'Registro del insecto colectado',
        'Coleccion',
        1
    ),
    (
        'Fototeca',
        'Imagenes del ejemplar',
        'Coleccion',
        1
    ),
    (
        'Reportes',
        'Consultas y exportaciones',
        'Sistema',
        1
    );

-- Contraseña de prueba para todos los seeds siguientes: texto plano "123", almacenada como hash bcrypt (10 rounds, bcryptjs).
insert into
    user (
        name,
        last_name,
        second_last_name,
        email,
        password,
        status
    )
values (
        'Admin',
        '.',
        '.',
        'admin@mail.com',
        '$2b$10$XEWYjJsqYO7.cAMKddJZ8u8WODPIbDmifo6/fTq085W2BcyklZpvq',
        1
    ),
    (
        'Consultor',
        '.',
        '.',
        'consultor@mail.com',
        '$2b$10$XEWYjJsqYO7.cAMKddJZ8u8WODPIbDmifo6/fTq085W2BcyklZpvq',
        1
    ),
    (
        'Miguel',
        'Torres',
        'Rios',
        'miguel.torres@mail.com',
        '$2b$10$XEWYjJsqYO7.cAMKddJZ8u8WODPIbDmifo6/fTq085W2BcyklZpvq',
        1
    ),
    (
        'Ricardo',
        'Dominguez',
        'Cano',
        'ricardo.dominguez@mail.com',
        '$2b$10$XEWYjJsqYO7.cAMKddJZ8u8WODPIbDmifo6/fTq085W2BcyklZpvq',
        0
    );

-- Andrea: Administrador en todos los módulos
INSERT INTO
    permissions (idUser, idModule, idProfile)
SELECT 1, idModule, 1
FROM module;

INSERT INTO
    permissions (idUser, idModule, idProfile)
SELECT 2, idModule, 4
FROM module;

select u.name, m.name as modulo, p.nickname as perfil, p.key_add, p.key_delete, p.key_edit, p.key_export
from
    permissions pe
    join user u on pe.idUser = u.idUser
    join module m on pe.idModule = m.idModule
    join profile p on pe.idProfile = p.idProfile
where
    u.email = 'admin@mail.com';

use UG;