const API_BASE_URL = "https://sigem-backend.onrender.com";


const parametros = new URLSearchParams(
    window.location.search
);

const alumnoId = parametros.get("id");

function calcularEdadEdicion() {

    const fechaNacimiento =
        document.getElementById("fecha_nacimiento").value;

    const campoEdad =
        document.getElementById("edad");


    if (!fechaNacimiento) {

        campoEdad.value = "";

        return;

    }


    const hoy = new Date();

    const nacimiento =
        new Date(fechaNacimiento + "T00:00:00");


    let edad =
        hoy.getFullYear() -
        nacimiento.getFullYear();


    const mes =
        hoy.getMonth() -
        nacimiento.getMonth();


    if (
        mes < 0 ||
        (
            mes === 0 &&
            hoy.getDate() < nacimiento.getDate()
        )
    ) {

        edad--;

    }


    campoEdad.value = edad;

}

// Campos que se pueden editar

const camposEditables = [
    "dni",
    "apellido",
    "nombre",
    "fecha_nacimiento",
    "edad",
    "telefono",
    "telefono_tutor",
    "correo",
    "filial_id",
    "anciano_autoriza",
    "bautizado_agua",
    "observaciones",
    "instrumento_id",
    "nivel_instrumento_id",
    "instructor_instrumento_id",
    "nivel_teoria_id",
    "instructor_teoria_id",
    "estado_ministerial","fecha_inicio_ministerial","fecha_fin_ministerial","observaciones_ministerial"
];



// Botones

const btnEditar = document.getElementById("btnEditar");

btnEditar.addEventListener("click", () => {

    document.getElementById("estado_ministerial").disabled = false;

});

const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");



// Selects

const instrumentoSelect =
    document.getElementById("instrumento_id");

const nivelInstrumentoSelect =
    document.getElementById("nivel_instrumento_id");

const instructorInstrumentoSelect =
    document.getElementById("instructor_instrumento_id");
    instrumentoSelect.addEventListener(
    "change",
    ()=>{

        const instrumentoId =
            instrumentoSelect.value;

        // Si es CORO (id 13), deshabilitar nivel e instructor
        const esCoRo = Number(instrumentoId) === 13;

        nivelInstrumentoSelect.disabled = esCoRo;
        instructorInstrumentoSelect.disabled = esCoRo;

        if (esCoRo) {
            nivelInstrumentoSelect.value = "";
            instructorInstrumentoSelect.value = "";
            
            // Deshabilitar teoría
            nivelTeoriaSelect.disabled = true;
            instructorTeoriaSelect.disabled = true;
            nivelTeoriaSelect.value = "";
            instructorTeoriaSelect.value = "";
        } else {
            // Habilitar teoría
            nivelTeoriaSelect.disabled = false;
            instructorTeoriaSelect.disabled = false;
            cargarInstructoresInstrumento(instrumentoId);
        }

    }
);


const nivelTeoriaSelect =
    document.getElementById("nivel_teoria_id");


const instructorTeoriaSelect =
    document.getElementById("instructor_teoria_id");

const estadoMinisterial =
    document.getElementById("estado_ministerial");

const fechaInicioMinisterial =
    document.getElementById("fecha_inicio_ministerial");

const fechaFinMinisterial =
    document.getElementById("fecha_fin_ministerial");

const observacionesMinisterial =
    document.getElementById("observaciones_ministerial");


document.addEventListener(
    "DOMContentLoaded",
    async()=>{


        await cargarListas();

        await cargarAlumno();

        await cargarInstruccionMinisterial();



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


    }
);





// =====================================
// Cargar listas desplegables
// =====================================


async function cargarListas(){


    await cargarInstrumentos();

    await cargarNivelesInstrumento();

    await cargarNivelesTeoria();

    await cargarInstructores();


}

// =====================================
// CALCULAR EDAD EN EDICIÓN
// =====================================

function calcularEdadEdicion() {

    const fecha =
        document.getElementById("fecha_nacimiento").value;

    const campoEdad =
        document.getElementById("edad");

    if (!fecha) {

        campoEdad.value = "";

        return;
    }

    const hoy = new Date();

    const nacimiento =
        new Date(fecha + "T00:00:00");

    let edad =
        hoy.getFullYear() -
        nacimiento.getFullYear();

    const mes =
        hoy.getMonth() -
        nacimiento.getMonth();

    if (
        mes < 0 ||
        (
            mes === 0 &&
            hoy.getDate() < nacimiento.getDate()
        )
    ) {

        edad--;

    }

    campoEdad.value = edad;
}


// =====================================
// Cargar alumno
// =====================================



