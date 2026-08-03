CREATE TABLE filiales (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);


CREATE TABLE instrumentos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);


CREATE TABLE niveles_instrumento (
    id SERIAL PRIMARY KEY,
    instrumento_id INTEGER NOT NULL,
    nombre VARCHAR(100) NOT NULL,

    FOREIGN KEY (instrumento_id)
    REFERENCES instrumentos(id)
);


CREATE TABLE instructores (
    id SERIAL PRIMARY KEY,
    dni VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(30),
    instrumento_id INTEGER NOT NULL,

    FOREIGN KEY (instrumento_id)
    REFERENCES instrumentos(id)
);

CREATE TABLE alumnos (
    id SERIAL PRIMARY KEY,
    dni VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(30),
    telefono_tutor VARCHAR(30),
    filial_id INTEGER NOT NULL,

    FOREIGN KEY (filial_id)
    REFERENCES filiales(id)
);
CREATE TABLE cursadas_instrumento (
    id SERIAL PRIMARY KEY,
    alumno_id INTEGER NOT NULL,
    nivel_instrumento_id INTEGER NOT NULL,
    instructor_id INTEGER NOT NULL,
    anio INTEGER NOT NULL,
    estado VARCHAR(20) DEFAULT 'activo',

    FOREIGN KEY (alumno_id)
    REFERENCES alumnos(id),

    FOREIGN KEY (nivel_instrumento_id)
    REFERENCES niveles_instrumento(id),

    FOREIGN KEY (instructor_id)
    REFERENCES instructores(id)
);

CREATE TABLE niveles_teoria (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    instructor_id INTEGER NOT NULL,

    FOREIGN KEY (instructor_id)
    REFERENCES instructores(id)
);
CREATE TABLE niveles_teoria (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    instructor_id INTEGER NOT NULL,

    FOREIGN KEY (instructor_id)
    REFERENCES instructores(id)
);
CREATE TABLE cursadas_teoria (
    id SERIAL PRIMARY KEY,
    alumno_id INTEGER NOT NULL,
    nivel_teoria_id INTEGER NOT NULL,
    anio INTEGER NOT NULL,
    estado VARCHAR(20) DEFAULT 'activo',

    FOREIGN KEY (alumno_id)
    REFERENCES alumnos(id),

    FOREIGN KEY (nivel_teoria_id)
    REFERENCES niveles_teoria(id)
);