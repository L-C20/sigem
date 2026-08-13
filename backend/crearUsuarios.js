const bcrypt = require("bcrypt");
const pool = require("./src/database/connection");


async function crearUsuarios() {

    try {

        const usuarios = [

            {
                nombre: "Lucas",
                apellido: "Lo Bianco",
                email: "lucaslobianco78@gmail.com",
                password: "Lucas2026!",
            },

            {
                nombre: "Cesia",
                apellido: "Vargas",
                email: "profecesiamusica@gmail.com",
                password: "Cesia2026!",
            },

        
            {
                 nombre: "Matías",
                 apellido: "Scacciante",
                 email: "matiscacciante123@gmail.com",
                 password: "Matias2026!",
             }

        ];


        for (const usuario of usuarios) {

            // =====================================
            // VERIFICAR SI YA EXISTE
            // =====================================

            const existe = await pool.query(
                `
                SELECT id
                FROM usuarios
                WHERE email = $1
                `,
                [usuario.email]
            );


            if (existe.rows.length > 0) {

                console.log(
                    `El usuario ${usuario.email} ya existe.`
                );

                continue;

            }


            // =====================================
            // GENERAR CONTRASEÑA ENCRIPTADA
            // =====================================

            const hash = await bcrypt.hash(
                usuario.password,
                10
            );


            // =====================================
            // CREAR USUARIO
            // =====================================

            await pool.query(
                `
                INSERT INTO usuarios
                (
                    nombre,
                    apellido,
                    email,
                    password,
                    rol,
                    estado
                )
                VALUES
                ($1,$2,$3,$4,'Usuario','Activo')
                `,
                [
                    usuario.nombre,
                    usuario.apellido,
                    usuario.email,
                    hash
                ]
            );


            console.log(
                `Usuario ${usuario.email} creado correctamente.`
            );

        }


        console.log(
            "Proceso de creación de usuarios finalizado."
        );


        process.exit();


    } catch (error) {

        console.error(
            "Error creando usuarios:",
            error
        );

        process.exit(1);

    }

}


crearUsuarios();