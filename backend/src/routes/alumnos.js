const express = require("express");
const router = express.Router();

const pool = require("../database/connection");


// =======================
// Obtener todos los alumnos
// =======================

router.get("/", async (req, res) => {
    try {

        const resultado = await pool.query(`

SELECT

    a.id,
    a.dni,
    a.nombre,
    a.apellido,
    a.telefono,
    a.telefono_tutor,
    a.filial_id,

    f.nombre AS filial_nombre,


    -- ==========================
    -- INSTRUMENTO ACTIVO
    -- ==========================

    ci.instrumento_id,

    ci.nivel_instrumento_id,

    ci.instructor_id AS instructor_instrumento_id,

    i.nombre AS instrumento,

    ni.nombre AS nivel_instrumento,

    instr.nombre AS instructor_instrumento,


    -- ==========================
    -- TEORÍA ACTIVA
    -- ==========================

    ct.nivel_id AS nivel_teoria_id,

    ct.instructor_id AS instructor_teoria_id,

    nt.nombre AS nivel_teoria,

    instr_t.nombre AS instructor_teoria


FROM alumnos a


-- ==========================
-- FILIAL
-- ==========================

LEFT JOIN filiales f
    ON a.filial_id = f.id


-- ==========================
-- INSTRUMENTO ACTIVO
-- ==========================

LEFT JOIN LATERAL (

    SELECT *

    FROM cursada_instrumento

    WHERE alumno_id = a.id

    AND estado = 'Activo'

    ORDER BY id DESC

    LIMIT 1

) ci ON true


LEFT JOIN instrumentos i
    ON ci.instrumento_id = i.id


LEFT JOIN niveles_instrumento ni
    ON ci.nivel_instrumento_id = ni.id


LEFT JOIN instructores instr
    ON ci.instructor_id = instr.id


-- ==========================
-- TEORÍA ACTIVA
-- ==========================

LEFT JOIN LATERAL (

    SELECT *

    FROM cursadas_teoria

    WHERE alumno_id = a.id

    AND estado = 'Activo'

    ORDER BY id DESC

    LIMIT 1

) ct ON true


LEFT JOIN niveles_teoria nt
    ON ct.nivel_id = nt.id


LEFT JOIN instructores instr_t
    ON ct.instructor_id = instr_t.id


ORDER BY
    a.apellido,
    a.nombre

`);


        res.json(resultado.rows);


    } catch (error) {

        console.error(error);


        res.status(500).json({

            error:"Error al obtener alumnos"

        });

    }
});

// =======================
// Obtener alumno por ID
// =======================

router.get("/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const resultado = await pool.query(
`
SELECT

    a.id,
    a.dni,
    a.nombre,
    a.apellido,
    a.fecha_nacimiento,
    a.telefono,
    a.telefono_tutor,
    a.correo,
    a.filial_id,
    a.iglesia,
    a.anciano_autoriza,
    a.observaciones,

    f.nombre AS filial_nombre,

    -- ==========================
    -- INSTRUMENTO
    -- ==========================

    ci.instrumento_id,
    ci.nivel_instrumento_id,
    ci.instructor_id AS instructor_instrumento_id,

    i.nombre AS instrumento,

    ni.nombre AS nivel_instrumento,


    -- ==========================
    -- TEORÍA Y SOLFEO
    -- ==========================

    ct.nivel_id AS nivel_teoria_id,
    ct.instructor_id AS instructor_teoria_id,

    nt.nombre AS nivel_teoria


FROM alumnos a


-- ==========================
-- FILIAL
-- ==========================

LEFT JOIN filiales f
    ON a.filial_id = f.id


-- ==========================
-- INSTRUMENTO ACTIVO
-- ==========================

LEFT JOIN LATERAL (

    SELECT *

    FROM cursada_instrumento

    WHERE alumno_id = a.id
    AND estado = 'Activo'

    ORDER BY id DESC

    LIMIT 1

) ci ON true


LEFT JOIN instrumentos i
    ON ci.instrumento_id = i.id


LEFT JOIN niveles_instrumento ni
    ON ci.nivel_instrumento_id = ni.id


-- ==========================
-- TEORÍA ACTIVA
-- ==========================

LEFT JOIN LATERAL (

    SELECT *

    FROM cursadas_teoria

    WHERE alumno_id = a.id
    AND estado = 'Activo'

    ORDER BY id DESC

    LIMIT 1

) ct ON true


LEFT JOIN niveles_teoria nt
    ON ct.nivel_id = nt.id


WHERE a.id = $1
`,
        [id]
        );


        if (resultado.rows.length === 0) {

            return res.status(404).json({
                error: "Alumno no encontrado"
            });

        }


        res.json(resultado.rows[0]);


    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Error al obtener alumno"
        });

    }

});
// =======================
// Crear alumno
// =======================

router.post("/", async (req, res) => {

    try {

        const {
            dni,
            nombre,
            apellido,
            telefono,
            telefono_tutor,
            filial_id,
            fecha_nacimiento,
        } = req.body;


        const resultado = await pool.query(
            `
            INSERT INTO alumnos
            (
                dni,
                nombre,
                apellido,
                telefono,
                telefono_tutor,
                filial_id,
                fecha_nacimiento
            )
            VALUES ($1,$2,$3,$4,$5,$6)
            RETURNING *
            `,
            [
                dni,
                nombre,
                apellido,
                telefono,
                telefono_tutor,
                filial_id,
                fecha_nacimiento
            ]
        );


        res.status(201).json(resultado.rows[0]);


    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Error al crear alumno"
        });

    }

});

// =======================
// Editar alumno
// =======================

router.put("/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const {
            dni,
            nombre,
            apellido,
            telefono,
            telefono_tutor,
            correo,
            filial_id,
            iglesia,
            anciano_autoriza,
            observaciones,
            fecha_nacimiento
        } = req.body;

        const resultado = await pool.query(
            `
            UPDATE alumnos

            SET
                dni = $1,
                nombre = $2,
                apellido = $3,
                telefono = $4,
                telefono_tutor = $5,
                correo = $6,
                filial_id = $7,
                iglesia = $8,
                anciano_autoriza = $9,
                observaciones = $10,
                fecha_nacimiento = $11

            WHERE id = $12

            RETURNING *
            `,
            [
                dni,
                nombre,
                apellido,
                telefono,
                telefono_tutor,
                correo,
                filial_id,
                iglesia,
                anciano_autoriza,
                observaciones,
                fecha_nacimiento,
                id
            ]
        );


        if (resultado.rows.length === 0) {

            return res.status(404).json({
                error: "Alumno no encontrado"
            });

        }


        res.json(resultado.rows[0]);


   } catch (error) {

    console.error("ERROR ACTUALIZANDO ALUMNO:", error);

    res.status(500).json({
        error: error.message
    });

}

});
module.exports = router;