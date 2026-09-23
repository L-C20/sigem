-- ===============================================
-- CIERRES Y EXCEPCIONES AL EXAMEN
-- ===============================================

-- La habilitacion al examen NO se guarda: se calcula
-- (toda evaluacion obligatoria aprobada). Lo unico que se
-- guarda es la excepcion, y siempre con motivo y firma.

-- El cierre si se guarda, porque es una decision: el
-- sistema sugiere el promedio y una persona lo confirma.


BEGIN;


CREATE TABLE IF NOT EXISTS excepciones_examen (

    id              SERIAL PRIMARY KEY,

    alumno_id       INTEGER NOT NULL REFERENCES alumnos(id),
    nivel_id        INTEGER NOT NULL REFERENCES niveles_teoria(id),

    anio            INTEGER  NOT NULL,
    cuatrimestre    SMALLINT NOT NULL,

    -- Sin motivo no se puede guardar: una excepcion que no
    -- explica nada no sirve para rendir cuentas despues
    motivo          TEXT NOT NULL,

    autorizado_por  INTEGER NOT NULL REFERENCES usuarios(id),
    autorizado_el   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT excepciones_examen_unica
        UNIQUE (alumno_id, nivel_id, anio, cuatrimestre),

    CONSTRAINT excepciones_examen_cuatrimestre_valido
        CHECK (cuatrimestre IN (1, 2)),

    CONSTRAINT excepciones_examen_motivo_no_vacio
        CHECK (LENGTH(TRIM(motivo)) > 0)

);



CREATE TABLE IF NOT EXISTS cierres (

    id              SERIAL PRIMARY KEY,

    alumno_id       INTEGER NOT NULL REFERENCES alumnos(id),
    nivel_id        INTEGER NOT NULL REFERENCES niveles_teoria(id),

    anio            INTEGER NOT NULL,
    periodo         VARCHAR(20) NOT NULL,

    nota_final      NUMERIC(4,2),
    condicion       VARCHAR(20) NOT NULL,
    observaciones   TEXT,

    cerrado_por     INTEGER REFERENCES usuarios(id),
    cerrado_el      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT cierres_unico
        UNIQUE (alumno_id, nivel_id, anio, periodo),

    CONSTRAINT cierres_periodo_valido
        CHECK (periodo IN ('1er cuatrimestre', '2do cuatrimestre', 'Anual')),

    CONSTRAINT cierres_nota_valida
        CHECK (nota_final IS NULL
               OR (nota_final >= 1 AND nota_final <= 10)),

    CONSTRAINT cierres_condicion_valida
        CHECK (condicion IN ('Promocionado', 'Regular', 'Libre'))

);


CREATE INDEX IF NOT EXISTS idx_cierres_nivel
    ON cierres (nivel_id, anio, periodo);


COMMIT;
