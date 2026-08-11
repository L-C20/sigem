const express = require("express");
const router = express.Router();

const pool = require("../database/connection");


// ==========================================
// OBTENER ALUMNOS POR INSTRUMENTO Y NIVEL
// ==========================================

router.get("/instrumento/:instrumento", async (req,res)=>{

    try{

        const { instrumento } = req.params;

        const resultado = await pool.query(

        `

        SELECT

            a.id,

            ci.id AS cursada_id,

            a.nombre,
            a.apellido,

            i.nombre AS instrumento,

            ni.nombre AS nivel_instrumento,

            nt.nombre AS nivel_teoria,

            ins.nombre || ' ' || ins.apellido AS instructor


        FROM alumnos a

        INNER JOIN cursada_instrumento ci
            ON ci.alumno_id = a.id

        INNER JOIN instrumentos i
            ON i.id = ci.instrumento_id

        INNER JOIN niveles_instrumento ni
            ON ni.id = ci.nivel_instrumento_id

        INNER JOIN instructores ins
            ON ins.id = ci.instructor_id

        LEFT JOIN cursadas_teoria ct
            ON ct.alumno_id = a.id
            AND ct.estado = 'Activo'

        LEFT JOIN niveles_teoria nt
            ON nt.id = ct.nivel_id

        WHERE
            LOWER(i.nombre) = LOWER($1)

        AND
            ci.estado = 'Activo'

        ORDER BY
            a.apellido ASC,
            a.nombre ASC

        `,

        [
            instrumento
        ]

        );

        res.json(resultado.rows);

    }
    catch(error){

        console.error(
            "ERROR ASISTENCIAS:",
            error
        );

        res.status(500).json({
            error:error.message
        });

    }

});





// ==========================================
// GUARDAR / ACTUALIZAR ASISTENCIA INSTRUMENTO
// ==========================================

router.post("/instrumento", async (req, res) => {

    try {

        const {
            alumno_id,
            cursada_instrumento_id,
            fecha,
            presente
        } = req.body;


        const resultado = await pool.query(`

            INSERT INTO asistencias_instrumento
            (
                alumno_id,
                cursada_instrumento_id,
                fecha,
                presente
            )

            VALUES
            ($1, $2, $3, $4)

            ON CONFLICT (
                alumno_id,
                cursada_instrumento_id,
                fecha
            )

            DO UPDATE SET
                presente = EXCLUDED.presente

            RETURNING *

        `, [

            alumno_id,
            cursada_instrumento_id,
            fecha,
            presente

        ]);


        res.json(resultado.rows[0]);


    } catch (error) {

        console.error(
            "ERROR GUARDANDO ASISTENCIA INSTRUMENTO:",
            error
        );

        res.status(500).json({
            error: "Error guardando asistencia de instrumento"
        });

    }

});
// ==========================================
// OBTENER ALUMNOS POR NIVEL DE TEORÍA
// ==========================================

router.get("/teoria/:nivel", async (req,res)=>{

    try{

        const { nivel } = req.params;

        const resultado = await pool.query(

        `
        SELECT

            a.id,
            a.nombre,
            a.apellido,

            ct.id AS cursada_id,

            nt.nombre AS nivel,

            ins.nombre || ' ' || ins.apellido AS instructor

        FROM alumnos a

        INNER JOIN cursadas_teoria ct
            ON ct.alumno_id = a.id

        INNER JOIN niveles_teoria nt
            ON nt.id = ct.nivel_id

        INNER JOIN instructores ins
            ON ins.id = ct.instructor_id

        WHERE
            LOWER(nt.nombre) = LOWER($1)

        AND
            ct.estado = 'Activo'

        ORDER BY
            a.apellido,
            a.nombre
        `,

        [nivel]

        );

        res.json(resultado.rows);

    }
    catch(error){

        console.error(error);

        res.status(500).json({
            error:error.message
        });

    }

});
// ==========================================
// OBTENER INSTRUCTORES
// ==========================================

