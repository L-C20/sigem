const API = "";


// ===============================
// DATOS
// ===============================

let misNiveles = [];

let nivelActual = null;

let listaAsistencia = [];




// ===============================
// INICIO
// ===============================

document.addEventListener(
"DOMContentLoaded",
async()=>{


    const yo = obtenerUsuario();


    if(yo){


        document.getElementById("bienvenida").textContent =
        "Hola, " + yo.nombre + ".";


    }


    await cargarNiveles();


    cargarEventos();


});




// ===============================
// MIS NIVELES
// ===============================

async function cargarNiveles(){


    try{


        const respuesta =
        await fetch(`${API}/mi-espacio/resumen`);


        if(respuesta.status === 403){


            mostrarSinCursos();


            return;


        }


        if(!respuesta.ok){


            throw new Error("respuesta " + respuesta.status);


        }


        misNiveles =
        await respuesta.json();


        mostrarNiveles();


    }
    catch(error){


        console.error(error);


        mostrarNotificacion(
            "Error cargando tus cursos",
            "error"
        );


    }


}




function mostrarSinCursos(){


    document.getElementById("tarjetasNiveles").innerHTML =
    `
    <p class="empty-state">
        Tu cuenta todavía no está vinculada a ningún curso.
        Pedile al administrador que te asigne uno.
    </p>
    `;


}




function mostrarNiveles(){


    const contenedor =
    document.getElementById("tarjetasNiveles");


    if(misNiveles.length === 0){


        mostrarSinCursos();


        return;


    }


    contenedor.innerHTML =
    misNiveles.map(nivel=>`

        <div class="card card-asistencia instrumento-card">

            <h2>
                ${escaparHTML(nivel.nivel)}
            </h2>

            <p>
                ${nivel.alumnos}
                ${Number(nivel.alumnos) === 1 ? "alumno" : "alumnos"}
                · ${escaparHTML(String(nivel.anio))}
            </p>

            <button
                class="button abrirNivel"
                data-nivel="${nivel.nivel_id}">
                Ingresar
            </button>

        </div>

    `).join("");


    document.querySelectorAll(".abrirNivel")
        .forEach(boton=>{


            boton.addEventListener(
                "click",
                ()=>abrirNivel(Number(boton.dataset.nivel))
            );


        });


}




// ===============================
// ABRIR UN NIVEL
// ===============================

function abrirNivel(nivelId){


    nivelActual =
    misNiveles.find(n=>Number(n.nivel_id) === nivelId);


    document.getElementById("tituloNivel").textContent =
    nivelActual.nivel;


    document.getElementById("titulo").textContent =
    nivelActual.nivel;


    document.getElementById("vistaNiveles")
        .classList.add("hidden");


    document.getElementById("vistaNivel")
        .classList.remove("hidden");


    // Arranca en el dia de hoy
    document.getElementById("fechaClase").value =
    fechaDeHoy();


    cargarAsistencia();


}




function volver(){


    nivelActual = null;


    document.getElementById("titulo").textContent =
    "Mis cursos";


    document.getElementById("vistaNivel")
        .classList.add("hidden");


    document.getElementById("vistaNiveles")
        .classList.remove("hidden");


}




// ===============================
// ASISTENCIA
// ===============================

async function cargarAsistencia(){


    const fecha =
    document.getElementById("fechaClase").value;


    if(!nivelActual || !fecha){


        return;


    }


    try{


        const respuesta = await fetch(
            `${API}/mi-espacio/asistencia/${nivelActual.nivel_id}`
            + `?fecha=${encodeURIComponent(fecha)}`
        );


        const datos = await respuesta.json();


        // Si mientras viajaba la respuesta cambiaron la
        // fecha, esta llega tarde: la descartamos. Si no,
        // podria pisar la lista de la fecha nueva.

        if(document.getElementById("fechaClase").value !== fecha){


            return;


        }


        if(!respuesta.ok){


            mostrarNotificacion(
                datos.error || "No se pudo cargar la asistencia",
                "error"
            );


            return;


        }


        listaAsistencia = datos;


        mostrarAsistencia();


    }
    catch(error){


        console.error(error);


        mostrarNotificacion(
            "Error cargando la asistencia",
            "error"
        );


    }


}




