const express = require("express");
const router = express.Router();

const pool = require("../database/connection");

// =====================================
// OBTENER INSTRUCTORES
// =====================================

router.get("/", async (req, res) => {

    try {

        const { tipo } = req.query;


        let consulta = `

            SELECT

                i.id,
                i.apellido,
                i.nombre,
                i.telefono,
                i.estado,
                i.ensena_teoria,

                STRING_AGG(
                    DISTINCT inst.nombre,
                    ', '
                    ORDER BY inst.nombre
                ) AS instrumento

            FROM instructores i

            LEFT JOIN instructor_instrumentos ii
                ON ii.instructor_id = i.id

            LEFT JOIN instrumentos inst
                ON inst.id = ii.instrumento_id

            WHERE
                i.estado = 'Activo'

        `;


        // =====================================
        // SOLO INSTRUCTORES DE INSTRUMENTO
        // =====================================

        if (tipo === "instrumento") {

            consulta += `

                AND EXISTS (

                    SELECT 1

                    FROM instructor_instrumentos ii2

                    WHERE ii2.instructor_id = i.id

                )

            `;

        }


        // =====================================
        // SOLO INSTRUCTORES DE TEORÍA
        // =====================================

        if (tipo === "teoria") {

            consulta += `

                AND i.ensena_teoria = TRUE

            `;

        }


        consulta += `

            GROUP BY
                i.id,
                i.apellido,
                i.nombre,
                i.telefono,
                i.estado,
                i.ensena_teoria

            ORDER BY
                i.apellido,
                i.nombre

        `;


        const resultado =
            await pool.query(consulta);


        res.json(resultado.rows);


    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Error al obtener instructores"
        });

    }

});
// =====================================
// OBTENER INSTRUCTORES DE UN INSTRUMENTO
// =====================================

router.get("/instrumento/:instrumento_id", async (req, res) => {

    try {

        const { instrumento_id } = req.params;

        const resultado = await pool.query(`

            SELECT

                i.id,
                i.apellido,
                i.nombre

            FROM instructores i

            INNER JOIN instructor_instrumentos ii
                ON ii.instructor_id = i.id

            WHERE ii.instrumento_id = $1

            AND i.estado = 'Activo'

            ORDER BY
                i.apellido,
                i.nombre

        `, [instrumento_id]);

        res.json(resultado.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Error al obtener instructores"
        });

    }

});


// =====================================
// OBTENER INSTRUCTORES DE TEORÍA
// =====================================

router.get("/teoria", async (req, res) => {

    try {

        const resultado = await pool.query(`

            SELECT

                id,
                apellido,
                nombre

            FROM instructores

            WHERE ensena_teoria = TRUE

            AND estado = 'Activo'

            ORDER BY
                apellido,
                nombre

        `);

        res.json(resultado.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Error al obtener instructores"
        });

    }

});


module.exports = router;