// ==========================================
// OBTENER INSTRUCTORES PARA FILTROS
// ==========================================

router.get("/instructores", async (req, res) => {

    try {

        const { tipo } = req.query;

        let consulta = `
            SELECT
                i.id,
                i.nombre,
                i.apellido,
                i.telefono,
                i.estado,
                i.ensena_teoria,
                i.instrumento_id,
                inst.nombre AS instrumento

            FROM instructores i

            LEFT JOIN instrumentos inst
                ON inst.id = i.instrumento_id

            WHERE i.estado = 'Activo'
        `;


        // ======================================
        // INSTRUCTORES DE INSTRUMENTO
        // ======================================

        if (tipo === "instrumento") {

            consulta += `
                AND i.instrumento_id IS NOT NULL
            `;

        }


        // ======================================
        // INSTRUCTORES DE TEORÍA
        // ======================================

        if (tipo === "teoria") {

            consulta += `
                AND i.ensena_teoria = TRUE
            `;

        }


        consulta += `
            ORDER BY
                i.apellido ASC,
                i.nombre ASC
        `;


        const resultado =
            await pool.query(consulta);


        res.json(resultado.rows);

    }
    catch (error) {

        console.error(
            "ERROR OBTENIENDO INSTRUCTORES:",
            error
        );

        res.status(500).json({
            error: error.message
        });

    }

});
// GUARDAR ASISTENCIA INSTRUCTOR
// ==========================================

router.post("/instructores", async (req, res) => {

    try {

        const {
            instructor_id,
            fecha,
            presente
        } = req.body;

        const resultado = await pool.query(`

            INSERT INTO asistencias_instructores
            (
                instructor_id,
                fecha,
                presente
            )

            VALUES
            ($1, $2, $3)

            ON CONFLICT (instructor_id, fecha)
            DO UPDATE SET
                presente = EXCLUDED.presente

            RETURNING *

        `, [

            instructor_id,
            fecha,
            presente

        ]);

        res.json(resultado.rows[0]);

    } catch (error) {

        console.error(
            "ERROR GUARDANDO ASISTENCIA INSTRUCTOR:",
            error
        );

        res.status(500).json({
            error: "Error guardando asistencia del instructor"
        });

    }

});

// ==========================================
// EDITAR ASISTENCIA DE INSTRUCTOR
// ==========================================

router.put("/instructores/:id", async (req, res) => {

    try {

        const { id } = req.params;
        const { presente } = req.body;

        const resultado = await pool.query(`

            UPDATE asistencias_instructores

            SET presente = $1

            WHERE id = $2

            RETURNING *

        `, [
            presente,
            id
        ]);


        if (resultado.rows.length === 0) {

            return res.status(404).json({
                error: "Asistencia no encontrada"
            });

        }


        res.json(
            resultado.rows[0]
        );

    }
    catch (error) {

        console.error(
            "ERROR EDITANDO ASISTENCIA INSTRUCTOR:",
            error
        );

        res.status(500).json({
            error: "Error modificando la asistencia"
        });

    }

});

// ==========================================
// GUARDAR / ACTUALIZAR ASISTENCIA TEORÍA
// ==========================================

router.post("/teoria", async(req,res)=>{

    try{

        const {

            alumno_id,
            cursada_teoria_id,
            fecha,
            presente

        } = req.body;


        const resultado = await pool.query(

        `
        INSERT INTO asistencias_teoria
        (
            alumno_id,
            cursada_teoria_id,
            fecha,
            presente
        )

        VALUES
        ($1,$2,$3,$4)

        ON CONFLICT
        (
            alumno_id,
            cursada_teoria_id,
            fecha
        )

        DO UPDATE SET
            presente = EXCLUDED.presente

        RETURNING *

        `,

        [

            alumno_id,
            cursada_teoria_id,
            fecha,
            presente

        ]

        );


        res.json(
            resultado.rows[0]
        );


    }
    catch(error){

        console.error(
            "ERROR GUARDANDO ASISTENCIA TEORÍA:",
            error
        );

        res.status(500).json({

            error:
                "Error guardando asistencia de teoría"

        });

    }

});
// ==========================================
// HISTORIAL DE ASISTENCIA - INSTRUMENTO
// ==========================================

