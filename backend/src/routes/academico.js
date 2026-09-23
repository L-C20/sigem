const express = require("express");
const router = express.Router();

const pool = require("../database/connection");

const { permitirRoles } = require("../middleware/autenticacion");


// Vista academica de toda la escuela. El instructor no
// entra: el ve lo suyo por /mi-espacio.

router.use(permitirRoles("superadmin", "admin"));




// =====================================
// TODOS LOS NIVELES
// =====================================

router.get("/niveles", async(req,res)=>{


    try{


        const resultado = await pool.query(
            `
            SELECT

                n.id       AS nivel_id,
                n.nombre   AS nivel,
                t.anio,

                i.apellido || ', ' || i.nombre AS instructor,

                COUNT(c.id) AS alumnos

            FROM instructor_niveles_teoria t

            JOIN niveles_teoria n
                ON n.id = t.nivel_id

            JOIN instructores i
                ON i.id = t.instructor_id

            LEFT JOIN cursadas_teoria c
                ON  c.nivel_id      = t.nivel_id
                AND c.instructor_id = t.instructor_id
                AND c.anio          = t.anio
                AND c.estado        = 'Activo'

            GROUP BY n.id, n.nombre, t.anio, i.apellido, i.nombre

            ORDER BY n.id
            `
        );


        res.json(resultado.rows);


    }
    catch(error){


        console.error(error);


        res.status(500).json({
            error:"Error obteniendo los niveles"
        });


    }


});




// =====================================
// HABILITACION DE CUALQUIER NIVEL
// =====================================

// Misma regla que ve el instructor, pero sin recorte: el
// admin mira toda la escuela

router.get("/niveles/:nivelId/habilitacion", async(req,res)=>{


    try{


        const nivelId = Number(req.params.nivelId);

        const cuatrimestre = Number(req.query.cuatrimestre) || 1;


        const resultado = await pool.query(
            `
            SELECT

                a.id        AS alumno_id,
                a.apellido,
                a.nombre,
                c.nivel_id,
                c.anio,

                COUNT(e.id) AS obligatorias,

                COUNT(e.id) FILTER (
                    WHERE r.resultado = 'Aprobado'
                ) AS aprobadas,

                STRING_AGG(
                    e.titulo,
                    ' · '
                    ORDER BY e.id
                ) FILTER (
                    WHERE r.resultado IS DISTINCT FROM 'Aprobado'
                ) AS adeuda,

                MAX(x.id)            AS excepcion_id,
                MAX(x.motivo)        AS excepcion_motivo,
                MAX(u.apellido)      AS excepcion_por,
                MAX(x.autorizado_el) AS excepcion_fecha

            FROM cursadas_teoria c

            JOIN alumnos a
                ON a.id = c.alumno_id

            LEFT JOIN excepciones_examen x
                ON  x.alumno_id    = a.id
                AND x.nivel_id     = c.nivel_id
                AND x.anio         = c.anio
                AND x.cuatrimestre = $2

            LEFT JOIN usuarios u
                ON u.id = x.autorizado_por

            LEFT JOIN evaluaciones e
                ON  e.nivel_id      = c.nivel_id
                AND e.instructor_id = c.instructor_id
                AND e.anio          = c.anio
                AND e.cuatrimestre  = $2
                AND e.obligatoria   = TRUE
                AND e.tipo         <> 'Examen'

            LEFT JOIN evaluacion_resultados r
                ON  r.evaluacion_id = e.id
                AND r.alumno_id     = a.id

            WHERE c.nivel_id = $1
            AND   c.estado   = 'Activo'

            GROUP BY a.id, a.apellido, a.nombre, c.nivel_id, c.anio

            ORDER BY a.apellido, a.nombre
            `,
            [nivelId, cuatrimestre]
        );


        res.json(resultado.rows);


    }
    catch(error){


        console.error(error);


        res.status(500).json({
            error:"Error calculando la habilitación"
        });


    }


});




// =====================================
// AUTORIZAR UNA EXCEPCION
// =====================================

// Sin motivo no se guarda, y queda firmada con quien la
// autorizo y cuando. El instructor no puede hacer esto:
// si el que decide fuera el mismo que puso los trabajos,
// la regla no existiria.

