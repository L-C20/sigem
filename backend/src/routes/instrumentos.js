const express = require("express");
const router = express.Router();

const pool = require("../database/connection");

router.get("/", async (req,res)=>{

    try{

        const resultado = await pool.query(
            `
            SELECT *
            FROM instrumentos
            ORDER BY nombre
            `
        );


        res.json(resultado.rows);


    }catch(error){

        console.error(error);

        res.status(500).json({
            error:"Error al obtener instrumentos"
        });

    }

});

router.get("/cursadas", async (req,res)=>{

    try{

        const resultado = await pool.query(
            `
            SELECT
                ci.id,

                a.nombre || ' ' || a.apellido AS alumno,

                ci.instrumento_id,
                i.nombre AS instrumento,

                ci.nivel_instrumento_id,
                ni.nombre AS nivel,

                ci.instructor_id,
                ins.nombre || ' ' || ins.apellido AS instructor,

                ci.estado

            FROM cursada_instrumento ci

            JOIN alumnos a
                ON a.id = ci.alumno_id

            JOIN instrumentos i
                ON i.id = ci.instrumento_id

            JOIN niveles_instrumento ni
                ON ni.id = ci.nivel_instrumento_id

            JOIN instructores ins
                ON ins.id = ci.instructor_id

            WHERE ci.estado = 'Activo'

            ORDER BY
                i.nombre,
                a.apellido;
            `
        );


        res.json(resultado.rows);


    }catch(error){

        console.error(error);

        res.status(500).json({
            error:"Error al obtener instrumentos"
        });

    }

});

router.get("/:id", async (req,res)=>{

    try{

        const { id } = req.params;


        const resultado = await pool.query(
            `
            SELECT *
            FROM cursada_instrumento
            WHERE id = $1
            `,
            [id]
        );


        res.json(resultado.rows[0]);


    }catch(error){

        console.error(error);

        res.status(500).json({
            error:"Error al obtener cursada"
        });

    }

});
router.put("/:id", async (req,res)=>{

    try{

        const { id } = req.params;


        const {
            instrumento_id,
            nivel_instrumento_id,
            instructor_id,
            estado
        } = req.body;



        await pool.query(
            `
            UPDATE cursada_instrumento

            SET
                instrumento_id = $1,
                nivel_instrumento_id = $2,
                instructor_id = $3,
                estado = $4

            WHERE id = $5
            `,
            [
                instrumento_id,
                nivel_instrumento_id,
                instructor_id,
                estado,
                id
            ]
        );



        res.json({
            mensaje:"Instrumento actualizado correctamente"
        });



    }
    catch(error){

        console.error(error);

        res.status(500).json({
            error:"Error actualizando instrumento"
        });

    }

});

module.exports = router;