function mostrarAsistencia(){


    const tabla =
    document.getElementById("tablaAsistencia");


    if(listaAsistencia.length === 0){


        tabla.innerHTML =
        `
        <tr>
            <td colspan="3" class="empty-state">
                No hay alumnos activos en este curso.
            </td>
        </tr>
        `;


        document.getElementById("resumenAsistencia").textContent = "";


        return;


    }


    tabla.innerHTML =
    listaAsistencia.map(item=>`

        <tr>

            <td>
                ${escaparHTML(item.apellido)},
                ${escaparHTML(item.nombre)}
            </td>

            <td>
                ${escaparHTML(item.filial || "—")}
            </td>

            <td>
                <input
                    type="checkbox"
                    class="marca-presente"
                    data-cursada="${item.cursada_id}"
                    ${item.presente === true ? "checked" : ""}>
            </td>

        </tr>

    `).join("");


    document.querySelectorAll(".marca-presente")
        .forEach(caja=>{


            caja.addEventListener("change", actualizarResumen);


        });


    actualizarResumen();


}




function actualizarResumen(){


    const cajas =
    [...document.querySelectorAll(".marca-presente")];


    const presentes =
    cajas.filter(caja=>caja.checked).length;


    document.getElementById("resumenAsistencia").textContent =
    presentes + " de " + cajas.length + " presentes";


}




async function guardarAsistencia(){


    const fecha =
    document.getElementById("fechaClase").value;


    if(!nivelActual || !fecha){


        mostrarNotificacion(
            "Elegí una fecha",
            "error"
        );


        return;


    }


    const asistencias =
    [...document.querySelectorAll(".marca-presente")]
        .map(caja=>({
            cursada_id: Number(caja.dataset.cursada),
            presente:   caja.checked
        }));


    try{


        const respuesta = await fetch(
            `${API}/mi-espacio/asistencia/${nivelActual.nivel_id}`,
            {
                method:"POST",
                headers:{ "Content-Type":"application/json" },
                body: JSON.stringify({ fecha, asistencias })
            }
        );


        const datos = await respuesta.json();


        if(!respuesta.ok){


            mostrarNotificacion(
                datos.error || "No se pudo guardar",
                "error"
            );


            return;


        }


        mostrarNotificacion(
            "Asistencia guardada (" + datos.guardadas + " alumnos)",
            "exito"
        );


    }
    catch(error){


        console.error(error);


        mostrarNotificacion(
            "Error guardando la asistencia",
            "error"
        );


    }


}




// ===============================
// EVENTOS
// ===============================

function cargarEventos(){


    document
        .getElementById("volverNiveles")
        .addEventListener("click", volver);


    document
        .getElementById("fechaClase")
        .addEventListener("change", cargarAsistencia);


    document
        .getElementById("btnGuardarAsistencia")
        .addEventListener("click", guardarAsistencia);


    document
        .getElementById("btnTodosPresentes")
        .addEventListener("click", ()=>{


            document.querySelectorAll(".marca-presente")
                .forEach(caja=>{ caja.checked = true; });


            actualizarResumen();


        });


}




// ===============================
// AYUDAS
// ===============================

// El date del navegador espera AAAA-MM-DD en hora local;
// toISOString daria UTC y a la noche cambiaria de dia

function fechaDeHoy(){


    const hoy = new Date();


    const mes =
    String(hoy.getMonth() + 1).padStart(2, "0");


    const dia =
    String(hoy.getDate()).padStart(2, "0");


    return hoy.getFullYear() + "-" + mes + "-" + dia;


}




function escaparHTML(valor){


    return String(
        valor ?? ""
    )

        .replaceAll("&","&amp;")

        .replaceAll("<","&lt;")

        .replaceAll(">","&gt;")

        .replaceAll('"',"&quot;")

        .replaceAll("'","&#39;");


}
