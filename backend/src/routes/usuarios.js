const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");

const pool = require("../database/connection");

const { permitirRoles } = require("../middleware/autenticacion");


// Todo este archivo es solo para el superadmin.
// El token ya fue validado antes, en index.js.

router.use(permitirRoles("superadmin"));


const ROLES = [
    "superadmin",
    "admin",
    "instructor",
    "secretaria"
];




// =====================================
// LISTAR USUARIOS
// =====================================

router.get("/", async(req,res)=>{


    try{


        const resultado = await pool.query(
            `
            SELECT

                u.id,
                u.nombre,
                u.apellido,
                u.email,
                u.username,
                u.rol,
                u.estado,
                u.instructor_id,

                i.apellido || ', ' || i.nombre AS instructor,

                STRING_AGG(
                    n.nombre,
                    ', '
                    ORDER BY n.id
                ) AS niveles

            FROM usuarios u

            LEFT JOIN instructores i
                ON i.id = u.instructor_id

            LEFT JOIN instructor_niveles_teoria t
                ON t.instructor_id = u.instructor_id

            LEFT JOIN niveles_teoria n
                ON n.id = t.nivel_id

            GROUP BY u.id, i.apellido, i.nombre

            ORDER BY u.apellido, u.nombre
            `
        );


        res.json(resultado.rows);


    }
    catch(error){


        console.error(error);


        res.status(500).json({
            error:"Error obteniendo usuarios"
        });


    }


});




// =====================================
// CREAR USUARIO
// =====================================

router.post("/", async(req,res)=>{


    try{


        const {

            nombre,
            apellido,
            email,
            username,
            password,
            rol,
            instructor_id

        } = req.body;


        // Vacio y nulo son lo mismo aca: si guardaramos ""
        // el segundo usuario sin correo chocaria contra el
        // indice unico

        const correo =
        email && String(email).trim() ? String(email).trim() : null;


        const usuario =
        username && String(username).trim() ? String(username).trim() : null;


        const faltan =
        !nombre || !apellido || !password || !rol;


        if(faltan){


            return res.status(400).json({
                error:"Faltan datos obligatorios"
            });


        }


        // El login busca por username, asi que sin eso la
        // cuenta no podria entrar nunca. El correo, en
        // cambio, es opcional.

        if(!usuario){


            return res.status(400).json({
                error:"El nombre de usuario es necesario para poder ingresar"
            });


        }


        if(!ROLES.includes(rol)){


            return res.status(400).json({
                error:"Rol no válido"
            });


        }


        if(String(password).length < 8){


            return res.status(400).json({
                error:"La contraseña debe tener al menos 8 caracteres"
            });


        }


        // Ni el correo ni el nombre de usuario se repiten

        const repetido = await pool.query(
            `
            SELECT

                COUNT(*) FILTER (
                    WHERE $1::text IS NOT NULL
                    AND LOWER(email) = LOWER($1)
                ) AS correo,

                COUNT(*) FILTER (
                    WHERE $2::text IS NOT NULL
                    AND LOWER(username) = LOWER($2)
                ) AS usuario

            FROM usuarios
            `,
            [correo, usuario]
        );


        if(Number(repetido.rows[0].correo) > 0){


            return res.status(409).json({
                error:"Ya existe un usuario con ese correo"
            });


        }


        if(Number(repetido.rows[0].usuario) > 0){


            return res.status(409).json({
                error:"Ya existe ese nombre de usuario"
            });


        }


        const clave =
        await bcrypt.hash(String(password), 10);


        const creado = await pool.query(
            `
            INSERT INTO usuarios
                (nombre, apellido, email, username,
                 password, rol, estado, instructor_id)

            VALUES
                ($1, $2, $3, $4, $5, $6, 'Activo', $7)

            RETURNING
                id, nombre, apellido, email, username,
                rol, estado, instructor_id
            `,
            [
                nombre,
                apellido,
                correo,
                usuario,
                clave,
                rol,
                instructor_id || null
            ]
        );


        res.status(201).json(creado.rows[0]);


    }
    catch(error){


        console.error(error);


        res.status(500).json({
            error:"Error creando el usuario"
        });


    }


});




// =====================================
// EDITAR USUARIO
// =====================================

router.put("/:id", async(req,res)=>{


    try{


        const id = Number(req.params.id);


        const {

            nombre,
            apellido,
            email,
            username,
            rol,
            estado,
            instructor_id

        } = req.body;


        if(rol && !ROLES.includes(rol)){


            return res.status(400).json({
                error:"Rol no válido"
            });


        }


        // Nadie se puede sacar a si mismo el superadmin
        // ni desactivarse: quedaria el sistema sin dueno

        const esElMismo = id === req.usuario.id;


        if(esElMismo && rol && rol !== "superadmin"){


            return res.status(400).json({
                error:"No podés quitarte el rol de superadmin"
            });


        }


        if(esElMismo && estado && estado !== "Activo"){


            return res.status(400).json({
                error:"No podés desactivar tu propia cuenta"
            });


        }


        // El vinculo con el instructor solo se toca si vino
        // en el pedido. Si no, un cambio de apellido borraria
        // la asignacion sin que nadie lo pidiera.

        const tocaInstructor =
        Object.prototype.hasOwnProperty.call(
            req.body,
            "instructor_id"
        );


        const actualizado = await pool.query(
            `
            UPDATE usuarios

            SET
                nombre        = COALESCE($2, nombre),
                apellido      = COALESCE($3, apellido),
                email         = COALESCE($4, email),
                username      = COALESCE($5, username),
                rol           = COALESCE($6, rol),
                estado        = COALESCE($7, estado),

                instructor_id =
                    CASE WHEN $9 THEN $8 ELSE instructor_id END

            WHERE id = $1

            RETURNING
                id, nombre, apellido, email, rol, estado, instructor_id
            `,
            [
                id,
                nombre || null,
                apellido || null,
                email || null,
                username || null,
                rol || null,
                estado || null,
                instructor_id || null,
                tocaInstructor
            ]
        );


        if(actualizado.rows.length === 0){


            return res.status(404).json({
                error:"Usuario no encontrado"
            });


        }


        res.json(actualizado.rows[0]);


    }
    catch(error){


        console.error(error);


        res.status(500).json({
            error:"Error actualizando el usuario"
        });


    }


});




// =====================================
// CAMBIAR CONTRASENA
// =====================================

router.put("/:id/password", async(req,res)=>{


    try{


        const id = Number(req.params.id);

        const { password } = req.body;


        if(!password || String(password).length < 8){


            return res.status(400).json({
                error:"La contraseña debe tener al menos 8 caracteres"
            });


        }


        const clave =
        await bcrypt.hash(String(password), 10);


        const actualizado = await pool.query(
            `
            UPDATE usuarios
            SET password = $2
            WHERE id = $1
            RETURNING id
            `,
            [id, clave]
        );


        if(actualizado.rows.length === 0){


            return res.status(404).json({
                error:"Usuario no encontrado"
            });


        }


        res.json({
            mensaje:"Contraseña actualizada"
        });


    }
    catch(error){


        console.error(error);


        res.status(500).json({
            error:"Error cambiando la contraseña"
        });


    }


});




module.exports = router;
