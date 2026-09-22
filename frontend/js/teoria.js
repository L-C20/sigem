const API_BASE_URL = "";


// ===============================
// DATOS
// ===============================

let datosTeoria = [];

let nivelActual = "";



// ===============================
// VISTAS
// ===============================

const vistaNiveles =
document.getElementById("vistaNiveles");


const vistaAlumnos =
document.getElementById("vistaAlumnos");


const tarjetasNiveles =
document.getElementById("tarjetasNiveles");


const tituloNivel =
document.getElementById("tituloNivel");


const volverNiveles =
document.getElementById("volverNiveles");



// ===============================
// FILTROS
// ===============================

const buscarAlumno =
document.getElementById("buscarAlumno");


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


    await cargarTeoria();


    cargarEventosFiltros();


});




// ===============================
// CARGAR TEORIA
// ===============================

async function cargarTeoria(){


    try{


        const respuesta =
        await fetch(
            `${API_BASE_URL}/cursadas-teoria`
        );


        datosTeoria =
        await respuesta.json();


        mostrarTarjetas();


    }
    catch(error){


        console.error(error);


        mostrarNotificacion(
            "Error cargando teoría",
            "error"
        );


    }


}




// ===============================
// MOSTRAR TARJETAS
// ===============================

function mostrarTarjetas(){


    const conteo = new Map();


    datosTeoria.forEach(item=>{


        const nombre =
        item.nivel || "Sin nivel";


        conteo.set(
            nombre,
            (conteo.get(nombre) || 0) + 1
        );


    });


    const niveles =
    [...conteo.keys()].sort(
        (a,b)=>a.localeCompare(b,"es",{numeric:true})
    );


    if(niveles.length === 0){


        tarjetasNiveles.innerHTML =
        `
        <p class="empty-state">
            Sin cursadas cargadas.
        </p>
        `;


        return;


    }


    tarjetasNiveles.innerHTML = "";


    niveles.forEach(nombre=>{


        const cantidad =
        conteo.get(nombre);


        tarjetasNiveles.innerHTML +=
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
                class="button abrirNivel"
                data-nivel="${escaparHTML(nombre)}">
                Ingresar
            </button>

        </div>

        `;


    });


    document.querySelectorAll(
        ".abrirNivel"
    ).forEach(boton=>{


        boton.addEventListener(
            "click",
            ()=>{


                abrirNivel(
                    boton.dataset.nivel
                );


            }
        );


    });


}




// ===============================
// ABRIR NIVEL
// ===============================

function abrirNivel(nombre){


    nivelActual = nombre;


    tituloNivel.textContent = nombre;


    vistaNiveles.classList.add("hidden");


    vistaAlumnos.classList.remove("hidden");


    limpiarValoresFiltros();


    cargarFiltros();


    mostrarAlumnos(
        alumnosDelNivel()
    );


}




// ===============================
// VOLVER
// ===============================

if(volverNiveles){


    volverNiveles.addEventListener(
        "click",
        ()=>{


            vistaAlumnos.classList.add("hidden");


            vistaNiveles.classList.remove("hidden");


        }
    );


}




// ===============================
// ALUMNOS DEL NIVEL
// ===============================

function alumnosDelNivel(){


    return datosTeoria.filter(item=>


        (item.nivel || "Sin nivel")
        === nivelActual


    );


}




// ===============================
// MOSTRAR TABLA
// ===============================

function mostrarAlumnos(datos){


    const tabla =
    document.getElementById("tablaAlumnos");


    tabla.innerHTML = "";


    if(datos.length === 0){


        tabla.innerHTML =
        `
        <tr>
            <td colspan="4" class="empty-state">
                Sin alumnos para mostrar.
            </td>
        </tr>
        `;


        return;


    }


    datos.forEach(item=>{


        tabla.innerHTML +=
        `

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
                ${botonesAccion({
                    ficha: `teoria-alumno.html?id=${item.id}`,
                    nombre: item.alumno
                })}
            </td>


        </tr>

        `;


    });


}




// ===============================
// CARGAR FILTROS
// ===============================

function cargarFiltros(){


    const alumnos =
    alumnosDelNivel();


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
    alumnosDelNivel().filter(item=>{


        return (


            String(item.alumno || "")
            .toLowerCase()
            .includes(
                buscarAlumno.value.toLowerCase()
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


    filtroInstructor.value = "";


    filtroEstado.value = "";


}


function limpiarFiltros(){


    limpiarValoresFiltros();


    mostrarAlumnos(
        alumnosDelNivel()
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
