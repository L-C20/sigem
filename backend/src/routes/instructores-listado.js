const express = require("express");
const router = express.Router();

const pool = require("../database/connection");

router.get("/", async (req, res) => {

    try {

        const resultado = await pool.query(`

            SELECT

                i.id,

                i.apellido,
                i.nombre,
                i.telefono,

                ins.nombre AS instrumento

            FROM instructores i

            LEFT JOIN instrumentos ins
                ON ins.id = i.instrumento_id

            ORDER BY
                i.apellido,
                i.nombre

        `);

        res.json(resultado.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Error obteniendo instructores"
        });

    }

});

module.exports = router;