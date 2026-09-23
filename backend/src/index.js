const express = require("express");
const cors = require("cors");
const path = require("path");

require("./database/connection");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(
    express.static(
        path.join(__dirname, "../../frontend")
    )
);

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "../../frontend/login.html"
        )
    );

});

const cursadasTeoriaRoutes = require("./routes/cursadasTeoria");
const alumnosRoutes = require("./routes/alumnos");
const asistenciasRoutes = require("./routes/asistencias");
const instrumentosRoutes = require("./routes/instrumentos");
const nivelesInstrumentoRoutes = require("./routes/nivelesInstrumento");
const nivelesTeoriaRoutes = require("./routes/nivelesTeoria");
const instructoresRoutes = require("./routes/instructores");
const filialesRoutes = require("./routes/filiales");
const cursadaInstrumentoRoutes = require("./routes/cursadaInstrumento");
const instruccionMinisterialRoutes = require("./routes/instruccionMinisterial");
const authRoutes = require("./routes/auth");
const teoria = require("./routes/teoria");
const instructoresListadoRoutes =
require("./routes/instructores-listado");
const inicioRoutes = require("./routes/inicio");
const usuariosRoutes = require("./routes/usuarios");
const miEspacioRoutes = require("./routes/miEspacio");
const academicoRoutes = require("./routes/academico");

const {
    verificarToken,
    permitirRoles
} = require("./middleware/autenticacion");

// Publica: es la puerta de entrada
app.use("/auth", authRoutes);


// De aca para abajo, todo exige token
app.use(verificarToken);


// El ABM de cuentas es solo del superadmin
app.use("/usuarios", usuariosRoutes);


// El espacio propio de cada instructor. No lleva filtro de
// rol: lo que importa no es el rol sino tener un instructor
// vinculado, y eso lo verifica el propio archivo. Asi Cesia,
// que es admin y ademas da clases, entra igual.
app.use("/mi-espacio", miEspacioRoutes);


// Vista academica de toda la escuela (superadmin y admin)
app.use("/academico", academicoRoutes);


// Todo lo demas es gestion de la escuela. El instructor no
// entra: sus datos los pide por /mi-espacio, ya recortados
// a su nivel.
const soloGestion = permitirRoles(
    "superadmin",
    "admin",
    "secretaria"
);


app.use("/inicio", soloGestion, inicioRoutes);
app.use("/instructores-listado", soloGestion, instructoresListadoRoutes);
app.use("/teoria", soloGestion, teoria);
app.use("/filiales", soloGestion, filialesRoutes);
app.use("/instruccion-ministerial", soloGestion, instruccionMinisterialRoutes);
app.use("/cursadas-teoria", soloGestion, cursadasTeoriaRoutes);
app.use("/cursada-instrumento", soloGestion, cursadaInstrumentoRoutes);
app.use("/asistencias", soloGestion, asistenciasRoutes);
app.use("/alumnos", soloGestion, alumnosRoutes);
app.use("/instrumentos", soloGestion, instrumentosRoutes);
app.use("/niveles-instrumento", soloGestion, nivelesInstrumentoRoutes);
app.use("/niveles-teoria", soloGestion, nivelesTeoriaRoutes);
app.use("/instructores", soloGestion, instructoresRoutes);

app.listen(PORT, () => {
    console.log(`Servidor SIGEM activo en puerto ${PORT}`);
});
