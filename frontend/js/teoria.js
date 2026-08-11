const API_BASE_URL = "https://sigem-backend.onrender.com";


let datosTeoria = [];


// ===============================
// ELEMENTOS
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



        mostrarTeoria(
            datosTeoria
        );



        cargarFiltros();



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
// MOSTRAR TABLA
// ===============================


function mostrarTeoria(datos){



    const tbody =
    document.querySelector(
        "tbody"
    );



    tbody.innerHTML = "";



    datos.forEach(item=>{


        tbody.innerHTML +=
        `

        <tr>


            <td>
                ${item.nivel}
            </td>


            <td>
                ${item.alumno}
            </td>


            <td>
                ${item.instructor || "Sin asignar"}
            </td>


            <td>
                ${item.estado}
            </td>


            <td>

                <div class="action-group">

                    <a
                    class="action-link"
                    href="teoria-alumno.html?id=${item.id}">
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



    // NIVELES FIJOS

    const niveles = [

        "Nivel 1",
        "Nivel 2",
        "Nivel 3",
        "Nivel 4"

    ];



    niveles.forEach(nombre=>{


        filtroNivel.innerHTML +=
        `

        <option value="${nombre}">
            ${nombre}
        </option>

        `;


    });





    // INSTRUCTORES


    const instructores =
    [
        ...new Set(

            datosTeoria.map(
                item=>item.instructor
            )

        )
    ];



    instructores.forEach(nombre=>{


        if(nombre){


            filtroInstructor.innerHTML +=
            `

            <option value="${nombre}">
                ${nombre}
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
    datosTeoria.filter(item=>{


        return (



            item.alumno
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



    mostrarTeoria(resultado);



}






// ===============================
// LIMPIAR FILTROS
// ===============================


function limpiarFiltros(){



    buscarAlumno.value = "";


    filtroNivel.value = "";


    filtroInstructor.value = "";


    filtroEstado.value = "";



    mostrarTeoria(
        datosTeoria
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





function editarTeoria(id){


    window.location.href =
    `teoria-alumno.html?id=${id}`;


}