const express = require("express");
const router = express.Router();

const pool = require("../database/connection");



// =====================================
// Crear o actualizar instrumento activo
// =====================================

router.post("/", async(req,res)=>{

    try{


        const {
            alumno_id,
            instrumento_id,
            nivel_instrumento_id,
            instructor_id,
            anio,
            estado
        } = req.body;



        // Buscar si ya tiene instrumento activo

        const existe = await pool.query(

            `
            SELECT id
            FROM cursada_instrumento
            WHERE alumno_id = $1
            AND estado = 'Activo'
            `,
            [
                alumno_id
            ]

        );




        if(existe.rows.length > 0){


            // Actualizar

            const actualizado = await pool.query(

                `
                UPDATE cursada_instrumento

                SET

                    instrumento_id = $1,
                    nivel_instrumento_id = $2,
                    instructor_id = $3,
                    anio = $4

                WHERE id = $5

                RETURNING *

                `,

                [
                    instrumento_id,
                    nivel_instrumento_id,
                    instructor_id,
                    anio,
                    existe.rows[0].id
                ]

            );


            return res.json(
                actualizado.rows[0]
            );

        }




        // Si no existe, crea

        const creado = await pool.query(

            `
            INSERT INTO cursada_instrumento

            (
                alumno_id,
                instrumento_id,
                nivel_instrumento_id,
                instructor_id,
                anio,
                estado
            )

            VALUES
            ($1,$2,$3,$4,$5,$6)

            RETURNING *

            `,

            [
                alumno_id,
                instrumento_id,
                nivel_instrumento_id,
                instructor_id,
                anio,
                estado
            ]

        );


        res.status(201).json(
            creado.rows[0]
        );



    }
    catch(error){


        console.error(error);


        res.status(500).json({

            error:"Error guardando instrumento"

        });


    }


});

// =====================================
// Finalizar instrumento de un alumno
// =====================================

router.put("/finalizar/:alumno_id", async (req, res) => {

    try {

        const { alumno_id } = req.params;

        const resultado = await pool.query(

            `
            UPDATE cursada_instrumento

            SET estado = 'Finalizado'

            WHERE alumno_id = $1
            AND estado = 'Activo'

            RETURNING *
            `,

            [alumno_id]

        );


        if (resultado.rows.length === 0) {

            return res.status(404).json({

                error: "El alumno no tiene un instrumento activo"

            });

        }


        res.json(resultado.rows[0]);


    }
    catch (error) {

        console.error(error);

        res.status(500).json({

            error: "Error al finalizar instrumento"

        });

    }

});

module.exports = router;