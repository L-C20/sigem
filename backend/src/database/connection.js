const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({

    user: process.env.SUPABASE_DB_USER,

    host: process.env.SUPABASE_DB_HOST,

    database: process.env.SUPABASE_DB_NAME,

    password: process.env.SUPABASE_DB_PASSWORD,

    port: process.env.SUPABASE_DB_PORT,

    ssl: {
        rejectUnauthorized: false
    }

});

pool.connect()
    .then(() => console.log("Base de datos SIGEM conectada a Supabase"))
    .catch(error => console.log("Error conexión:", error));

module.exports = pool;