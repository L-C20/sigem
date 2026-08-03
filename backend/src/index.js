const express = require("express");
const cors = require("cors");

require("./database/connection");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("SIGEM funcionando correctamente");
});

const cursadasTeoriaRoutes = require("./routes/cursadasTeoria");
const alumnosRoutes = require("./routes/alumnos");
const instrumentosRoutes = require("./routes/instrumentos");
const nivelesInstrumentoRoutes = require("./routes/nivelesInstrumento");
const nivelesTeoriaRoutes = require("./routes/nivelesTeoria");
const instructoresRoutes = require("./routes/instructores");
const filialesRoutes = require("./routes/filiales");
const cursadaInstrumentoRoutes = require("./routes/cursadaInstrumento");
const instruccionMinisterialRoutes = require("./routes/instruccionMinisterial");

app.use("/filiales", filialesRoutes);
app.use("/instruccion-ministerial", instruccionMinisterialRoutes);
app.use("/cursadas-teoria", cursadasTeoriaRoutes);
app.use("/cursada-instrumento", cursadaInstrumentoRoutes);
app.use("/alumnos", alumnosRoutes);
app.use("/instrumentos", instrumentosRoutes);
app.use("/niveles-instrumento", nivelesInstrumentoRoutes);
app.use("/niveles-teoria", nivelesTeoriaRoutes);
app.use("/instructores", instructoresRoutes);
app.listen(PORT, () => {
    console.log(`Servidor SIGEM activo en puerto ${PORT}`);
});