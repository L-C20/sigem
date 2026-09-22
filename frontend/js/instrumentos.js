console.log("Instrumentos cargado");


const API = "";


// ===============================
// DATOS
// ===============================

let datosInstrumentos = [];

let instrumentoActual = "";



// ===============================
// VISTAS
// ===============================

const vistaInstrumentos =
document.getElementById("vistaInstrumentos");


const vistaAlumnos =
document.getElementById("vistaAlumnos");


const tarjetasInstrumentos =
document.getElementById("tarjetasInstrumentos");


const tituloInstrumento =
document.getElementById("tituloInstrumento");


const volverInstrumentos =
document.getElementById("volverInstrumentos");



// ===============================
// FILTROS
// ===============================

const buscarAlumno =
document.getElementById("buscarAlumno");


const filtroNivel =
document.getElementById("filtroNivel");


const filtroInstructor =
document.getElementById("filtroInstructor");


const filtroEstado =
document.getElementById("filtroEstado");


const btnLimpiarFiltros =
document.getElementById("btnLimpiarFiltros");




// ===============================
// INICIO
// ===============================

document.addEventListener(
"DOMContentLoaded",
async()=>{


    await cargarInstrumentos();


    cargarEventosFiltros();


});




// ===============================
// CARGAR INSTRUMENTOS
// ===============================

async function cargarInstrumentos(){


    try{


        const respuesta = await fetch(
            `${API}/instrumentos/cursadas`
        );


        datosInstrumentos =
        await respuesta.json();


        mostrarTarjetas();


    }
    catch(error){


        console.error(error);


        mostrarNotificacion(
            "Error cargando instrumentos",
            "error"
        );


    }


}




// ===============================
// MOSTRAR TARJETAS
// ===============================

function mostrarTarjetas(){


    const conteo = new Map();


    datosInstrumentos.forEach(item=>{


        const nombre =
        item.instrumento || "Sin instrumento";


        conteo.set(
            nombre,
            (conteo.get(nombre) || 0) + 1
        );


    });


    const instrumentos =
    [...conteo.keys()].sort(
        (a,b)=>a.localeCompare(b,"es")
    );


    if(instrumentos.length === 0){


        tarjetasInstrumentos.innerHTML =
        `
        <p class="empty-state">
            Sin instrumentos cargados.
        </p>
        `;


        return;


    }


    tarjetasInstrumentos.innerHTML = "";


    instrumentos.forEach(nombre=>{


        const cantidad =
        conteo.get(nombre);


        tarjetasInstrumentos.innerHTML +=
        `

        <div class="card card-asistencia instrumento-card">

            <h2>
                ${escaparHTML(nombre)}
            </h2>

            <p>
                ${cantidad}
                ${cantidad === 1 ? "alumno" : "alumnos"}
            </p>

            <button
                class="button abrirInstrumento"
                data-instrumento="${escaparHTML(nombre)}">
                Ingresar
            </button>

        </div>

        `;


    });


    document.querySelectorAll(
        ".abrirInstrumento"
    ).forEach(boton=>{


        boton.addEventListener(
            "click",
            ()=>{


                abrirInstrumento(
                    boton.dataset.instrumento
                );


            }
        );


    });


}




// ===============================
// ABRIR INSTRUMENTO
// ===============================

function abrirInstrumento(nombre){


    instrumentoActual = nombre;


    tituloInstrumento.textContent = nombre;


    vistaInstrumentos.classList.add("hidden");


    vistaAlumnos.classList.remove("hidden");


    limpiarValoresFiltros();


    cargarFiltros();


    mostrarAlumnos(
        alumnosDelInstrumento()
    );


}




// ===============================
// VOLVER
// ===============================

if(volverInstrumentos){


    volverInstrumentos.addEventListener(
        "click",
        ()=>{


            vistaAlumnos.classList.add("hidden");


            vistaInstrumentos.classList.remove("hidden");


        }
    );


}




// ===============================
// ALUMNOS DEL INSTRUMENTO
// ===============================

function alumnosDelInstrumento(){


    return datosInstrumentos.filter(item=>


        (item.instrumento || "Sin instrumento")
        === instrumentoActual


    );


}




// ===============================
// MOSTRAR ALUMNOS POR NIVEL
// ===============================

function mostrarAlumnos(datos){


    const contenedor =
    document.getElementById("gruposNiveles");


    contenedor.innerHTML = "";


    if(datos.length === 0){


        contenedor.innerHTML =
        `
        <p class="empty-state">
            Sin alumnos para mostrar.
        </p>
        `;


        return;


    }


    agruparPorNivel(datos).forEach(grupo=>{


        contenedor.innerHTML +=
        `

        <details class="grupo-nivel" open>

            <summary>

                <span class="grupo-nivel-titulo">
                    ${escaparHTML(grupo.nivel)}
                </span>

                <span class="grupo-nivel-conteo">
                    ${grupo.alumnos.length}
                    ${grupo.alumnos.length === 1 ? "alumno" : "alumnos"}
                </span>

            </summary>

            <div class="table-wrapper">

                <table>

                    <thead>
                        <tr>
                            <th>Alumno</th>
                            <th>Instructor</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${grupo.alumnos.map(filaAlumno).join("")}
                    </tbody>

                </table>

            </div>

        </details>

        `;


    });


}




