const API = "";


// ===============================
// DATOS
// ===============================

let usuarios = [];

let instructores = [];

let usuarioPassword = null;


const ROLES = [
    { valor:"superadmin",  texto:"SuperAdmin" },
    { valor:"admin",       texto:"Administrador" },
    { valor:"instructor",  texto:"Instructor" },
    { valor:"secretaria",  texto:"Secretaría" }
];




// ===============================
// INICIO
// ===============================

document.addEventListener(
"DOMContentLoaded",
async()=>{


    // Esto es solo para no mostrar una pantalla vacia:
    // quien manda de verdad es el backend, que rechaza
    // a cualquiera que no sea superadmin

    const yo = obtenerUsuario();


    if(!yo || yo.rol !== "superadmin"){


        window.location.href = "index.html";


        return;


    }


    await cargarInstructores();


    await cargarUsuarios();


    cargarEventos();


});




// ===============================
// CARGAR INSTRUCTORES
// ===============================

async function cargarInstructores(){


    try{


        const respuesta =
        await fetch(`${API}/instructores`);


        instructores =
        await respuesta.json();


        llenarSelectInstructores(
            document.getElementById("nuevoInstructor")
        );


    }
    catch(error){


        console.error(error);


    }


}




// ===============================
// CARGAR USUARIOS
// ===============================

async function cargarUsuarios(){


    try{


        const respuesta =
        await fetch(`${API}/usuarios`);


        if(!respuesta.ok){


            throw new Error("respuesta " + respuesta.status);


        }


        usuarios =
        await respuesta.json();


        mostrarUsuarios();


    }
    catch(error){


        console.error(error);


        mostrarNotificacion(
            "Error cargando los usuarios",
            "error"
        );


    }


}




// ===============================
// MOSTRAR TABLA
// ===============================

function mostrarUsuarios(){


    const tabla =
    document.getElementById("tablaUsuarios");


    if(usuarios.length === 0){


        tabla.innerHTML =
        `
        <tr>
            <td colspan="6" class="empty-state">
                Sin usuarios cargados.
            </td>
        </tr>
        `;


        return;


    }


    tabla.innerHTML =
    usuarios.map(filaUsuario).join("");


    conectarBotones();


}




// ===============================
// FILA
// ===============================

function filaUsuario(usuario){


    const nivel =
    usuario.niveles
        ? `<br><small class="texto-tenue">${escaparHTML(usuario.niveles)}</small>`
        : "";


    return `

    <tr data-id="${usuario.id}">


        <td>
            ${escaparHTML(usuario.apellido)},
            ${escaparHTML(usuario.nombre)}
        </td>


        <td>
            ${escaparHTML(usuario.email || "")}
            ${usuario.username
                ? `<br><small class="texto-tenue">usuario: ${escaparHTML(usuario.username)}</small>`
                : ""}
            ${!usuario.email && !usuario.username
                ? `<span class="texto-tenue">sin datos de ingreso</span>`
                : ""}
        </td>


        <td>
            <select class="campo-rol">
                ${ROLES.map(rol=>`
                    <option value="${rol.valor}"
                        ${rol.valor === usuario.rol ? "selected" : ""}>
                        ${rol.texto}
                    </option>
                `).join("")}
            </select>
        </td>


        <td>
            <select class="campo-instructor">
                <option value="">Ninguno</option>
                ${instructores.map(inst=>`
                    <option value="${inst.id}"
                        ${Number(inst.id) === Number(usuario.instructor_id)
                            ? "selected" : ""}>
                        ${escaparHTML(inst.apellido + ", " + inst.nombre)}
                    </option>
                `).join("")}
            </select>
            ${nivel}
        </td>


        <td>
            <select class="campo-estado">
                <option value="Activo"
                    ${usuario.estado === "Activo" ? "selected" : ""}>
                    Activo
                </option>
                <option value="Inactivo"
                    ${usuario.estado !== "Activo" ? "selected" : ""}>
                    Inactivo
                </option>
            </select>
        </td>


        <td>
            <div class="action-group">

                <button type="button" class="button pequeno guardar-usuario">
                    Guardar
                </button>

                <button type="button" class="button secondary pequeno cambiar-clave">
                    Clave
                </button>

            </div>
        </td>


    </tr>

    `;


}




// ===============================
// SELECT DE INSTRUCTORES
// ===============================

function llenarSelectInstructores(select){


    if(!select){


        return;


    }


    instructores.forEach(inst=>{


        select.innerHTML +=
        `
        <option value="${inst.id}">
            ${escaparHTML(inst.apellido + ", " + inst.nombre)}
        </option>
        `;


    });


}




