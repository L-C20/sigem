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

app.use("/inicio", inicioRoutes);
app.use("/instructores-listado",instructoresListadoRoutes);
app.use("/teoria", teoria);
app.use("/filiales", filialesRoutes);
app.use("/instruccion-ministerial", instruccionMinisterialRoutes);
app.use("/cursadas-teoria", cursadasTeoriaRoutes);
app.use("/cursada-instrumento", cursadaInstrumentoRoutes);
app.use("/asistencias", asistenciasRoutes);
app.use("/alumnos", alumnosRoutes);
app.use("/instrumentos", instrumentosRoutes);
app.use("/niveles-instrumento", nivelesInstrumentoRoutes);
app.use("/niveles-teoria", nivelesTeoriaRoutes);
app.use("/instructores", instructoresRoutes);
app.listen(PORT, () => {
    console.log(`Servidor SIGEM activo en puerto ${PORT}`);
});
app.use("/auth", authRoutes);