// ===============================
// AGRUPAR POR NIVEL
// ===============================

// Los niveles se ordenan por su id (1 a 6 y luego
// Perfeccionamiento); los que no tienen nivel van al final

function agruparPorNivel(datos){


    const grupos = new Map();


    datos.forEach(item=>{


        const clave =
        item.nivel_instrumento_id ?? Number.MAX_SAFE_INTEGER;


        if(!grupos.has(clave)){


            grupos.set(clave, {
                orden: clave,
                nivel: item.nivel || "Sin nivel",
                alumnos: []
            });


        }


        grupos.get(clave).alumnos.push(item);


    });


    return [...grupos.values()].sort(
        (a,b)=>a.orden - b.orden
    );


}




// ===============================
// FILA DE ALUMNO
// ===============================

function filaAlumno(item){


    return `

    <tr>


        <td>
            ${escaparHTML(item.alumno)}
        </td>


        <td>
            ${escaparHTML(item.instructor || "Sin asignar")}
        </td>


        <td>
            ${etiquetaEstado(item.estado)}
        </td>


        <td>

            <div class="action-group">

                <a
                class="action-link"
                href="instrumento.html?id=${item.id}">
                    Ver/Editar
                </a>

            </div>

        </td>


    </tr>

    `;


}




// ===============================
// CARGAR FILTROS
// ===============================

function cargarFiltros(){


    const alumnos =
    alumnosDelInstrumento();


    llenarSelect(
        filtroNivel,
        alumnos.map(item=>item.nivel)
    );


    llenarSelect(
        filtroInstructor,
        alumnos.map(item=>item.instructor)
    );


}




// ===============================
// LLENAR SELECT
// ===============================

function llenarSelect(select, valores){


    if(!select){


        return;


    }


    const opciones =
    [...new Set(valores)]

        .filter(valor=>valor)

        .sort(
            (a,b)=>String(a).localeCompare(String(b),"es")
        );


    select.innerHTML =
    `
    <option value="">
        Todos
    </option>
    `;


    opciones.forEach(valor=>{


        select.innerHTML +=
        `
        <option value="${escaparHTML(valor)}">
            ${escaparHTML(valor)}
        </option>
        `;


    });


}




// ===============================
// FILTROS
// ===============================

function aplicarFiltros(){


    const resultado =
    alumnosDelInstrumento().filter(item=>{


        return (


            String(item.alumno || "")
            .toLowerCase()
            .includes(
                buscarAlumno.value.toLowerCase()
            )


            &&


            (
                filtroNivel.value === ""
                ||
                item.nivel === filtroNivel.value
            )


            &&


            (
                filtroInstructor.value === ""
                ||
                item.instructor === filtroInstructor.value
            )


            &&


            (
                filtroEstado.value === ""
                ||
                item.estado === filtroEstado.value
            )


        );


    });


    mostrarAlumnos(resultado);


}




// ===============================
// LIMPIAR FILTROS
// ===============================

function limpiarValoresFiltros(){


    buscarAlumno.value = "";


    filtroNivel.value = "";


    filtroInstructor.value = "";


    filtroEstado.value = "";


}


function limpiarFiltros(){


    limpiarValoresFiltros();


    mostrarAlumnos(
        alumnosDelInstrumento()
    );


}




// ===============================
// EVENTOS
// ===============================

function cargarEventosFiltros(){


    if(buscarAlumno){


        buscarAlumno.addEventListener(
            "input",
            aplicarFiltros
        );


    }


    if(filtroNivel){


        filtroNivel.addEventListener(
            "change",
            aplicarFiltros
        );


    }


    if(filtroInstructor){


        filtroInstructor.addEventListener(
            "change",
            aplicarFiltros
        );


    }


    if(filtroEstado){


        filtroEstado.addEventListener(
            "change",
            aplicarFiltros
        );


    }


    if(btnLimpiarFiltros){


        btnLimpiarFiltros.addEventListener(
            "click",
            limpiarFiltros
        );


    }


}




// ===============================
// ESCAPAR HTML
// ===============================

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


// ===============================
// ETIQUETA DE ESTADO
// ===============================

function etiquetaEstado(estado){


    const texto = estado || "Sin estado";


    const clase =
    texto === "Activo"
        ? "estado-activo"
        : "estado-inactivo";


    return `
    <span class="estado ${clase}">
        ${escaparHTML(texto)}
    </span>
    `;


}