async function cargarAlumno(){


    try {


        const respuesta = await fetch(
            `${API_BASE_URL}/alumnos/${alumnoId}`
        );


        if(!respuesta.ok){

            throw new Error(
                "Alumno no encontrado"
            );

        }



        const alumno = await respuesta.json();



        // Nombre superior

        document.getElementById("nombreAlumno")
        .textContent =
        `${alumno.nombre} ${alumno.apellido}`;





       // ===================================== // DATOS PERSONALES // ===================================== 
       //
       document.getElementById("dni").value = alumno.dni || ""; document.getElementById("apellido").value = alumno.apellido || ""; document.getElementById("nombre").value = alumno.nombre || ""; document.getElementById("fecha_nacimiento").value = alumno.fecha_nacimiento ? alumno.fecha_nacimiento.substring(0, 10) : ""; 

       // La edad se calcula automáticamente 
       // 
       
       calcularEdadEdicion(); document.getElementById("telefono").value = alumno.telefono || ""; 
       
       document.getElementById("telefono_tutor").value = alumno.telefono_tutor || ""; document.getElementById("correo").value = alumno.correo || ""; document.getElementById("anciano_autoriza").value = alumno.anciano_autoriza || ""; document.getElementById("observaciones").value = alumno.observaciones || "";
       document.getElementById("bautizado_agua").value = alumno.bautizado_agua || "";

        // ==========================
        // IGLESIAS
        // ==========================


        await cargarIglesiasEdicion(alumno);






// =========================
// INSTRUMENTO
// =========================

instrumentoSelect.value =
    alumno.instrumento_id || "";


nivelInstrumentoSelect.value =
    alumno.nivel_instrumento_id || "";


// cargar instructores según instrumento

await cargarInstructoresInstrumento(
    alumno.instrumento_id
);


// seleccionar instructor guardado

instructorInstrumentoSelect.value =
    alumno.instructor_instrumento_id || "";
        // =========================
// TEORÍA Y SOLFEO
// =========================


document.getElementById("nivel_teoria_id").value =
    alumno.nivel_teoria_id || "";


document.getElementById("instructor_teoria_id").value =
    alumno.instructor_teoria_id || "";
    }
    catch(error){


        console.error(error);


        mostrarNotificacion(
    "No se pudieron cargar los datos del alumno",
    "error"
);


    }


}







// =====================================
// Cargar iglesias
// =====================================


async function cargarIglesiasEdicion(alumno){


    const respuesta = await fetch(
        `${API_BASE_URL}/filiales`
    );


    const iglesias =
        await respuesta.json();




    const select =
        document.getElementById("filial_id");



    select.innerHTML = "";




    iglesias.forEach(iglesia=>{


        const opcion =
            document.createElement("option");



        opcion.value =
            iglesia.id;



        opcion.textContent =
            iglesia.nombre;




        if(
            iglesia.id == alumno.filial_id
        ){

            opcion.selected = true;

        }



        select.appendChild(opcion);



    });


}

// =====================================
// Activar edición
// =====================================


function activarEdicion(){


    camposEditables.forEach(id=>{

        const campo =
            document.getElementById(id);


        if(campo){

            campo.disabled = false;

        }

    });



    btnEditar.classList.add("hidden");

    btnGuardar.classList.remove("hidden");

    btnCancelar.classList.remove("hidden");


}







// =====================================
// Cancelar edición
// =====================================


async function cancelarEdicion(){

    camposEditables.forEach(id=>{

        const campo =
            document.getElementById(id);

        if(campo){
            campo.disabled = true;
        }

    });


    btnEditar.classList.remove("hidden");

    btnGuardar.classList.add("hidden");

    btnCancelar.classList.add("hidden");


    await cargarAlumno();

    await cargarInstruccionMinisterial();

}







// =====================================
// Guardar cambios
// =====================================


