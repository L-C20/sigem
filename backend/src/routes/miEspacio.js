const express = require("express");
const router = express.Router();

const pool = require("../database/connection");


// Este archivo es el espacio propio de cada instructor.
// Ninguna consulta acepta un instructor_id que venga del
// navegador: siempre se resuelve desde la sesion.




// =====================================
// QUIEN ENSENA
// =====================================

// El token solo trae id y rol. El vinculo con el
// instructor se lee de la base en cada pedido: si el
// superadmin lo cambia, el efecto es inmediato y no
// queda un token viejo mandando.

async function instructorDeLaSesion(req){


    const resultado = await pool.query(
        `
        SELECT instructor_id
        FROM usuarios
        WHERE id = $1
        AND estado = 'Activo'
        `,
        [req.usuario.id]
    );


    return resultado.rows[0]?.instructor_id ?? null;


}




// Corta el paso a quien no tenga un instructor vinculado

async function exigirInstructor(req, res, next){


    try{


        const instructor = await instructorDeLaSesion(req);


        if(!instructor){


            return res.status(403).json({
                error:"Tu cuenta no está vinculada a ningún instructor"
            });


        }


        req.instructorId = instructor;


        next();


    }
    catch(error){


        console.error(error);


        res.status(500).json({
            error:"Error verificando la sesión"
        });


    }


}


router.use(exigirInstructor);




// =====================================
// EL NIVEL TIENE QUE SER SUYO
// =====================================

async function esMiNivel(instructorId, nivelId){


    const resultado = await pool.query(
        `
        SELECT 1
        FROM instructor_niveles_teoria
        WHERE instructor_id = $1
        AND nivel_id = $2
        `,
        [instructorId, nivelId]
    );


    return resultado.rows.length > 0;


}




// =====================================
// RESUMEN: MIS NIVELES
// =====================================

router.get("/resumen", async(req,res)=>{


    try{


        const resultado = await pool.query(
            `
            SELECT

                n.id       AS nivel_id,
                n.nombre   AS nivel,
                t.anio,

                COUNT(c.id) AS alumnos

            FROM instructor_niveles_teoria t

            JOIN niveles_teoria n
                ON n.id = t.nivel_id

            LEFT JOIN cursadas_teoria c
                ON  c.nivel_id      = t.nivel_id
                AND c.instructor_id = t.instructor_id
                AND c.anio          = t.anio
                AND c.estado        = 'Activo'

            WHERE t.instructor_id = $1

            GROUP BY n.id, n.nombre, t.anio

            ORDER BY n.id
            `,
            [req.instructorId]
        );


        res.json(resultado.rows);


    }
    catch(error){


        console.error(error);


        res.status(500).json({
            error:"Error obteniendo tus niveles"
        });


    }


});




// =====================================
// MIS ALUMNOS DE UN NIVEL
// =====================================

router.get("/alumnos/:nivelId", async(req,res)=>{


    try{


        const nivelId = Number(req.params.nivelId);


        if(!await esMiNivel(req.instructorId, nivelId)){


            return res.status(403).json({
                error:"Ese nivel no está a tu cargo"
            });


        }


        const resultado = await pool.query(
            `
            SELECT

                c.id        AS cursada_id,
                a.id        AS alumno_id,
                a.apellido,
                a.nombre,
                a.telefono,
                c.anio,
                c.estado,

                f.nombre    AS filial

            FROM cursadas_teoria c

            JOIN alumnos a
                ON a.id = c.alumno_id

            LEFT JOIN filiales f
                ON f.id = a.filial_id

            WHERE c.nivel_id      = $1
            AND   c.instructor_id = $2
            AND   c.estado        = 'Activo'

            ORDER BY a.apellido, a.nombre
            `,
            [nivelId, req.instructorId]
        );


        res.json(resultado.rows);


    }
    catch(error){


        console.error(error);


        res.status(500).json({
            error:"Error obteniendo tus alumnos"
        });


    }


});




// =====================================
// ASISTENCIA DE UNA FECHA
// =====================================

router.get("/asistencia/:nivelId", async(req,res)=>{


    try{


        const nivelId = Number(req.params.nivelId);

        const { fecha } = req.query;


        if(!fecha){


            return res.status(400).json({
                error:"Falta la fecha"
            });


        }


        if(!await esMiNivel(req.instructorId, nivelId)){


            return res.status(403).json({
                error:"Ese nivel no está a tu cargo"
            });


        }


        const resultado = await pool.query(
            `
            SELECT

                c.id        AS cursada_id,
                a.id        AS alumno_id,
                a.apellido,
                a.nombre,

                at.id       AS asistencia_id,
                at.presente

            FROM cursadas_teoria c

            JOIN alumnos a
                ON a.id = c.alumno_id

            LEFT JOIN asistencias_teoria at
                ON  at.cursada_teoria_id = c.id
                AND at.fecha             = $3

            WHERE c.nivel_id      = $1
            AND   c.instructor_id = $2
            AND   c.estado        = 'Activo'

            ORDER BY a.apellido, a.nombre
            `,
            [nivelId, req.instructorId, fecha]
        );


        res.json(resultado.rows);


    }
    catch(error){


        console.error(error);


        res.status(500).json({
            error:"Error obteniendo la asistencia"
        });


    }


});




// =====================================
// GUARDAR ASISTENCIA
// =====================================

// Una sola instruccion ya es atomica: no hace falta
// abrir una transaccion a mano

router.post("/asistencia/:nivelId", async(req,res)=>{


    try{


        const nivelId = Number(req.params.nivelId);

        const { fecha, asistencias } = req.body;


        if(!fecha || !Array.isArray(asistencias)){


            return res.status(400).json({
                error:"Faltan la fecha o las asistencias"
            });


        }


        if(!await esMiNivel(req.instructorId, nivelId)){


            return res.status(403).json({
                error:"Ese nivel no está a tu cargo"
            });


        }


        // Todo en una sola consulta. El JOIN contra
        // cursadas_teoria es el que hace de guardia: una
        // cursada de otro nivel o de otro instructor no
        // encuentra pareja y no llega a escribirse.

        const cursadas =
        asistencias.map(item=>Number(item.cursada_id));


        const presentes =
        asistencias.map(item=>item.presente === true);


        const resultado = await pool.query(
            `
            INSERT INTO asistencias_teoria
                (alumno_id, cursada_teoria_id, fecha, presente)

            SELECT
                c.alumno_id,
                c.id,
                $3::date,
                d.presente

            FROM unnest($1::int[], $2::boolean[])
                AS d(cursada_id, presente)

            JOIN cursadas_teoria c
                ON  c.id            = d.cursada_id
                AND c.nivel_id      = $4
                AND c.instructor_id = $5
                AND c.estado        = 'Activo'

            ON CONFLICT (alumno_id, cursada_teoria_id, fecha)
            DO UPDATE SET presente = EXCLUDED.presente
            `,
            [
                cursadas,
                presentes,
                fecha,
                nivelId,
                req.instructorId
            ]
        );


        const guardadas = resultado.rowCount;


        res.json({
            mensaje:"Asistencia guardada",
            guardadas,
            ignoradas: asistencias.length - guardadas
        });


    }
    catch(error){


        console.error(error);


        res.status(500).json({
            error:"Error guardando la asistencia"
        });


    }


});




module.exports = router;
