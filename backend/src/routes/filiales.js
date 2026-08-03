const express = require("express");
const router = express.Router();

const pool = require("../database/connection");

// Obtener todas las filiales
router.get("/", async (req, res) => {
    try {
        const resultado = await pool.query(
            "SELECT id, nombre FROM filiales ORDER BY nombre"
        );

        res.json(resultado.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al obtener las filiales"
        });
    }
});

module.exports = router;

// Crear filial
router.post("/", async (req, res) => {

    try {

        const { nombre } = req.body;

        const resultado = await pool.query(
            `
            INSERT INTO filiales(nombre)
            VALUES($1)
            RETURNING *
            `,
            [nombre]
        );

        res.status(201).json(resultado.rows[0]);

    } catch(error){

        console.error(error);

        res.status(500).json({
            error:"Error al crear filial"
        });

    }

});