async function guardarCambios(){



    const alumno = {

    dni:
        document.getElementById("dni")
        .value.trim() || null,

    apellido:
        document.getElementById("apellido")
        .value,

    nombre:
        document.getElementById("nombre")
        .value,

    fecha_nacimiento:
        document.getElementById("fecha_nacimiento")
        .value || null,

    edad:
        document.getElementById("edad")
        .value
        ? Number(
            document.getElementById("edad").value
          )
        : null,

    telefono:
        document.getElementById("telefono")
        .value,

    telefono_tutor:
        document.getElementById("telefono_tutor")
        .value,

    correo:
        document.getElementById("correo")
        .value,

    filial_id:
        Number(
            document.getElementById("filial_id").value
        ),

    anciano_autoriza:
        document.getElementById("anciano_autoriza")
        .value.trim(),

    observaciones:
        document.getElementById("observaciones")
        .value.trim(),

    bautizado_agua:
    document.getElementById("bautizado_agua")
    .value || null,
    
};



    try{


        const respuesta =
            await fetch(
                `${API_BASE_URL}/alumnos/${alumnoId}`,
                {

                    method:"PUT",

                    headers:{
                        "Content-Type":"application/json"
                    },


                    body:
                    JSON.stringify(alumno)

                }
            );



        if (!respuesta.ok) {

    const errorTexto =
        await respuesta.text();

    console.error(
        "Error del servidor:",
        errorTexto
    );

    throw new Error(
        "No se pudieron guardar los cambios."
    );

}


console.log("INSTRUMENTO:", instrumentoSelect.value);
console.log("NIVEL:", nivelInstrumentoSelect.value);
console.log("INSTRUCTOR:", instructorInstrumentoSelect.value);

       // Instrumento

if (instrumentoSelect.value) {
console.log("VOY A GUARDAR INSTRUMENTO");
await guardarInstrumento(alumnoId);

} else {

    await finalizarInstrumento();

}

        // Teoría

if (nivelTeoriaSelect.value) {

    await guardarTeoria();

} else {

}
        // Instrucción Ministerial



if (estadoMinisterial.value) {

    
    await guardarInstruccionMinisterial();

}

        mostrarNotificacion(
    "Alumno actualizado correctamente",
    "exito"
);

await cargarAlumno();

camposEditables.forEach(id => {
    const campo = document.getElementById(id);
    if (campo) campo.disabled = true;
});

btnEditar.classList.remove("hidden");
btnGuardar.classList.add("hidden");
btnCancelar.classList.add("hidden");


    }
    catch(error){

    console.error(error);

    mostrarNotificacion(
        "Error al actualizar el alumno",
        "error"
    );

}


}


// =====================================
// Guardar instrumento
// =====================================
// =====================================
// Guardar instrumento
// =====================================

