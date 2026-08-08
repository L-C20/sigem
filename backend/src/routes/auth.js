const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const pool = require("../database/connection");


const SECRET = "SIGEM_SECRET_KEY";


router.post("/login", async (req,res)=>{

    try{

        const {email,password} = req.body;


        const resultado = await pool.query(
            `
            SELECT *
            FROM usuarios
            WHERE email = $1
            AND estado = 'Activo'
            `,
            [email]
        );


        if(resultado.rows.length === 0){

            return res.status(401).json({
                error:"Usuario no encontrado"
            });

        }


        const usuario = resultado.rows[0];


        const coincide = await bcrypt.compare(
            password,
            usuario.password
        );


        if(!coincide){

            return res.status(401).json({
                error:"Contraseña incorrecta"
            });

        }


        const token = jwt.sign(
            {
                id:usuario.id,
                email:usuario.email,
                rol:usuario.rol
            },
            SECRET,
            {
                expiresIn:"8h"
            }
        );


        res.json({

            mensaje:"Login correcto",

            token,

            usuario:{
                id:usuario.id,
                nombre:usuario.nombre,
                apellido:usuario.apellido,
                rol:usuario.rol
            }

        });


    }
    catch(error){

        console.error(error);

        res.status(500).json({
            error:"Error en login"
        });

    }

});


module.exports = router;