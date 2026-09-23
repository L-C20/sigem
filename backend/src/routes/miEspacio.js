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




// =====================================
// EVALUACIONES
// =====================================

// Teoria se califica con nota; solfeo con aprobado o
// desaprobado. En los dos casos guardamos el resultado
// explicito, no calculado al vuelo: si manana cambia la
// nota de aprobacion, lo ya corregido no cambia solo.

const NOTA_APROBACION = 7;


const AREAS = ["Teoría", "Solfeo"];

const TIPOS = ["Trabajo práctico", "Lección", "Examen"];




// La evaluacion tiene que ser suya

async function esMiEvaluacion(instructorId, evaluacionId){


    const resultado = await pool.query(
        `
        SELECT
            id, nivel_id, area, tipo, titulo,
            descripcion, fecha, anio, cuatrimestre, obligatoria
        FROM evaluaciones
        WHERE id = $1
        AND instructor_id = $2
        `,
        [evaluacionId, instructorId]
    );


    return resultado.rows[0] || null;


}




// =====================================
// LISTAR LAS EVALUACIONES DE UN NIVEL
// =====================================

router.get("/niveles/:nivelId/evaluaciones", async(req,res)=>{


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

                e.*,

                -- Se guarda una fila por alumno para poder
                -- borrar una nota puesta por error, asi que
                -- contar filas no seria contar corregidos

                COUNT(r.id) FILTER (
                    WHERE r.nota      IS NOT NULL
                    OR    r.resultado IS NOT NULL
                    OR    r.ausente
                ) AS corregidos,

                COUNT(r.id) FILTER (
                    WHERE r.resultado = 'Aprobado'
                ) AS aprobados

            FROM evaluaciones e

            LEFT JOIN evaluacion_resultados r
                ON r.evaluacion_id = e.id

            WHERE e.nivel_id      = $1
            AND   e.instructor_id = $2

            GROUP BY e.id

            ORDER BY e.cuatrimestre, e.fecha NULLS LAST, e.id
            `,
            [nivelId, req.instructorId]
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
// CREAR UNA EVALUACION
// =====================================

router.post("/niveles/:nivelId/evaluaciones", async(req,res)=>{


    try{


        const nivelId = Number(req.params.nivelId);


        if(!await esMiNivel(req.instructorId, nivelId)){


            return res.status(403).json({
                error:"Ese nivel no está a tu cargo"
            });


        }


        const {

            anio,
            cuatrimestre,
            area,
            tipo,
            titulo,
            descripcion,
            fecha,
            obligatoria

        } = req.body;


        if(!titulo || !String(titulo).trim()){


            return res.status(400).json({
                error:"Poné un título"
            });


        }


        if(!AREAS.includes(area)){


            return res.status(400).json({
                error:"El área tiene que ser Teoría o Solfeo"
            });


        }


        if(!TIPOS.includes(tipo)){


            return res.status(400).json({
                error:"Tipo de evaluación no válido"
            });


        }


        if(![1,2].includes(Number(cuatrimestre))){


            return res.status(400).json({
                error:"El cuatrimestre tiene que ser 1 o 2"
            });


        }


        const creada = await pool.query(
            `
            INSERT INTO evaluaciones
                (nivel_id, instructor_id, anio, cuatrimestre,
                 area, tipo, titulo, descripcion, fecha, obligatoria)

            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)

            RETURNING *
            `,
            [
                nivelId,
                req.instructorId,
                Number(anio) || new Date().getFullYear(),
                Number(cuatrimestre),
                area,
                tipo,
                String(titulo).trim(),
                descripcion || null,
                fecha || null,
                obligatoria !== false
            ]
        );


        res.status(201).json(creada.rows[0]);


    }
    catch(error){


        console.error(error);


        res.status(500).json({
            error:"Error creando la evaluación"
        });


    }


});




// =====================================
// EDITAR UNA EVALUACION
// =====================================

router.put("/evaluaciones/:id", async(req,res)=>{


    try{


        const id = Number(req.params.id);


        if(!await esMiEvaluacion(req.instructorId, id)){


            return res.status(403).json({
                error:"Esa evaluación no es tuya"
            });


        }


        const {
            titulo,
            descripcion,
            fecha,
            obligatoria
        } = req.body;


        const actualizada = await pool.query(
            `
            UPDATE evaluaciones

            SET
                titulo      = COALESCE($2, titulo),
                descripcion = $3,
                fecha       = $4,
                obligatoria = COALESCE($5, obligatoria)

            WHERE id = $1

            RETURNING *
            `,
            [
                id,
                titulo ? String(titulo).trim() : null,
                descripcion || null,
                fecha || null,
                typeof obligatoria === "boolean" ? obligatoria : null
            ]
        );


        res.json(actualizada.rows[0]);


    }
    catch(error){


        console.error(error);


        res.status(500).json({
            error:"Error actualizando la evaluación"
        });


    }


});




// =====================================
// BORRAR UNA EVALUACION
// =====================================

// Solo si todavia no tiene nada corregido: borrar notas
// cargadas por error de tipeo seria muy facil

router.delete("/evaluaciones/:id", async(req,res)=>{


    try{


        const id = Number(req.params.id);


        if(!await esMiEvaluacion(req.instructorId, id)){


            return res.status(403).json({
                error:"Esa evaluación no es tuya"
            });


        }


        const cargados = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM evaluacion_resultados
            WHERE evaluacion_id = $1
            AND (
                nota      IS NOT NULL
                OR resultado IS NOT NULL
                OR ausente
            )
            `,
            [id]
        );


        if(Number(cargados.rows[0].total) > 0){


            return res.status(409).json({
                error:"No se puede borrar: ya tiene resultados cargados"
            });


        }


        await pool.query(
            `DELETE FROM evaluaciones WHERE id = $1`,
            [id]
        );


        res.json({ mensaje:"Evaluación eliminada" });


    }
    catch(error){


        console.error(error);


        res.status(500).json({
            error:"Error eliminando la evaluación"
        });


    }


});