// ===============================
// EVENTOS
// ===============================

function cargarEventos(){


    document
        .getElementById("formUsuario")
        .addEventListener("submit", crearUsuario);


    document
        .getElementById("btnCancelarPassword")
        .addEventListener("click", cerrarModalPassword);


    document
        .getElementById("btnGuardarPassword")
        .addEventListener("click", guardarPassword);


}




function conectarBotones(){


    document.querySelectorAll(".guardar-usuario")
        .forEach(boton=>{


            boton.addEventListener(
                "click",
                ()=>guardarUsuario(boton.closest("tr"))
            );


        });


    document.querySelectorAll(".cambiar-clave")
        .forEach(boton=>{


            boton.addEventListener(
                "click",
                ()=>abrirModalPassword(boton.closest("tr"))
            );


        });


}




// ===============================
// CREAR
// ===============================

async function crearUsuario(evento){


    evento.preventDefault();


    const cuerpo = {
        nombre:    document.getElementById("nuevoNombre").value.trim(),
        apellido:  document.getElementById("nuevoApellido").value.trim(),
        email:     document.getElementById("nuevoEmail").value.trim(),
        username:  document.getElementById("nuevoUsuario").value.trim(),
        password:  document.getElementById("nuevoPassword").value,
        rol:       document.getElementById("nuevoRol").value,
        instructor_id:
            document.getElementById("nuevoInstructor").value || null
    };


    try{


        const respuesta = await fetch(
            `${API}/usuarios`,
            {
                method:"POST",
                headers:{ "Content-Type":"application/json" },
                body: JSON.stringify(cuerpo)
            }
        );


        const datos = await respuesta.json();


        if(!respuesta.ok){


            mostrarNotificacion(
                datos.error || "No se pudo crear el usuario",
                "error"
            );


            return;


        }


        mostrarNotificacion(
            "Usuario creado",
            "exito"
        );


        document.getElementById("formUsuario").reset();


        await cargarUsuarios();


    }
    catch(error){


        console.error(error);


        mostrarNotificacion(
            "Error creando el usuario",
            "error"
        );


    }


}




// ===============================
// GUARDAR CAMBIOS DE UNA FILA
// ===============================

async function guardarUsuario(fila){


    const id = fila.dataset.id;


    const cuerpo = {
        rol:    fila.querySelector(".campo-rol").value,
        estado: fila.querySelector(".campo-estado").value,
        instructor_id:
            fila.querySelector(".campo-instructor").value || null
    };


    try{


        const respuesta = await fetch(
            `${API}/usuarios/${id}`,
            {
                method:"PUT",
                headers:{ "Content-Type":"application/json" },
                body: JSON.stringify(cuerpo)
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
            "Cambios guardados",
            "exito"
        );


        await cargarUsuarios();


    }
    catch(error){


        console.error(error);


        mostrarNotificacion(
            "Error guardando los cambios",
            "error"
        );


    }


}




// ===============================
// MODAL DE CONTRASENA
// ===============================

function abrirModalPassword(fila){


    usuarioPassword = fila.dataset.id;


    document.getElementById("nombrePassword").textContent =
    fila.querySelector("td")
        .textContent
        .replace(/\s+/g, " ")
        .trim();


    document.getElementById("passwordNueva").value = "";


    document.getElementById("modalPassword")
        .classList.remove("hidden");


}




function cerrarModalPassword(){


    usuarioPassword = null;


    document.getElementById("modalPassword")
        .classList.add("hidden");


}




async function guardarPassword(){


    const password =
    document.getElementById("passwordNueva").value;


    if(password.length < 8){


        mostrarNotificacion(
            "La contraseña debe tener al menos 8 caracteres",
            "error"
        );


        return;


    }


    try{


        const respuesta = await fetch(
            `${API}/usuarios/${usuarioPassword}/password`,
            {
                method:"PUT",
                headers:{ "Content-Type":"application/json" },
                body: JSON.stringify({ password })
            }
        );


        const datos = await respuesta.json();


        if(!respuesta.ok){


            mostrarNotificacion(
                datos.error || "No se pudo cambiar la contraseña",
                "error"
            );


            return;


        }


        mostrarNotificacion(
            "Contraseña actualizada",
            "exito"
        );


        cerrarModalPassword();


    }
    catch(error){


        console.error(error);


        mostrarNotificacion(
            "Error cambiando la contraseña",
            "error"
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
