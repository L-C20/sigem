const express = require("express");
const router = express.Router();

const pool = require("../database/connection");



// =====================================
// Crear o actualizar teoría activa
// =====================================

router.post("/", async(req,res)=>{


    try{


        const {

            alumno_id,
            nivel_id,
            instructor_id,
            anio,
            estado

        } = req.body;




        // Buscar teoría activa existente

        const existe = await pool.query(

            `
            SELECT id

            FROM cursadas_teoria

            WHERE alumno_id = $1

            AND estado = 'Activo'

            `,

            [
                alumno_id
            ]

        );





        if(existe.rows.length > 0){



            const actualizado = await pool.query(

                `

                UPDATE cursadas_teoria

                SET

                    nivel_id = $1,

                    instructor_id = $2,

                    anio = $3


                WHERE id = $4


                RETURNING *


                `,


                [

                    nivel_id,

                    instructor_id,

                    anio,

                    existe.rows[0].id

                ]

            );



            return res.json(
                actualizado.rows[0]
            );


        }





        // Si no existe crea

        const creado = await pool.query(


            `

            INSERT INTO cursadas_teoria

            (

                alumno_id,

                nivel_id,

                instructor_id,

                anio,

                estado

            )


            VALUES

            ($1,$2,$3,$4,$5)


            RETURNING *

            `,


            [

                alumno_id,

                nivel_id,

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

            error:"Error guardando teoría"

        });


    }



});




module.exports = router;