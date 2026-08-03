const express = require("express");
const router = express.Router();

const pool = require("../database/connection");


router.get("/", async (req,res)=>{

    try{

        const resultado = await pool.query(
            `
            SELECT *
            FROM niveles_instrumento
            ORDER BY id
            `
        );


        res.json(resultado.rows);


    }catch(error){

        console.error(error);

        res.status(500).json({
            error:"Error al obtener niveles"
        });

    }

});


module.exports = router;