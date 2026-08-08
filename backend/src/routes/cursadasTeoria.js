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


// =====================================
// Obtener cursadas de teoría
// =====================================

router.get("/", async(req,res)=>{


    try{


        const resultado = await pool.query(

            `
            SELECT

                ct.id,

                a.nombre || ' ' || a.apellido AS alumno,

                nt.nombre AS nivel,

                ins.nombre || ' ' || ins.apellido AS instructor,

                ct.estado


            FROM cursadas_teoria ct


            JOIN alumnos a
            ON a.id = ct.alumno_id


            JOIN niveles_teoria nt
            ON nt.id = ct.nivel_id


            JOIN instructores ins
            ON ins.id = ct.instructor_id


            ORDER BY 
                nt.nombre,
                a.apellido;

            `

        );


        res.json(resultado.rows);


    }
    catch(error){


        console.error(error);


        res.status(500).json({

            error:"Error obteniendo teoría"

        });


    }


});

module.exports = router;