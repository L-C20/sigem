console.log("Instrumentos cargado");


const API = "http://localhost:3000";


// ===============================
// DATOS
// ===============================

let datosInstrumentos = [];



// ===============================
// FILTROS
// ===============================

const buscarAlumno =
document.getElementById("buscarAlumno");


const filtroInstrumento =
document.getElementById("filtroInstrumento");


const filtroNivel =
document.getElementById("filtroNivel");


const filtroInstructor =
document.getElementById("filtroInstructor");


const filtroEstado =
document.getElementById("filtroEstado");

const btnLimpiarFiltros =
document.getElementById("btnLimpiarFiltros");


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



        mostrarInstrumentos(
            datosInstrumentos
        );

        cargarFiltros();


    }
    catch(error){


        console.error(error);


    }


}





// ===============================
// MOSTRAR TABLA
// ===============================


function mostrarInstrumentos(datos){



    const tabla =
    document.querySelector("tbody");



    tabla.innerHTML = "";



    datos.forEach(item=>{


        tabla.innerHTML += `


        <tr>


            <td>
                ${item.instrumento}
            </td>


            <td>
                ${item.alumno}
            </td>


            <td>
                ${item.instructor}
            </td>


            <td>
                ${item.nivel}
            </td>


            <td>
                ${item.estado}
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



    });



}






// ===============================
// INICIO
// ===============================


document.addEventListener(
"DOMContentLoaded",
()=>{


    cargarInstrumentos();


});

function cargarFiltros(){


    // Instrumentos

    const instrumentos =
    [...new Set(
        datosInstrumentos.map(
            item => item.instrumento
        )
    )];


    instrumentos.forEach(nombre=>{

        filtroInstrumento.innerHTML +=
        `
        <option value="${nombre}">
            ${nombre}
        </option>
        `;

    });



    // Niveles

    const niveles = [

    "Nivel 1",
    "Nivel 2",
    "Nivel 3",
    "Nivel 4",
    "Nivel 5",
    "Nivel 6",
    "Perfeccionamiento"

];


niveles.forEach(nombre=>{


    filtroNivel.innerHTML +=
    `
    <option value="${nombre}">
        ${nombre}
    </option>
    `;


});
    // Instructores

    const instructores =
    [...new Set(
        datosInstrumentos.map(
            item => item.instructor
        )
    )];


    instructores.forEach(nombre=>{

        filtroInstructor.innerHTML +=
        `
        <option value="${nombre}">
            ${nombre}
        </option>
        `;

    });


}

// ===============================
// EVENTOS DE FILTROS
// ===============================


buscarAlumno.addEventListener(
    "input",
    aplicarFiltros
);


filtroInstrumento.addEventListener(
    "change",
    aplicarFiltros
);


filtroNivel.addEventListener(
    "change",
    aplicarFiltros
);


filtroInstructor.addEventListener(
    "change",
    aplicarFiltros
);


filtroEstado.addEventListener(
    "change",
    aplicarFiltros
);




// ===============================
// APLICAR FILTROS
// ===============================


function aplicarFiltros(){


    const resultado =
    datosInstrumentos.filter(item=>{


        return (


            item.alumno
            .toLowerCase()
            .includes(
                buscarAlumno.value.toLowerCase()
            )



            &&



            (
                filtroInstrumento.value === ""
                ||
                item.instrumento === filtroInstrumento.value
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



    mostrarInstrumentos(resultado);


}

btnLimpiarFiltros.addEventListener(
    "click",
    limpiarFiltros
);

function limpiarFiltros(){


    buscarAlumno.value = "";


    filtroInstrumento.value = "";


    filtroNivel.value = "";


    filtroInstructor.value = "";


    filtroEstado.value = "";


    mostrarInstrumentos(
        datosInstrumentos
    );


}