router.post("/excepciones", async(req,res)=>{


    try{


        const {
            alumno_id,
            nivel_id,
            anio,
            cuatrimestre,
            motivo
        } = req.body;


        if(!alumno_id || !nivel_id || !anio){


            return res.status(400).json({
                error:"Faltan datos del alumno o del curso"
            });


        }


        if(![1,2].includes(Number(cuatrimestre))){


            return res.status(400).json({
                error:"El cuatrimestre tiene que ser 1 o 2"
            });


        }


        if(!motivo || !String(motivo).trim()){


            return res.status(400).json({
                error:"Escribí el motivo de la excepción"
            });


        }


        // El alumno tiene que estar cursando ese nivel

        const cursa = await pool.query(
            `
            SELECT 1
            FROM cursadas_teoria
            WHERE alumno_id = $1
            AND   nivel_id  = $2
            AND   anio      = $3
            AND   estado    = 'Activo'
            `,
            [alumno_id, nivel_id, anio]
        );


        if(cursa.rows.length === 0){


            return res.status(400).json({
                error:"Ese alumno no está cursando ese nivel"
            });


        }


        const creada = await pool.query(
            `
            INSERT INTO excepciones_examen
                (alumno_id, nivel_id, anio, cuatrimestre,
                 motivo, autorizado_por)

            VALUES ($1,$2,$3,$4,$5,$6)

            ON CONFLICT (alumno_id, nivel_id, anio, cuatrimestre)
            DO UPDATE SET
                motivo         = EXCLUDED.motivo,
                autorizado_por = EXCLUDED.autorizado_por,
                autorizado_el  = CURRENT_TIMESTAMP

            RETURNING *
            `,
            [
                alumno_id,
                nivel_id,
                anio,
                Number(cuatrimestre),
                String(motivo).trim(),
                req.usuario.id
            ]
        );


        res.status(201).json(creada.rows[0]);


    }
    catch(error){


        console.error(error);


        res.status(500).json({
            error:"Error autorizando la excepción"
        });


    }


});




// =====================================
// QUITAR UNA EXCEPCION
// =====================================

router.delete("/excepciones/:id", async(req,res)=>{


    try{


        const borrada = await pool.query(
            `
            DELETE FROM excepciones_examen
            WHERE id = $1
            RETURNING id
            `,
            [Number(req.params.id)]
        );


        if(borrada.rows.length === 0){


            return res.status(404).json({
                error:"Esa excepción no existe"
            });


        }


        res.json({ mensaje:"Excepción quitada" });


    }
    catch(error){


        console.error(error);


        res.status(500).json({
            error:"Error quitando la excepción"
        });


    }


});




// =====================================
// TODAS LAS EXCEPCIONES
// =====================================

// La lista completa, para poder rendir cuentas de por que
// rindio cada uno

router.get("/excepciones", async(req,res)=>{


    try{


        const resultado = await pool.query(
            `
            SELECT

                x.id,
                x.anio,
                x.cuatrimestre,
                x.motivo,
                x.autorizado_el,

                a.apellido || ', ' || a.nombre AS alumno,
                n.nombre                       AS nivel,
                u.nombre || ' ' || u.apellido  AS autorizado_por

            FROM excepciones_examen x

            JOIN alumnos a        ON a.id = x.alumno_id
            JOIN niveles_teoria n ON n.id = x.nivel_id
            JOIN usuarios u       ON u.id = x.autorizado_por

            ORDER BY x.autorizado_el DESC
            `
        );


        res.json(resultado.rows);


    }
    catch(error){


        console.error(error);


        res.status(500).json({
            error:"Error obteniendo las excepciones"
        });


    }


});




// =====================================
// NOTAS DE CUALQUIER NIVEL
// =====================================

// Solo lectura. Las notas las carga quien da la clase;
// el admin mira, para poder seguir como viene cada curso
// sin tener que pedirselo a la instructora.


