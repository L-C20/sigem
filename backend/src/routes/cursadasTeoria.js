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
            estado,
            recursante

        } = req.body;


        // Marca manual: la pone una persona en la ficha cuando el alumno
        // ya curso este nivel antes de que estuviera cargado en SIGEM.
        const esRecursante = Boolean(recursante);




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

                    anio = $3,

                    recursante = $4


                WHERE id = $5


                RETURNING *


                `,


                [

                    nivel_id,

                    instructor_id,

                    anio,

                    esRecursante,

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

                estado,

                recursante

            )


            VALUES

            ($1,$2,$3,$4,$5,$6)


            RETURNING *

            `,


            [

                alumno_id,

                nivel_id,

                instructor_id,

                anio,

                estado,

                esRecursante

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

// =====================================
// Finalizar teoría de un alumno
// =====================================

router.put("/finalizar/:alumno_id", async (req, res) => {

    try {

        const { alumno_id } = req.params;

        const resultado = await pool.query(

            `
            UPDATE cursadas_teoria

            SET estado = 'Finalizado'

            WHERE alumno_id = $1
            AND estado = 'Activo'

            RETURNING *
            `,

            [alumno_id]

        );


        if (resultado.rows.length === 0) {

            return res.status(404).json({

                error: "El alumno no tiene teoría activa"

            });

        }


        res.json(resultado.rows[0]);

    }
    catch (error) {

        console.error(error);

        res.status(500).json({

            error: "Error al finalizar teoría"

        });

    }

});

module.exports = router;