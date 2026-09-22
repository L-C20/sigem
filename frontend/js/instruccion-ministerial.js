const API_BASE_URL = "";


let datosMinisterial = [];


// ===============================
// ELEMENTOS
// ===============================


const buscarAlumno =
document.getElementById("buscarAlumno");


const filtroFilial =
document.getElementById("filtroFilial");


const btnLimpiarFiltros =
document.getElementById("btnLimpiarFiltros");




// ===============================
// INICIO
// ===============================


document.addEventListener(
"DOMContentLoaded",
async()=>{


    await cargarMinisterial();


    cargarEventosFiltros();


});




// ===============================
// CARGAR INSTRUCCION MINISTERIAL
// ===============================


async function cargarMinisterial(){


    try{


        const respuesta =
        await fetch(
            `${API_BASE_URL}/instruccion-ministerial`
        );


        datosMinisterial =
        await respuesta.json();


        mostrarMinisterial(
            datosMinisterial
        );


        cargarFiltros();


    }
    catch(error){


        console.error(error);


        mostrarNotificacion(
            "Error cargando instrucción ministerial",
            "error"
        );


    }


}




// ===============================
// MOSTRAR TABLA
// ===============================


function mostrarMinisterial(datos){


    const tbody =
    document.querySelector(
        "tbody"
    );


    tbody.innerHTML = "";


    if(datos.length === 0){


        tbody.innerHTML =
        `

        <tr>
            <td colspan="5" class="empty-state">
                Sin alumnos en instrucción ministerial.
            </td>
        </tr>

        `;


        return;


    }


    datos.forEach(item=>{


        tbody.innerHTML +=
        `

        <tr>


            <td>
                ${escaparHTML(item.alumno)}
            </td>


            <td>
                ${escaparHTML(item.filial || "Sin filial")}
            </td>


            <td>
                ${formatearFecha(item.fecha_inicio)}
            </td>


            <td>
                ${etiquetaEstado(item.estado)}
            </td>


            <td>

                <div class="action-group">

                    <a
                    class="action-link"
                    href="alumno.html?id=${item.alumno_id}">
                        Ver/Editar
                    </a>

                </div>

            </td>


        </tr>


        `;


    });


}




// ===============================
// CARGAR FILTROS
// ===============================


function cargarFiltros(){


    const filiales =
    [
        ...new Set(

            datosMinisterial.map(
                item=>item.filial
            )

        )
    ].sort();


    filiales.forEach(nombre=>{


        if(nombre){


            filtroFilial.innerHTML +=
            `

            <option value="${escaparHTML(nombre)}">
                ${escaparHTML(nombre)}
            </option>

            `;


        }


    });


}




// ===============================
// FILTROS
// ===============================


function aplicarFiltros(){


    const resultado =
    datosMinisterial.filter(item=>{


        return (


            item.alumno
            .toLowerCase()
            .includes(
                buscarAlumno.value.toLowerCase()
            )


            &&


            (
                filtroFilial.value === ""
                ||
                item.filial === filtroFilial.value
            )


        );


    });


    mostrarMinisterial(resultado);


}




// ===============================
// LIMPIAR FILTROS
// ===============================


function limpiarFiltros(){


    buscarAlumno.value = "";


    filtroFilial.value = "";


    mostrarMinisterial(
        datosMinisterial
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


    if(filtroFilial){


        filtroFilial.addEventListener(
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
// FORMATEAR FECHA
// ===============================


function formatearFecha(valor){


    if(!valor){


        return "Sin fecha";


    }


    const fecha =
    new Date(valor);


    return fecha.toLocaleDateString(
        "es-AR",
        {
            timeZone:"UTC"
        }
    );


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
