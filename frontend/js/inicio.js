const API_BASE_URL = "";


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

const totalInstruccionMinisterial =
document.getElementById("totalInstruccionMinisterial");

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

        totalInstruccionMinisterial.textContent =
            datos.instruccionMinisterial;


        // ======================================
        // CONTEXTO
        // ======================================

        // Un número solo no dice nada: 83 puede ser mucho
        // o poco. Al lado de sobre cuántos, sí dice.

        const activos = datos.alumnosActivos;


        contexto(
            totalAlumnos,
            datos.alumnosRegistrados
                ? "de " + datos.alumnosRegistrados + " registrados"
                : "alumnos con cursada activa",
            datos.alumnosRegistrados
                ? activos / datos.alumnosRegistrados
                : null
        );


        contexto(
            totalInstructores,
            "instructores en actividad",
            null
        );


        contexto(
            totalInstrumento,
            porcentaje(datos.alumnosInstrumento, activos),
            activos ? datos.alumnosInstrumento / activos : null
        );


        contexto(
            totalTeoria,
            porcentaje(datos.alumnosTeoria, activos),
            activos ? datos.alumnosTeoria / activos : null
        );


        contexto(
            totalInstruccionMinisterial,
            porcentaje(datos.instruccionMinisterial, activos),
            activos ? datos.instruccionMinisterial / activos : null
        );


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
        totalInstruccionMinisterial.textContent = "—";

    }

}


// ==========================================
// INICIAR
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    cargarResumen
);




// ==========================================
// CONTEXTO DE CADA CIFRA
// ==========================================

// Escribe la bajada de la tarjeta y, si corresponde,
// dibuja una barra con la proporción sobre el total.

function contexto(elemento, texto, proporcion){


    const tarjeta = elemento.parentElement;


    if(!tarjeta){


        return;


    }


    const bajada =
    tarjeta.querySelector(".dashboard-card-description");


    if(bajada){


        bajada.textContent = texto;


    }


    if(proporcion === null || proporcion === undefined){


        return;


    }


    let barra =
    tarjeta.querySelector(".dashboard-barra");


    if(!barra){


        barra = document.createElement("div");

        barra.className = "dashboard-barra";

        barra.innerHTML = "<span></span>";

        tarjeta.appendChild(barra);


    }


    barra.querySelector("span").style.width =
    Math.min(100, Math.round(proporcion * 100)) + "%";


}




function porcentaje(parte, total){


    if(!total){


        return "sin alumnos activos";


    }


    return Math.round((parte / total) * 100)
        + "% de los alumnos activos";


}
