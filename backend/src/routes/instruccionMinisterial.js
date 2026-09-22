const express = require("express");
const router = express.Router();

const pool = require("../database/connection");


// Listado de alumnos en instrucción ministerial

router.get("/", async (req,res)=>{

    try{

        const resultado = await pool.query(

        `
        SELECT

            im.id,

            im.alumno_id,

            a.nombre || ' ' || a.apellido AS alumno,

            f.nombre AS filial,

            im.fecha_inicio,

            im.estado


        FROM instruccion_ministerial im


        JOIN alumnos a
        ON a.id = im.alumno_id


        LEFT JOIN filiales f
        ON f.id = a.filial_id


        WHERE im.estado = 'Activo'


        ORDER BY a.apellido, a.nombre;

        `);


        res.json(resultado.rows);


    }catch(error){

        console.error(error);

        res.status(500).json({
            error:"Error obteniendo listado de instrucción ministerial"
        });

    }

});




// Obtener instrucción ministerial de un alumno

router.get("/:alumno_id", async (req,res)=>{

    try{

        const { alumno_id } = req.params;


        const resultado = await pool.query(

        `
        SELECT *
        FROM instruccion_ministerial
        WHERE alumno_id = $1
        `,

        [alumno_id]

        );


        if(resultado.rows.length === 0){

            return res.json(null);

        }


        console.log(resultado.rows[0]);
        res.json(resultado.rows[0]);


    }catch(error){

        console.error(error);

        res.status(500).json({
            error:"Error obteniendo instrucción ministerial"
        });

    }

});





// Crear o actualizar instrucción ministerial

router.post("/", async(req,res)=>{


    try{


        const {
    alumno_id,
    estado,
    fecha_inicio,
    fecha_fin,
    observaciones
} = req.body;

console.log(req.body);

const existe = await pool.query(
`
SELECT id
FROM instruccion_ministerial
WHERE alumno_id = $1
`,
[alumno_id]
);

console.log("Registro encontrado:", existe.rows);

        if(existe.rows.length > 0){


            const actualizado = await pool.query(

            `
            UPDATE instruccion_ministerial

            SET

            estado=$1,
            fecha_inicio=$2,
            fecha_finalizacion=$3,
            observaciones=$4


            WHERE alumno_id=$5


            RETURNING *

            `,

            [
                estado,
                fecha_inicio,
                fecha_fin,
                observaciones,
                alumno_id
            ]

            );


            return res.json(actualizado.rows[0]);

        }



        const creado = await pool.query(

        `
        INSERT INTO instruccion_ministerial

        (
            alumno_id,
            estado,
            fecha_inicio,
            fecha_finalizacion,
            observaciones
        )

        VALUES
        ($1,$2,$3,$4,$5)

        RETURNING *

        `,

        [
            alumno_id,
            estado,
            fecha_inicio,
            fecha_fin,
            observaciones
        ]

        );


        res.status(201).json(creado.rows[0]);



    }catch(error){

        console.error(error);

        res.status(500).json({
            error:"Error guardando instrucción ministerial"
        });

    }


});

module.exports = router;