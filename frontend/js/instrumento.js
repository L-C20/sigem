const API_BASE_URL = "http://localhost:3000";


const parametros = new URLSearchParams(
    window.location.search
);


const instrumentoId = parametros.get("id");



const btnEditar =
document.getElementById("btnEditar");


const btnGuardar =
document.getElementById("btnGuardar");


const btnCancelar =
document.getElementById("btnCancelar");



const campos = [

    "instrumento_id",
    "nivel_instrumento_id",
    "instructor_id",
    "estado"

];





document.addEventListener(
"DOMContentLoaded",
async()=>{


    await cargarInstrumento();


    btnEditar.addEventListener(
        "click",
        activarEdicion
    );


    btnGuardar.addEventListener(
        "click",
        guardarCambios
    );


    btnCancelar.addEventListener(
        "click",
        cancelarEdicion
    );


    document
    .getElementById("instrumento_id")
    .addEventListener(
        "change",
        async(e)=>{

            await cargarInstructoresInstrumento(
                e.target.value
            );

        }
    );


});






async function cargarInstrumento(){


    try{


        const respuesta =
        await fetch(
            `${API_BASE_URL}/instrumentos/${instrumentoId}`
        );


        const datos =
        await respuesta.json();


        console.log(
            "Datos instrumento:",
            datos
        );



        document.getElementById("anio").value =
        datos.anio;



        await cargarDatosAlumno(
            datos.alumno_id
        );



        await cargarInstrumentos();

        await cargarNiveles();


        // Cargar instructores según instrumento

        await cargarInstructoresInstrumento(
            datos.instrumento_id
        );



        const selectInstrumento =
        document.getElementById(
            "instrumento_id"
        );


        selectInstrumento.value =
        datos.instrumento_id;



        document.getElementById(
            "nivel_instrumento_id"
        ).value =
        datos.nivel_instrumento_id;



        document.getElementById(
            "instructor_id"
        ).value =
        datos.instructor_id || "";



        document.getElementById(
            "estado"
        ).value =
        datos.estado;



    }
    catch(error){

        console.error(error);

        alert(
            "Error cargando instrumento"
        );

    }


}







async function cargarDatosAlumno(id){


    const respuesta =
    await fetch(
        `${API_BASE_URL}/alumnos/${id}`
    );


    const alumno =
    await respuesta.json();



    document.getElementById("alumno").value =
    `${alumno.nombre} ${alumno.apellido}`;



    document.getElementById(
        "nombreAlumno"
    ).textContent =
    `${alumno.nombre} ${alumno.apellido}`;


}







async function cargarInstrumentos(){


    const respuesta =
    await fetch(
        `${API_BASE_URL}/instrumentos`
    );


    const datos =
    await respuesta.json();



    const select =
    document.getElementById(
        "instrumento_id"
    );



    select.innerHTML = "";



    datos.forEach(item=>{


        select.innerHTML +=
        `
        <option value="${item.id}">
            ${item.nombre}
        </option>
        `;


    });


}








async function cargarNiveles(){


    const respuesta =
    await fetch(
        `${API_BASE_URL}/niveles-instrumento`
    );


    const datos =
    await respuesta.json();



    const select =
    document.getElementById(
        "nivel_instrumento_id"
    );



    select.innerHTML = "";



    datos.forEach(item=>{


        select.innerHTML +=
        `
        <option value="${item.id}">
            ${item.nombre}
        </option>
        `;


    });


}








async function cargarInstructoresInstrumento(
    instrumento_id
){


    const select =
    document.getElementById(
        "instructor_id"
    );


    select.innerHTML =
    `
    <option value="">
        No pertenece
    </option>
    `;



    if(!instrumento_id){
        return;
    }



    const respuesta =
    await fetch(
        `${API_BASE_URL}/instructores/instrumento/${instrumento_id}`
    );



    const instructores =
    await respuesta.json();



    console.log(
        "Instructores instrumento:",
        instructores
    );



    instructores.forEach(item=>{


        select.innerHTML +=
        `
        <option value="${item.id}">
            ${item.apellido}, ${item.nombre}
        </option>
        `;


    });


}








function activarEdicion(){


    campos.forEach(id=>{

        document.getElementById(id)
        .disabled=false;

    });



    btnEditar.classList.add(
        "hidden"
    );


    btnGuardar.classList.remove(
        "hidden"
    );


    btnCancelar.classList.remove(
        "hidden"
    );


}







function cancelarEdicion(){


    campos.forEach(id=>{


        document.getElementById(id)
        .disabled=true;


    });



    btnEditar.classList.remove(
        "hidden"
    );


    btnGuardar.classList.add(
        "hidden"
    );


    btnCancelar.classList.add(
        "hidden"
    );



    cargarInstrumento();


}









async function guardarCambios(){



    const datos = {


        instrumento_id:
        Number(
            document.getElementById(
                "instrumento_id"
            ).value
        ),



        nivel_instrumento_id:
        Number(
            document.getElementById(
                "nivel_instrumento_id"
            ).value
        ),



        instructor_id:
        document.getElementById(
            "instructor_id"
        ).value
        ?
        Number(
            document.getElementById(
                "instructor_id"
            ).value
        )
        :
        null,



        estado:
        document.getElementById(
            "estado"
        ).value


    };



    console.log(
        "Datos enviados:",
        datos
    );



    try{


        const respuesta =
        await fetch(

            `${API_BASE_URL}/instrumentos/${instrumentoId}`,

            {

                method:"PUT",

                headers:{

                    "Content-Type":
                    "application/json"

                },


                body:
                JSON.stringify(datos)

            }

        );



        if(!respuesta.ok){

            throw new Error();

        }



        alert(
            "Instrumento actualizado correctamente"
        );



        location.reload();



    }
    catch(error){


        console.error(error);


        alert(
            "Error guardando cambios"
        );


    }


}