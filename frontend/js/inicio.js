const API_BASE_URL = "https://sigem-backend.onrender.com";


// ==========================================
// ELEMENTOS
// ==========================================

const totalAlumnos =
    document.getElementById("totalAlumnos");

const totalInstructores =
    document.getElementById("totalInstructores");

const totalInstrumento =
    document.getElementById("totalInstrumento");

const totalTeoria =
    document.getElementById("totalTeoria");


// ==========================================
// CARGAR RESUMEN
// ==========================================

async function cargarResumen() {

    try {

        const respuesta =
            await fetch(
                `${API_BASE_URL}/inicio/resumen`
            );


        if (!respuesta.ok) {

            throw new Error(
                "No se pudo obtener el resumen"
            );

        }


        const datos =
            await respuesta.json();


        // ======================================
        // MOSTRAR DATOS
        // ======================================

        totalAlumnos.textContent =
            datos.alumnosActivos;

        totalInstructores.textContent =
            datos.instructoresActivos;

        totalInstrumento.textContent =
            datos.alumnosInstrumento;

        totalTeoria.textContent =
            datos.alumnosTeoria;


    }
    catch (error) {

        console.error(
            "ERROR CARGANDO RESUMEN:",
            error
        );


        totalAlumnos.textContent = "—";
        totalInstructores.textContent = "—";
        totalInstrumento.textContent = "—";
        totalTeoria.textContent = "—";

    }

}


// ==========================================
// INICIAR
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    cargarResumen
);