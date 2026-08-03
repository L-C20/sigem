const express = require("express");
const router = express.Router();

const pool = require("../database/connection");

// Obtener todos los instructores
router.get("/", async (req, res) => {

    try {

        const resultado = await pool.query(`
            SELECT
                id,
                apellido,
                nombre,
                telefono,
                estado,
                ensena_teoria
            FROM instructores
            ORDER BY apellido, nombre
        `);

        res.json(resultado.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Error al obtener instructores"
        });

    }

});
// Obtener instructores de un instrumento
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
            ORDER BY i.apellido, i.nombre
        `, [instrumento_id]);

        res.json(resultado.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Error al obtener instructores"
        });

    }

});
// Obtener instructores de Teoría y Solfeo
router.get("/teoria", async (req, res) => {

    try {

        const resultado = await pool.query(`
            SELECT
                id,
                apellido,
                nombre
            FROM instructores
            WHERE ensena_teoria = TRUE
            ORDER BY apellido, nombre
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