router.get("/historial/instrumento", async (req, res) => {

    try {

        const resultado = await pool.query(`

            SELECT

    ai.id,
    ai.fecha,
    ai.presente,

    a.id AS alumno_id,
    a.nombre AS alumno_nombre,
    a.apellido AS alumno_apellido,

    i.nombre AS instrumento,

    ni.nombre AS nivel,

    ins.id AS instructor_id,
    ins.nombre AS instructor_nombre,
    ins.apellido AS instructor_apellido
            FROM asistencias_instrumento ai

            INNER JOIN alumnos a
                ON a.id = ai.alumno_id

            INNER JOIN cursada_instrumento ci
                ON ci.id = ai.cursada_instrumento_id

            INNER JOIN instrumentos i
                ON i.id = ci.instrumento_id

            INNER JOIN niveles_instrumento ni
                ON ni.id = ci.nivel_instrumento_id

            LEFT JOIN instructores ins
                ON ins.id = ci.instructor_id

            ORDER BY
                ai.fecha DESC,
                a.apellido ASC,
                a.nombre ASC

        `);


        res.json(resultado.rows);


    } catch (error) {

        console.error(
            "ERROR HISTORIAL INSTRUMENTO:",
            error
        );

        res.status(500).json({
            error: "Error obteniendo historial de instrumento"
        });

    }

});


// ==========================================
// HISTORIAL DE ASISTENCIA - TEORÍA
// ==========================================

router.get("/historial/teoria", async (req, res) => {

    try {

        const resultado = await pool.query(`

            SELECT

                at.id,
                at.fecha,
                at.presente,

                a.id AS alumno_id,
                a.nombre AS alumno_nombre,
                a.apellido AS alumno_apellido,

                nt.nombre AS nivel,

                ins.id AS instructor_id,
ins.nombre AS instructor_nombre,
ins.apellido AS instructor_apellido

            FROM asistencias_teoria at

            INNER JOIN alumnos a
                ON a.id = at.alumno_id

            INNER JOIN cursadas_teoria ct
                ON ct.id = at.cursada_teoria_id

            INNER JOIN niveles_teoria nt
                ON nt.id = ct.nivel_id

            LEFT JOIN instructores ins
                ON ins.id = ct.instructor_id

            ORDER BY
                at.fecha DESC,
                a.apellido ASC,
                a.nombre ASC

        `);


        res.json(resultado.rows);


    } catch (error) {

        console.error(
            "ERROR HISTORIAL TEORIA:",
            error
        );

        res.status(500).json({
            error: "Error obteniendo historial de teoría"
        });

    }

});


// ==========================================
// HISTORIAL DE ASISTENCIA - INSTRUCTORES
// ==========================================

router.get("/historial/instructores", async (req, res) => {

    try {

        const resultado = await pool.query(`

            SELECT

                ai.id,
                ai.fecha,
                ai.presente,

                i.id AS instructor_id,
                i.nombre AS instructor_nombre,
                i.apellido AS instructor_apellido,
                i.telefono

            FROM asistencias_instructores ai

            INNER JOIN instructores i
                ON i.id = ai.instructor_id

            ORDER BY
                ai.fecha DESC,
                i.apellido ASC,
                i.nombre ASC

        `);


        res.json(resultado.rows);


    } catch (error) {

        console.error(
            "ERROR HISTORIAL INSTRUCTORES:",
            error
        );

        res.status(500).json({
            error: "Error obteniendo historial de instructores"
        });

    }

});

module.exports = router;
