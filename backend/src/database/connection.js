const { Pool } = require("pg");
require("dotenv").config();

const pool = process.env.DATABASE_URL
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
        // Sin SSL en la red interna de Railway y en local
        // (tunel); con SSL laxo para cualquier otro destino
        ssl: /railway\.internal|127\.0\.0\.1|localhost/
            .test(process.env.DATABASE_URL)
            ? false
            : { rejectUnauthorized: false }
    })
    : new Pool({
        user: process.env.SUPABASE_DB_USER,
        host: process.env.SUPABASE_DB_HOST,
        database: process.env.SUPABASE_DB_NAME,
        password: process.env.SUPABASE_DB_PASSWORD,
        port: process.env.SUPABASE_DB_PORT,
        ssl: { rejectUnauthorized: false }
    });

pool.query("select 1")
    .then(() => console.log("Base de datos SIGEM conectada"))
    .catch(error => console.log("Error conexión:", error));

module.exports = pool;
