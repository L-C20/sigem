const { Pool } = require("pg");
require("dotenv").config();

const pool = process.env.DATABASE_URL
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL.includes("railway.internal")
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
