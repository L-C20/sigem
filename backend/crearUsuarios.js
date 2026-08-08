const bcrypt = require("bcrypt");
const pool = require("./src/database/connection");


async function crearUsuarios(){

    try{

        const usuarios = [
            {
                nombre:"Lucas",
                apellido:"Lo Bianco",
                email:"lucaslobianco78@gmail.com",
                password:"Lucas2026!",
            },
            {
                nombre:"Cesia",
                apellido:"Vargas",
                email:"profecesiamusica@gmail.com",
                password:"Cesia2026!",
            }
        ];


        for(const usuario of usuarios){

            const hash = await bcrypt.hash(
                usuario.password,
                10
            );


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

        }


        console.log("Usuarios creados correctamente");

        process.exit();


    }catch(error){

        console.error(error);

        process.exit(1);

    }

}


crearUsuarios();