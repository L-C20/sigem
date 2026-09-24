const express = require("express");
const router = express.Router();

const pool = require("../database/connection");


// ==========================================
// RESUMEN GENERAL DEL INICIO
// ==========================================

router.get("/resumen", async (req, res) => {

    try {

        // ======================================
        // ALUMNOS ACTIVOS
        // ======================================
        // Un alumno es considerado activo si
        // tiene al menos una cursada activa.
        //
        // DISTINCT evita contar dos veces a un
        // alumno que estudia instrumento y teoría.

        const alumnos =
            await pool.query(`

                SELECT COUNT(DISTINCT alumno_id) AS total

                FROM (

                    SELECT alumno_id

                    FROM cursada_instrumento

                    WHERE estado = 'Activo'


                    UNION


                    SELECT alumno_id

                    FROM cursadas_teoria

                    WHERE estado = 'Activo'

                ) AS alumnos_activos

            `);


        // ======================================
        // INSTRUCTORES ACTIVOS
        // ======================================

        const instructores =
            await pool.query(`

                SELECT COUNT(*) AS total

                FROM instructores

                WHERE estado = 'Activo'

            `);


        // ======================================
        // ALUMNOS DE INSTRUMENTO
        // ======================================

        const alumnosInstrumento =
            await pool.query(`

                SELECT COUNT(DISTINCT alumno_id) AS total

                FROM cursada_instrumento

                WHERE estado = 'Activo'

            `);


        // ======================================
        // ALUMNOS DE TEORÍA
        // ======================================

        const alumnosTeoria =
            await pool.query(`

                SELECT COUNT(DISTINCT alumno_id) AS total

                FROM cursadas_teoria

                WHERE estado = 'Activo'

            `);

            // ======================================
// ALUMNOS CON INSTRUCCIÓN MINISTERIAL
// ======================================

const instruccionMinisterial =
    await pool.query(`

        SELECT COUNT(DISTINCT alumno_id) AS total

        FROM instruccion_ministerial

        WHERE estado = 'Activo'

    `);


        // ======================================
        // ALUMNOS REGISTRADOS
        // ======================================
        // Para que "83 activos" signifique algo hace falta
        // saber sobre cuantos: 83 de 85 no es lo mismo que
        // 83 de 300.

        const registrados =
            await pool.query(`

                SELECT COUNT(*) AS total

                FROM alumnos

            `);


        // ======================================
        // RESPUESTA
        // ======================================

        res.json({

            alumnosRegistrados:
                Number(
                    registrados.rows[0].total
                ),

            alumnosActivos:
                Number(
                    alumnos.rows[0].total
                ),

            instructoresActivos:
                Number(
                    instructores.rows[0].total
                ),

            alumnosInstrumento:
                Number(
                    alumnosInstrumento.rows[0].total
                ),

            alumnosTeoria:
                Number(
                    alumnosTeoria.rows[0].total
                ),

            instruccionMinisterial:
                Number(
                    instruccionMinisterial.rows[0].total
                )

        });

    }
    catch (error) {

        console.error(
            "ERROR OBTENIENDO RESUMEN:",
            error
        );

        res.status(500).json({
            error: "Error obteniendo resumen"
        });

    }

});


module.exports = router;