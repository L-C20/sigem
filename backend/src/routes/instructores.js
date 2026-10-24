const express = require("express");
const router = express.Router();

const pool = require("../database/connection");

const { permitirRoles } = require("../middleware/autenticacion");

// =====================================
// OBTENER INSTRUCTORES
// =====================================

router.get("/", async (req, res) => {

    try {

        const { tipo } = req.query;


        let consulta = `

            SELECT

                i.id,
                i.apellido,
                i.nombre,
                i.telefono,
                i.estado,
                i.ensena_teoria,

                STRING_AGG(
                    DISTINCT inst.nombre,
                    ', '
                    ORDER BY inst.nombre
                ) AS instrumento

            FROM instructores i

            LEFT JOIN instructor_instrumentos ii
                ON ii.instructor_id = i.id

            LEFT JOIN instrumentos inst
                ON inst.id = ii.instrumento_id

            WHERE
                i.estado = 'Activo'

        `;


        // =====================================
        // SOLO INSTRUCTORES DE INSTRUMENTO
        // =====================================

        if (tipo === "instrumento") {

            consulta += `

                AND EXISTS (

                    SELECT 1

                    FROM instructor_instrumentos ii2

                    WHERE ii2.instructor_id = i.id

                )

            `;

        }


        // =====================================
        // SOLO INSTRUCTORES DE TEORÍA
        // =====================================

        if (tipo === "teoria") {

            consulta += `

                AND i.ensena_teoria = TRUE

            `;

        }


        consulta += `

            GROUP BY
                i.id,
                i.apellido,
                i.nombre,
                i.telefono,
                i.estado,
                i.ensena_teoria

            ORDER BY
                i.apellido,
                i.nombre

        `;


        const resultado =
            await pool.query(consulta);


        res.json(resultado.rows);


    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Error al obtener instructores"
        });

    }

});
// =====================================
// OBTENER INSTRUCTORES DE UN INSTRUMENTO
// =====================================

router.get("/instrumento/:instrumento_id", async (req, res) => {

    try {

        const { instrumento_id } = req.params;

        const resultado = await pool.query(`

            SELECT

                i.id,
                i.apellido,
                i.nombre

            FROM instructores i

            INNER JOIN instructor_instrumentos ii
                ON ii.instructor_id = i.id

            WHERE ii.instrumento_id = $1

            AND i.estado = 'Activo'

            ORDER BY
                i.apellido,
                i.nombre

        `, [instrumento_id]);

        res.json(resultado.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Error al obtener instructores"
        });

    }

});


// =====================================
// OBTENER INSTRUCTORES DE TEORÍA
// =====================================

router.get("/teoria", async (req, res) => {

    try {

        const resultado = await pool.query(`

            SELECT

                id,
                apellido,
                nombre

            FROM instructores

            WHERE ensena_teoria = TRUE

            AND estado = 'Activo'

            ORDER BY
                apellido,
                nombre

        `);

        res.json(resultado.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Error al obtener instructores"
        });

    }

});


// =====================================
// CREAR INSTRUCTOR
// =====================================

// Solo administración: un instructor es personal de la escuela, no un dato
// de cursada. La secretaría carga alumnos, no da de alta docentes.
router.post("/", permitirRoles("superadmin", "admin"), async (req, res) => {

    const cliente = await pool.connect();

    try {

        const nombre =
            String(req.body.nombre || "").trim();

        const apellido =
            String(req.body.apellido || "").trim();

        const telefono =
            String(req.body.telefono || "").trim();

        const ensenaTeoria =
            Boolean(req.body.ensena_teoria);

        const estado =
            req.body.estado === "Inactivo"
                ? "Inactivo"
                : "Activo";

        const instrumentos =
            Array.isArray(req.body.instrumentos)
                ? req.body.instrumentos
                    .map(Number)
                    .filter(id => Number.isInteger(id) && id > 0)
                : [];


        if (!nombre || !apellido) {

            return res.status(400).json({
                error: "El nombre y el apellido son obligatorios"
            });

        }


        // Un instructor que no enseña nada no aparece en ningún filtro ni se
        // puede asignar a un alumno: quedaría cargado y sería invisible.
        if (!ensenaTeoria && instrumentos.length === 0) {

            return res.status(400).json({
                error: "Indicá si enseña Teoría y Solfeo, o elegí al menos un instrumento"
            });

        }


        // No hay unicidad por nombre, y con razón: puede haber dos personas
        // que se llamen igual. Pero casi siempre un homónimo es alguien
        // cargándolo dos veces, así que se avisa y se deja decidir en lugar
        // de duplicar en silencio o prohibirlo.
        if (!req.body.permitir_homonimo) {

            const homonimo = await cliente.query(
                `
                SELECT id, apellido, nombre, estado
                FROM instructores
                WHERE lower(btrim(nombre)) = lower($1)
                  AND lower(btrim(apellido)) = lower($2)
                `,
                [nombre, apellido]
            );

            if (homonimo.rows.length > 0) {

                return res.status(409).json({
                    error: "Ya hay un instructor con ese nombre",
                    homonimo: homonimo.rows[0]
                });

            }

        }


        await cliente.query("BEGIN");


        const creado = await cliente.query(
            `
            INSERT INTO instructores
                (nombre, apellido, telefono, estado, ensena_teoria)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, nombre, apellido, telefono, estado, ensena_teoria
            `,
            [
                nombre,
                apellido,
                telefono || null,
                estado,
                ensenaTeoria
            ]
        );


        const instructor = creado.rows[0];


        // Los instrumentos van en la tabla puente: un instructor puede
        // enseñar varios, y es de ahí de donde los lee todo el sistema.
        if (instrumentos.length > 0) {

            await cliente.query(
                `
                INSERT INTO instructor_instrumentos
                    (instructor_id, instrumento_id)
                SELECT $1, id
                FROM instrumentos
                WHERE id = ANY($2::int[])
                ON CONFLICT DO NOTHING
                `,
                [instructor.id, instrumentos]
            );

        }


        await cliente.query("COMMIT");


        res.status(201).json(instructor);

    } catch (error) {

        await cliente.query("ROLLBACK").catch(() => {});

        console.error(error);

        res.status(500).json({
            error: "Error al crear el instructor"
        });

    } finally {

        cliente.release();

    }

});


module.exports = router;