// ======================================
// SIGEM - filiales.js
// Gestión de filiales
// ======================================

const API_BASE_URL = "https://sigem-backend.onrender.com";


const btnNuevaFilial = document.getElementById("btnNuevaFilial");
const btnCancelar = document.getElementById("btnCancelar");

const formularioFilial = document.getElementById("formularioFilial");
const filialForm = document.getElementById("filialForm");

const tablaFiliales = document.getElementById("tablaFiliales");


//========================================

document.addEventListener("DOMContentLoaded", () => {

    cargarFiliales();

    btnNuevaFilial.addEventListener("click", abrirFormulario);

    btnCancelar.addEventListener("click", cerrarFormulario);

    filialForm.addEventListener("submit", guardarFilial);

});


//========================================

function abrirFormulario(){

    formularioFilial.classList.remove("hidden");

    document.getElementById("nombre").focus();

}


//========================================

function cerrarFormulario(){

    filialForm.reset();

    formularioFilial.classList.add("hidden");

}


//========================================

async function cargarFiliales(){

    try{

        const respuesta = await fetch(
            `${API_BASE_URL}/filiales`
        );


        if(!respuesta.ok){

            throw new Error(
                "Error al cargar filiales"
            );

        }


        const filiales = await respuesta.json();


        renderizarFiliales(filiales);


    }catch(error){

        console.error(error);


        tablaFiliales.innerHTML = `

        <tr>

            <td colspan="2">

                Error al cargar filiales

            </td>

        </tr>

        `;

    }

}


//========================================

async function guardarFilial(evento){

    evento.preventDefault();


    const datos = new FormData(filialForm);


    const filial = {

        nombre: datos.get("nombre").trim()

    };


    try{


        const respuesta = await fetch(
            `${API_BASE_URL}/filiales`,
            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json"

                },


                body:JSON.stringify(filial)

            }
        );



        if(!respuesta.ok){

            throw new Error(
                "No se pudo guardar"
            );

        }



        mostrarNotificacion(
    "Filial creada correctamente",
    "exito"
);


        cerrarFormulario();


        cargarFiliales();



    }catch(error){

        console.error(error);


        mostrarNotificacion(
            "Error al crear filial",
            "error"
        );

    }

}


//========================================

function renderizarFiliales(lista){


    tablaFiliales.innerHTML="";


    if(lista.length===0){


        tablaFiliales.innerHTML=`

        <tr>

            <td colspan="2">

            No hay iglesias cargadas.

            </td>

        </tr>

        `;


        return;

    }



    lista.forEach(filial=>{


        tablaFiliales.innerHTML += `

        <tr>

            <td>
                ${filial.id}
            </td>


            <td>
                ${filial.nombre}
            </td>


        </tr>

        `;


    });


}


console.log(
    "SIGEM filiales.js cargado correctamente"
);