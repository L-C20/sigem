BEGIN;

-- Vinculo entre la cuenta y el instructor que ensena
ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS instructor_id INTEGER
    REFERENCES instructores(id);

-- Que nivel de teoria tiene a cargo cada instructor
CREATE TABLE IF NOT EXISTS instructor_niveles_teoria (
    id             SERIAL PRIMARY KEY,
    instructor_id  INTEGER NOT NULL REFERENCES instructores(id),
    nivel_id       INTEGER NOT NULL REFERENCES niveles_teoria(id),
    anio           INTEGER NOT NULL,
    UNIQUE (instructor_id, nivel_id, anio)
);

-- Se siembra desde las cursadas que ya existen
INSERT INTO instructor_niveles_teoria (instructor_id, nivel_id, anio)
SELECT DISTINCT c.instructor_id, c.nivel_id, c.anio
FROM cursadas_teoria c
WHERE c.estado = 'Activo'
  AND c.instructor_id IS NOT NULL
ON CONFLICT DO NOTHING;

COMMIT;


-- Roles de las cuentas conocidas
BEGIN;

-- Lucas: gobierna las cuentas, no da clases
UPDATE usuarios
SET rol = 'superadmin', instructor_id = NULL
WHERE email = 'lucaslobianco78@gmail.com';

-- Cesia: administra y ademas tiene el Nivel 3
UPDATE usuarios
SET rol = 'admin', instructor_id = 26
WHERE email = 'profecesiamusica@gmail.com';

COMMIT;


-- Administradores de gestion y secretaria
BEGIN;

-- Administradores de gestion (no dan clases)
UPDATE usuarios SET rol = 'admin'
WHERE id IN (11, 13);

-- Secretaria: carga y edita alumnos, no ve notas
UPDATE usuarios SET rol = 'secretaria'
WHERE id = 12;

COMMIT;
