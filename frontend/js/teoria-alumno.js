const API_BASE_URL = "https://sigem-backend.onrender.com";


const parametros =
new URLSearchParams(
    window.location.search
);


const teoriaId =
parametros.get("id");



const btnEditar =
document.getElementById("btnEditar");


const btnGuardar =
document.getElementById("btnGuardar");


const btnCancelar =
document.getElementById("btnCancelar");



const campos = [

    "nivel_id",
    "instructor_id",
    "estado"

];





document.addEventListener(
"DOMContentLoaded",
async()=>{


    await cargarTeoria();



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


});






async function cargarTeoria(){


    try{


        const respuesta =
        await fetch(
            `${API_BASE_URL}/teoria/${teoriaId}`
        );


        const datos =
        await respuesta.json();



        console.log(
            "Datos teoría:",
            datos
        );



        await cargarAlumno(
            datos.alumno_id
        );


        await cargarNiveles();


        await cargarInstructores();



        document.getElementById(
            "nivel_id"
        ).value =
        datos.nivel_id;



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

        mostrarNotificacion(
            "Error cargando teoría",
            "error"
        );

    }


}








async function cargarAlumno(id){


    const respuesta =
    await fetch(
        `${API_BASE_URL}/alumnos/${id}`
    );


    const alumno =
    await respuesta.json();



    document.getElementById(
        "nombreAlumno"
    ).textContent =
    `${alumno.nombre} ${alumno.apellido}`;


}









async function cargarNiveles(){


    const respuesta =
    await fetch(
        `${API_BASE_URL}/niveles-teoria`
    );


    const datos =
    await respuesta.json();



    const select =
    document.getElementById(
        "nivel_id"
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









async function cargarInstructores(){


    const respuesta =
    await fetch(
        `${API_BASE_URL}/instructores/teoria`
    );


    const datos =
    await respuesta.json();



    const select =
    document.getElementById(
        "instructor_id"
    );



    select.innerHTML = "";



    datos.forEach(item=>{


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



    cargarTeoria();


}









async function guardarCambios(){

    const nivelValor =
        document.getElementById("nivel_id").value;

    const instructorValor =
        document.getElementById("instructor_id").value;


    const datos = {

        nivel_id:
            nivelValor
                ? Number(nivelValor)
                : null,

        instructor_id:
            instructorValor
                ? Number(instructorValor)
                : null,

        estado:
            document.getElementById("estado").value

    };


    console.log(
        "Enviando:",
        datos
    );


    try{

        const respuesta =
            await fetch(

                `${API_BASE_URL}/teoria/${teoriaId}`,

                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(datos)

                }

            );


        if(!respuesta.ok){

            const error =
                await respuesta.text();

            console.error(error);

            throw new Error(
                "Error guardando cambios"
            );

        }

mostrarNotificacion(
    "Teoría actualizada correctamente",
    "exito"
);

setTimeout(() => {
    location.reload();
}, 3000);


    }
    catch(error){

        console.error(error);

        mostrarNotificacion(
            "Error guardando cambios",
            "error"
        );

    }

}