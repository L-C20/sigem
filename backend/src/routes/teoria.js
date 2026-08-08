const express = require("express");
const router = express.Router();

const pool = require("../database/connection");


// Obtener alumnos de teoría y solfeo

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


        LEFT JOIN instructores ins
        ON ins.id = ct.instructor_id


        ORDER BY a.apellido;

        `);


        res.json(resultado.rows);



    }
    catch(error){


        console.error(error);


        res.status(500).json({

            error:"Error al obtener teoría"

        });


    }


});

router.get("/:id", async(req,res)=>{

    try{

        const { id } = req.params;


        const resultado =
        await pool.query(

        `
        SELECT *
        FROM cursadas_teoria
        WHERE id = $1
        `,

        [id]

        );


        res.json(resultado.rows[0]);


    }
    catch(error){

        console.error(error);

        res.status(500).json({
            error:"Error obteniendo teoría"
        });

    }

});



router.put("/:id", async(req,res)=>{


    try{


        const { id } = req.params;


        const {
            nivel_id,
            instructor_id,
            estado

        } = req.body;



        await pool.query(

        `
        UPDATE cursadas_teoria

        SET

            nivel_id = $1,
            instructor_id = $2,
            estado = $3

        WHERE id = $4

        `,

        [

            nivel_id,
            instructor_id,
            estado,
            id

        ]);


        res.json({

            mensaje:
            "Teoría actualizada correctamente"

        });



    }
    catch(error){


        console.error(error);


        res.status(500).json({

            error:
            "Error actualizando teoría"

        });


    }


});

module.exports = router;