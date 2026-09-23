-- ===============================================
-- EVALUACIONES DE TEORIA Y SOLFEO
-- ===============================================

-- El instructor crea una evaluacion para todo el curso y
-- despues carga el resultado de cada alumno.

-- Teoria se califica con nota de 1 a 10 (aprobado desde 7).
-- Solfeo con Aprobado / Desaprobado mas observaciones.

-- Las obligatorias son las que habilitan a rendir el examen.


BEGIN;


CREATE TABLE IF NOT EXISTS evaluaciones (

    id             SERIAL PRIMARY KEY,

    nivel_id       INTEGER NOT NULL REFERENCES niveles_teoria(id),
    instructor_id  INTEGER NOT NULL REFERENCES instructores(id),

    anio           INTEGER  NOT NULL,
    cuatrimestre   SMALLINT NOT NULL,

    area           VARCHAR(20) NOT NULL,
    tipo           VARCHAR(30) NOT NULL,

    titulo         VARCHAR(200) NOT NULL,
    descripcion    TEXT,
    fecha          DATE,

    -- Si es obligatoria, hay que aprobarla para rendir
    obligatoria    BOOLEAN NOT NULL DEFAULT TRUE,

    creada         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT evaluaciones_cuatrimestre_valido
        CHECK (cuatrimestre IN (1, 2)),

    CONSTRAINT evaluaciones_area_valida
        CHECK (area IN ('Teoría', 'Solfeo')),

    CONSTRAINT evaluaciones_tipo_valido
        CHECK (tipo IN ('Trabajo práctico', 'Lección', 'Examen'))

);


CREATE INDEX IF NOT EXISTS idx_evaluaciones_nivel
    ON evaluaciones (nivel_id, anio, cuatrimestre);



CREATE TABLE IF NOT EXISTS evaluacion_resultados (

    id             SERIAL PRIMARY KEY,

    evaluacion_id  INTEGER NOT NULL
                   REFERENCES evaluaciones(id) ON DELETE CASCADE,

    alumno_id      INTEGER NOT NULL REFERENCES alumnos(id),

    -- La nota se usa en Teoria
    nota           NUMERIC(4,2),

    -- El resultado se guarda aparte a proposito: si manana
    -- cambia la nota de aprobacion, lo ya corregido no
    -- cambia solo de estado
    resultado      VARCHAR(20),

    observaciones  TEXT,
    ausente        BOOLEAN NOT NULL DEFAULT FALSE,

    cargado_por    INTEGER REFERENCES usuarios(id),
    actualizado    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT evaluacion_resultados_unico
        UNIQUE (evaluacion_id, alumno_id),

    CONSTRAINT evaluacion_resultados_nota_valida
        CHECK (nota IS NULL OR (nota >= 1 AND nota <= 10)),

    CONSTRAINT evaluacion_resultados_resultado_valido
        CHECK (resultado IS NULL
               OR resultado IN ('Aprobado', 'Desaprobado'))

);


CREATE INDEX IF NOT EXISTS idx_evaluacion_resultados_alumno
    ON evaluacion_resultados (alumno_id);


COMMIT;