// =====================================
// RESULTADOS DE UNA EVALUACION
// =====================================

router.get("/evaluaciones/:id/resultados", async(req,res)=>{


    try{


        const id = Number(req.params.id);


        const evaluacion =
        await esMiEvaluacion(req.instructorId, id);


        if(!evaluacion){


            return res.status(403).json({
                error:"Esa evaluación no es tuya"
            });


        }


        const resultado = await pool.query(
            `
            SELECT

                a.id        AS alumno_id,
                a.apellido,
                a.nombre,

                r.nota,
                r.resultado,
                r.observaciones,
                r.ausente

            FROM cursadas_teoria c

            JOIN alumnos a
                ON a.id = c.alumno_id

            LEFT JOIN evaluacion_resultados r
                ON  r.alumno_id     = a.id
                AND r.evaluacion_id = $3

            WHERE c.nivel_id      = $1
            AND   c.instructor_id = $2
            AND   c.estado        = 'Activo'

            ORDER BY a.apellido, a.nombre
            `,
            [evaluacion.nivel_id, req.instructorId, id]
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
// GUARDAR RESULTADOS
// =====================================

router.post("/evaluaciones/:id/resultados", async(req,res)=>{


    try{


        const id = Number(req.params.id);


        const evaluacion =
        await esMiEvaluacion(req.instructorId, id);


        if(!evaluacion){


            return res.status(403).json({
                error:"Esa evaluación no es tuya"
            });


        }


        const { resultados } = req.body;


        if(!Array.isArray(resultados)){


            return res.status(400).json({
                error:"Faltan los resultados"
            });


        }


        const alumnos = [];
        const notas = [];
        const estados = [];
        const observaciones = [];
        const ausentes = [];


        for(const item of resultados){


            const ausente = item.ausente === true;


            let nota = null;

            let estado = null;


            if(!ausente && evaluacion.area === "Teoría"){


                if(item.nota !== null && item.nota !== undefined && item.nota !== ""){


                    nota = Number(item.nota);


                    if(Number.isNaN(nota) || nota < 1 || nota > 10){


                        return res.status(400).json({
                            error:"Las notas van del 1 al 10"
                        });


                    }


                    estado =
                    nota >= NOTA_APROBACION
                        ? "Aprobado"
                        : "Desaprobado";


                }


            }


            if(!ausente && evaluacion.area === "Solfeo"){


                if(item.resultado === "Aprobado" || item.resultado === "Desaprobado"){


                    estado = item.resultado;


                }


            }


            alumnos.push(Number(item.alumno_id));
            notas.push(nota);
            estados.push(estado);
            observaciones.push(item.observaciones || null);
            ausentes.push(ausente);


        }


        // El JOIN contra cursadas_teoria hace de guardia:
        // un alumno que no sea de este nivel y de este
        // instructor no encuentra pareja y no se guarda

        const guardado = await pool.query(
            `
            INSERT INTO evaluacion_resultados
                (evaluacion_id, alumno_id, nota, resultado,
                 observaciones, ausente, cargado_por)

            SELECT
                $1,
                c.alumno_id,
                d.nota,
                d.resultado,
                d.observaciones,
                d.ausente,
                $7

            FROM unnest(
                $2::int[],
                $3::numeric[],
                $4::text[],
                $5::text[],
                $6::boolean[]
            ) AS d(alumno_id, nota, resultado, observaciones, ausente)

            JOIN cursadas_teoria c
                ON  c.alumno_id     = d.alumno_id
                AND c.nivel_id      = $8
                AND c.instructor_id = $9
                AND c.estado        = 'Activo'

            ON CONFLICT (evaluacion_id, alumno_id)
            DO UPDATE SET
                nota          = EXCLUDED.nota,
                resultado     = EXCLUDED.resultado,
                observaciones = EXCLUDED.observaciones,
                ausente       = EXCLUDED.ausente,
                cargado_por   = EXCLUDED.cargado_por,
                actualizado   = CURRENT_TIMESTAMP
            `,
            [
                id,
                alumnos,
                notas,
                estados,
                observaciones,
                ausentes,
                req.usuario.id,
                evaluacion.nivel_id,
                req.instructorId
            ]
        );


        res.json({
            mensaje:"Resultados guardados",
            guardados: guardado.rowCount,
            ignorados: resultados.length - guardado.rowCount
        });


    }
    catch(error){


        console.error(error);


        res.status(500).json({
            error:"Error guardando los resultados"
        });


    }


});




// =====================================
// QUIEN PUEDE RENDIR EL EXAMEN
// =====================================

// La regla no se guarda en ningun lado: se calcula. Un
// alumno esta habilitado si no le queda ninguna evaluacion
// obligatoria sin aprobar, contando teoria y solfeo.

router.get("/niveles/:nivelId/habilitacion", async(req,res)=>{


    try{


        const nivelId = Number(req.params.nivelId);

        const cuatrimestre = Number(req.query.cuatrimestre) || 1;


        if(!await esMiNivel(req.instructorId, nivelId)){


            return res.status(403).json({
                error:"Ese nivel no está a tu cargo"
            });


        }


        const resultado = await pool.query(
            `
            SELECT

                a.id        AS alumno_id,
                a.apellido,
                a.nombre,

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
                AND x.cuatrimestre = $3

            LEFT JOIN usuarios u
                ON u.id = x.autorizado_por

            LEFT JOIN evaluaciones e
                ON  e.nivel_id      = c.nivel_id
                AND e.instructor_id = c.instructor_id
                AND e.anio          = c.anio
                AND e.cuatrimestre  = $3
                AND e.obligatoria   = TRUE
                AND e.tipo         <> 'Examen'

            LEFT JOIN evaluacion_resultados r
                ON  r.evaluacion_id = e.id
                AND r.alumno_id     = a.id

            WHERE c.nivel_id      = $1
            AND   c.instructor_id = $2
            AND   c.estado        = 'Activo'

            GROUP BY a.id, a.apellido, a.nombre

            ORDER BY a.apellido, a.nombre
            `,
            [nivelId, req.instructorId, cuatrimestre]
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
// CIERRES DE PERIODO
// =====================================

// El sistema calcula el promedio, que es un hecho, y
// sugiere una condicion. Quien firma es la persona: nada
// queda cerrado hasta que alguien lo guarda.

const PERIODOS = [
    "1er cuatrimestre",
    "2do cuatrimestre",
    "Anual"
];


const CONDICIONES = [
    "Promocionado",
    "Regular",
    "Libre"
];


// A que cuatrimestres mira cada periodo

function cuatrimestresDe(periodo){


    if(periodo === "1er cuatrimestre"){


        return [1];


    }


    if(periodo === "2do cuatrimestre"){


        return [2];


    }


    return [1, 2];


}




router.get("/niveles/:nivelId/cierres", async(req,res)=>{


    try{


        const nivelId = Number(req.params.nivelId);

        const periodo = req.query.periodo || "1er cuatrimestre";


        if(!PERIODOS.includes(periodo)){


            return res.status(400).json({
                error:"Período no válido"
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

                a.id        AS alumno_id,
                a.apellido,
                a.nombre,
                c.anio,

                -- El promedio sale solo de las notas de
                -- Teoria: solfeo no lleva nota
                ROUND(AVG(r.nota), 2) AS promedio,

                COUNT(r.nota) AS notas_contadas,

                -- Lo que ya este guardado, si es que hay
                ci.id            AS cierre_id,
                ci.nota_final,
                ci.condicion,
                ci.observaciones,
                ci.cerrado_el

            FROM cursadas_teoria c

            JOIN alumnos a
                ON a.id = c.alumno_id

            LEFT JOIN evaluaciones e
                ON  e.nivel_id      = c.nivel_id
                AND e.instructor_id = c.instructor_id
                AND e.anio          = c.anio
                AND e.area          = 'Teoría'
                AND e.cuatrimestre  = ANY($3::int[])

            LEFT JOIN evaluacion_resultados r
                ON  r.evaluacion_id = e.id
                AND r.alumno_id     = a.id
                AND r.ausente       = FALSE

            LEFT JOIN cierres ci
                ON  ci.alumno_id = a.id
                AND ci.nivel_id  = c.nivel_id
                AND ci.anio      = c.anio
                AND ci.periodo   = $4

            WHERE c.nivel_id      = $1
            AND   c.instructor_id = $2
            AND   c.estado        = 'Activo'

            GROUP BY a.id, a.apellido, a.nombre, c.anio,
                     ci.id, ci.nota_final, ci.condicion,
                     ci.observaciones, ci.cerrado_el

            ORDER BY a.apellido, a.nombre
            `,
            [
                nivelId,
                req.instructorId,
                cuatrimestresDe(periodo),
                periodo
            ]
        );


        res.json(resultado.rows);


    }
    catch(error){


        console.error(error);


        res.status(500).json({
            error:"Error calculando el cierre"
        });


    }


});




// =====================================
// GUARDAR EL CIERRE
// =====================================

router.post("/niveles/:nivelId/cierres", async(req,res)=>{


    try{


        const nivelId = Number(req.params.nivelId);

        const { periodo, anio, cierres } = req.body;


        if(!PERIODOS.includes(periodo)){


            return res.status(400).json({
                error:"Período no válido"
            });


        }


        if(!Array.isArray(cierres)){


            return res.status(400).json({
                error:"Faltan los cierres"
            });


        }


        if(!await esMiNivel(req.instructorId, nivelId)){


            return res.status(403).json({
                error:"Ese nivel no está a tu cargo"
            });


        }


        const alumnos = [];
        const notas = [];
        const condiciones = [];
        const observaciones = [];


        for(const item of cierres){


            if(!CONDICIONES.includes(item.condicion)){


                return res.status(400).json({
                    error:"Condición no válida: " + item.condicion
                });


            }


            let nota = null;


            if(item.nota_final !== null
               && item.nota_final !== undefined
               && item.nota_final !== ""){


                nota = Number(item.nota_final);


                if(Number.isNaN(nota) || nota < 1 || nota > 10){


                    return res.status(400).json({
                        error:"Las notas van del 1 al 10"
                    });


                }


            }


            alumnos.push(Number(item.alumno_id));
            notas.push(nota);
            condiciones.push(item.condicion);
            observaciones.push(item.observaciones || null);


        }


        // Igual que en el resto: el JOIN contra
        // cursadas_teoria es el que deja afuera a
        // cualquier alumno que no sea de este curso

        const guardado = await pool.query(
            `
            INSERT INTO cierres
                (alumno_id, nivel_id, anio, periodo,
                 nota_final, condicion, observaciones, cerrado_por)

            SELECT
                c.alumno_id,
                c.nivel_id,
                c.anio,
                $5,
                d.nota_final,
                d.condicion,
                d.observaciones,
                $6

            FROM unnest(
                $1::int[],
                $2::numeric[],
                $3::text[],
                $4::text[]
            ) AS d(alumno_id, nota_final, condicion, observaciones)

            JOIN cursadas_teoria c
                ON  c.alumno_id     = d.alumno_id
                AND c.nivel_id      = $7
                AND c.instructor_id = $8
                AND c.estado        = 'Activo'

            ON CONFLICT (alumno_id, nivel_id, anio, periodo)
            DO UPDATE SET
                nota_final    = EXCLUDED.nota_final,
                condicion     = EXCLUDED.condicion,
                observaciones = EXCLUDED.observaciones,
                cerrado_por   = EXCLUDED.cerrado_por,
                cerrado_el    = CURRENT_TIMESTAMP
            `,
            [
                alumnos,
                notas,
                condiciones,
                observaciones,
                periodo,
                req.usuario.id,
                nivelId,
                req.instructorId
            ]
        );


        res.json({
            mensaje:"Cierre guardado",
            guardados: guardado.rowCount,
            ignorados: cierres.length - guardado.rowCount
        });


    }
    catch(error){


        console.error(error);


        res.status(500).json({
            error:"Error guardando el cierre"
        });


    }


});



module.exports = router;