router.get("/niveles/:nivelId/evaluaciones", async(req,res)=>{


    try{


        const nivelId = Number(req.params.nivelId);


        const resultado = await pool.query(
            `
            SELECT

                e.id,
                e.titulo,
                e.area,
                e.tipo,
                e.fecha,
                e.anio,
                e.cuatrimestre,
                e.obligatoria,

                i.apellido || ', ' || i.nombre AS instructor,

                COUNT(r.id) FILTER (
                    WHERE r.nota      IS NOT NULL
                    OR    r.resultado IS NOT NULL
                    OR    r.ausente
                ) AS corregidos,

                COUNT(r.id) FILTER (
                    WHERE r.resultado = 'Aprobado'
                ) AS aprobados,

                ROUND(AVG(r.nota), 2) AS promedio

            FROM evaluaciones e

            JOIN instructores i
                ON i.id = e.instructor_id

            LEFT JOIN evaluacion_resultados r
                ON r.evaluacion_id = e.id

            WHERE e.nivel_id = $1

            GROUP BY e.id, i.apellido, i.nombre

            ORDER BY e.cuatrimestre, e.fecha NULLS LAST, e.id
            `,
            [nivelId]
        );


        res.json(resultado.rows);


    }
    catch(error){


        console.error(error);


        res.status(500).json({
            error:"Error obteniendo las evaluaciones"
        });


    }


});




// =====================================
// RESULTADOS DE UNA EVALUACION
// =====================================

router.get("/evaluaciones/:id/resultados", async(req,res)=>{


    try{


        const id = Number(req.params.id);


        const cabecera = await pool.query(
            `
            SELECT
                e.id, e.nivel_id, e.area, e.tipo, e.titulo,
                e.fecha, e.anio, e.cuatrimestre, e.obligatoria,
                i.apellido || ', ' || i.nombre AS instructor
            FROM evaluaciones e
            JOIN instructores i ON i.id = e.instructor_id
            WHERE e.id = $1
            `,
            [id]
        );


        if(cabecera.rows.length === 0){


            return res.status(404).json({
                error:"Esa evaluación no existe"
            });


        }


        const evaluacion = cabecera.rows[0];


        const resultado = await pool.query(
            `
            SELECT

                a.id        AS alumno_id,
                a.apellido,
                a.nombre,

                r.nota,
                r.resultado,
                r.observaciones,
                r.ausente,

                u.nombre || ' ' || u.apellido AS cargado_por,
                r.actualizado

            FROM cursadas_teoria c

            JOIN alumnos a
                ON a.id = c.alumno_id

            LEFT JOIN evaluacion_resultados r
                ON  r.alumno_id     = a.id
                AND r.evaluacion_id = $2

            LEFT JOIN usuarios u
                ON u.id = r.cargado_por

            WHERE c.nivel_id = $1
            AND   c.anio     = $3
            AND   c.estado   = 'Activo'

            ORDER BY a.apellido, a.nombre
            `,
            [evaluacion.nivel_id, id, evaluacion.anio]
        );


        res.json({
            evaluacion,
            alumnos: resultado.rows
        });


    }
    catch(error){


        console.error(error);


        res.status(500).json({
            error:"Error obteniendo los resultados"
        });


    }


});




// =====================================
// CIERRES DE CUALQUIER NIVEL
// =====================================

router.get("/niveles/:nivelId/cierres", async(req,res)=>{


    try{


        const nivelId = Number(req.params.nivelId);

        const periodo = req.query.periodo || "1er cuatrimestre";


        const resultado = await pool.query(
            `
            SELECT

                a.id        AS alumno_id,
                a.apellido,
                a.nombre,
                c.anio,

                ci.nota_final,
                ci.condicion,
                ci.observaciones,
                ci.cerrado_el,

                u.nombre || ' ' || u.apellido AS cerrado_por

            FROM cursadas_teoria c

            JOIN alumnos a
                ON a.id = c.alumno_id

            LEFT JOIN cierres ci
                ON  ci.alumno_id = a.id
                AND ci.nivel_id  = c.nivel_id
                AND ci.anio      = c.anio
                AND ci.periodo   = $2

            LEFT JOIN usuarios u
                ON u.id = ci.cerrado_por

            WHERE c.nivel_id = $1
            AND   c.estado   = 'Activo'

            ORDER BY a.apellido, a.nombre
            `,
            [nivelId, periodo]
        );


        res.json(resultado.rows);


    }
    catch(error){


        console.error(error);


        res.status(500).json({
            error:"Error obteniendo los cierres"
        });


    }


});



module.exports = router;