async function guardarInstrumento(){

    const instrumentoId =
        instrumentoSelect.value
        ? Number(instrumentoSelect.value)
        : null;


    const nivelId =
        nivelInstrumentoSelect.value
        ? Number(nivelInstrumentoSelect.value)
        : null;


    const instructorId =
        instructorInstrumentoSelect.value
        ? Number(instructorInstrumentoSelect.value)
        : null;



    // ===============================
    // VALIDACIONES
    // ===============================

    if(!instrumentoId){

        mostrarNotificacion(
            "Debe seleccionar un instrumento",
            "error"
        );

        return false;

    }


    if(!nivelId){

        mostrarNotificacion(
            "Debe seleccionar un nivel",
            "error"
        );

        return false;

    }


    if(!instructorId){

        mostrarNotificacion(
            "Debe seleccionar un instructor",
            "error"
        );

        return false;

    }



    // ===============================
    // DATOS
    // ===============================

    const datos = {

        alumno_id:
            Number(alumnoId),

        instrumento_id:
            instrumentoId,

        nivel_instrumento_id:
            nivelId,

        instructor_id:
            instructorId,

        anio:
            new Date().getFullYear(),

        estado:
            "Activo"

    };



    



    // ===============================
    // GUARDAR
    // ===============================

    try{

        const respuesta =
            await fetch(

                `${API_BASE_URL}/cursada-instrumento`,

                {

                    method:"POST",

                    headers:{
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

            console.error(
                "Error guardando instrumento:",
                error
            );

            throw new Error(
                "Error guardando instrumento"
            );

        }





        return true;


    }
    catch(error){

        console.error(error);

        throw error;

    }

}
// =====================================
// Finalizar instrumento
// =====================================

async function finalizarInstrumento(){

    const respuesta = await fetch(

        `${API_BASE_URL}/cursada-instrumento/finalizar/${alumnoId}`,

        {
            method: "PUT"
        }

    );


    if (!respuesta.ok) {

        const error = await respuesta.text();

        console.error(error);

        // Si no tenía instrumento activo,
        // no es un error real.

        if (respuesta.status === 404) {
            return;
        }

        throw new Error(
            "Error finalizando instrumento"
        );

    }

}
// =====================================
// Actualizar teoría y solfeo
// =====================================


async function guardarTeoria(){


    const datos = {

        alumno_id: Number(alumnoId),

        nivel_id:
            Number(
                nivelTeoriaSelect.value
            ),

        instructor_id:
            instructorTeoriaSelect.value
            ? Number(instructorTeoriaSelect.value)
            : null,

        anio:
            new Date().getFullYear(),

        estado:
            "Activo"

    };


    const respuesta = await fetch(

        `${API_BASE_URL}/cursadas-teoria`,

        {

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:
                JSON.stringify(datos)

        }

    );


    if(!respuesta.ok){

        throw new Error(
            "Error guardando teoría"
        );

    }


} // ← termina guardarTeoria

// =====================================
// Finalizar teoría
// =====================================

async function finalizarTeoria(){

    const respuesta = await fetch(

        `${API_BASE_URL}/cursadas-teoria/finalizar/${alumnoId}`,

        {
            method: "PUT"
        }

    );


    if (!respuesta.ok) {

        const error = await respuesta.text();

        console.error(error);


        // El alumno simplemente no tenía
        // una teoría activa.

        if (respuesta.status === 404) {

            return;

        }


        throw new Error(
            "Error finalizando teoría"
        );

    }

}

// ===============================
// INSTRUCCIÓN MINISTERIAL
// ===============================


async function guardarInstruccionMinisterial(){


    const datos = {

        alumno_id: Number(alumnoId),

        estado:
            estadoMinisterial.value,

        fecha_inicio:
            fechaInicioMinisterial.value || null,

        fecha_fin:
            fechaFinMinisterial.value || null,

        observaciones:
            observacionesMinisterial.value

    };
    
    


    const respuesta = await fetch(

        `${API_BASE_URL}/instruccion-ministerial`,

        {

            method:"POST",

            headers:{
                "Content-Type":"application/json"
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
            "Error guardando instrucción ministerial"
        );

    }


}
// =====================================
// Cargar instrumentos
// =====================================


async function cargarInstrumentos(){


    const respuesta =
        await fetch(
            `${API_BASE_URL}/instrumentos`
        );


    const datos =
        await respuesta.json();



    instrumentoSelect.innerHTML =
        `<option value="">
            No pertenece
        </option>`;



    datos.forEach(item=>{


        instrumentoSelect.innerHTML +=
        `

        <option value="${item.id}">
            ${item.nombre}
        </option>

        `;


    });


}

// =====================================
// Cargar niveles instrumento
// =====================================


async function cargarNivelesInstrumento(){


    const respuesta =
        await fetch(
            `${API_BASE_URL}/niveles-instrumento`
        );


    const datos =
        await respuesta.json();



    nivelInstrumentoSelect.innerHTML =
        `<option value="">
            No pertenece
        </option>`;



    datos.forEach(item=>{


        nivelInstrumentoSelect.innerHTML +=
        `

        <option value="${item.id}">
            ${item.nombre}
        </option>

        `;


    });
}

// =====================================
// Cargar niveles teoría
// =====================================


async function cargarNivelesTeoria(){


    const respuesta =
        await fetch(
            `${API_BASE_URL}/niveles-teoria`
        );


    const datos =
        await respuesta.json();



    nivelTeoriaSelect.innerHTML =
        `<option value="">
            No pertenece
        </option>`;



    datos.forEach(item=>{


        nivelTeoriaSelect.innerHTML +=
        `

        <option value="${item.id}">
            ${item.nombre}
        </option>

        `;


    });


}


// =====================================
// Cargar instructores
// =====================================


async function cargarInstructores(){

    instructorInstrumentoSelect.innerHTML =
        `<option value="">
            No pertenece
        </option>`;


    instructorTeoriaSelect.innerHTML =
        `<option value="">
            No pertenece
        </option>`;


    // Cargar instructores de teoría

    const respuestaTeoria =
        await fetch(
            `${API_BASE_URL}/instructores/teoria`
        );


    const instructoresTeoria =
        await respuestaTeoria.json();



    instructoresTeoria.forEach(item=>{

        instructorTeoriaSelect.innerHTML +=
        `
        <option value="${item.id}">
            ${item.apellido}, ${item.nombre}
        </option>
        `;

    });


}
async function cargarInstructoresInstrumento(instrumento_id){

   


    instructorInstrumentoSelect.innerHTML =
        `<option value="">
            No pertenece
        </option>`;


    if(!instrumento_id){
        return;
    }


    const respuesta =
        await fetch(
            `${API_BASE_URL}/instructores/instrumento/${instrumento_id}`
        );


    const instructores =
        await respuesta.json();


  



    instructores.forEach(item=>{


        instructorInstrumentoSelect.innerHTML +=
        `
        <option value="${item.id}">
            ${item.apellido}, ${item.nombre}
        </option>
        `;


    });

}
// =====================================
// Cargar instrucción ministerial
// =====================================

async function cargarInstruccionMinisterial(){

    try{

        const respuesta = await fetch(
            `${API_BASE_URL}/instruccion-ministerial/${alumnoId}`
        );
       

        if(!respuesta.ok){
            return;
        }

        const datos = await respuesta.json();

        if(!datos){
            return;
        }

        estadoMinisterial.value =
            datos.estado || "";

        fechaInicioMinisterial.value =
            datos.fecha_inicio
                ? datos.fecha_inicio.substring(0,10)
                : "";

        fechaFinMinisterial.value =
            datos.fecha_finalizacion
                ? datos.fecha_finalizacion.substring(0,10)
                : "";

        observacionesMinisterial.value =
            datos.observaciones || "";

    }
    catch(error){

        console.error(
            "Error cargando instrucción ministerial",
            error
        );

    }

}