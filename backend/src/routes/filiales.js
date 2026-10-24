const express = require("express");
const router = express.Router();

const pool = require("../database/connection");


const LARGO_MAXIMO = 100;


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


// Crear iglesia
//
// Si ya hay una con el mismo nombre —sin distinguir mayúsculas ni espacios
// de más— se devuelve esa en lugar de crear una segunda. La tabla no tiene
// unicidad en el nombre, así que sin esto dos personas cargando alumnos la
// misma semana terminan con "Dorrego" dos veces y los alumnos repartidos
// entre las dos, que después no hay forma de juntar sin revisar a mano.
router.post("/", async (req, res) => {

    try {

        const nombre =
            String(req.body.nombre || "").trim();


        if (!nombre) {

            return res.status(400).json({
                error: "El nombre de la iglesia es obligatorio"
            });

        }


        if (nombre.length > LARGO_MAXIMO) {

            return res.status(400).json({
                error: `El nombre no puede tener más de ${LARGO_MAXIMO} caracteres`
            });

        }


        const existente = await pool.query(
            `
            SELECT id, nombre
            FROM filiales
            WHERE lower(btrim(nombre)) = lower($1)
            `,
            [nombre]
        );


        if (existente.rows.length > 0) {

            return res.status(200).json({
                ...existente.rows[0],
                yaExistia: true
            });

        }


        const resultado = await pool.query(
            `
            INSERT INTO filiales(nombre)
            VALUES($1)
            RETURNING id, nombre
            `,
            [nombre]
        );


        res.status(201).json(resultado.rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Error al crear la iglesia"
        });

    }

});


module.exports = router;
