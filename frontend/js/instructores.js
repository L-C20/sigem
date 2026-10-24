const API_BASE_URL = "";


// ==========================================
// ELEMENTOS
// ==========================================

const tablaInstructores =
    document.getElementById("tablaInstructores");

const buscadorInstructores =
    document.getElementById("buscadorInstructores");
const filtroArea =
    document.getElementById("filtroArea");
const btnActualizar =
    document.getElementById("btnActualizar");


// ==========================================
// VARIABLES
// ==========================================

let instructores = [];


// ==========================================
// CARGAR AL INICIAR
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    cargarInstructores();

    buscadorInstructores.addEventListener(
        "input",
        filtrarInstructores
    );
filtroArea.addEventListener(
    "change",
    filtrarInstructores
);
    btnActualizar.addEventListener(
        "click",
        cargarInstructores
    );

});


// ==========================================
// OBTENER INSTRUCTORES
// ==========================================

async function cargarInstructores() {

    tablaInstructores.innerHTML = `
        <tr>
            <td colspan="3" class="empty-state">
                Cargando instructores...
            </td>
        </tr>
    `;


    try {

        const respuesta = await fetch(
            `${API_BASE_URL}/instructores`
        );


        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron cargar los instructores"
            );

        }


        instructores = await respuesta.json();


        renderizarInstructores(instructores);


    }
    catch (error) {

        console.error(
            "ERROR CARGANDO INSTRUCTORES:",
            error
        );


        tablaInstructores.innerHTML = `
            <tr>
                <td
                    colspan="3"
                    class="error-state"
                >
                    No se pudieron cargar los instructores.
                </td>
            </tr>
        `;

    }

}


// ==========================================
// MOSTRAR INSTRUCTORES
// ==========================================

function renderizarInstructores(lista) {

    tablaInstructores.innerHTML = "";


    if (!lista.length) {

        tablaInstructores.innerHTML = `
            <tr>
                <td
                    colspan="3"
                    class="empty-state"
                >
                    No hay instructores cargados.
                </td>
            </tr>
        `;

        return;

    }


    lista.forEach(instructor => {

        const fila =
            document.createElement("tr");


        fila.innerHTML = `

            <td>
                ${escaparHTML(
                    instructor.apellido
                )},
                ${escaparHTML(
                    instructor.nombre
                )}
            </td>


            <td>
                ${escaparHTML(
                    instructor.instrumento || "Teoría y Solfeo"
                )}
            </td>


            <td>
                ${escaparHTML(
                    instructor.telefono || "-"
                )}
            </td>

        `;


        tablaInstructores.appendChild(fila);

    });

}


// ==========================================
// FILTROS
// ==========================================

function filtrarInstructores() {

    const termino =
        buscadorInstructores.value
            .trim()
            .toLowerCase();


    const area =
        filtroArea.value;


    const filtrados =
        instructores.filter(instructor => {


            // ==================================
            // FILTRO POR ÁREA
            // ==================================

            let coincideArea = true;


            if (area === "instrumento") {

                coincideArea =
                    instructor.instrumento !== null &&
                    instructor.instrumento !== "";

            }


            if (area === "teoria") {

                coincideArea =
                    instructor.ensena_teoria === true;

            }


            if (!coincideArea) {

                return false;

            }


            // ==================================
            // FILTRO POR BUSCADOR
            // ==================================

            if (!termino) {

                return true;

            }


            const nombre =
                String(
                    instructor.nombre || ""
                ).toLowerCase();


            const apellido =
                String(
                    instructor.apellido || ""
                ).toLowerCase();


            const telefono =
                String(
                    instructor.telefono || ""
                ).toLowerCase();


            const instrumento =
                String(
                    instructor.instrumento || ""
                ).toLowerCase();


            return (

                nombre.includes(termino) ||

                apellido.includes(termino) ||

                telefono.includes(termino) ||

                instrumento.includes(termino)

            );

        });


    renderizarInstructores(
        filtrados
    );

}
// ==========================================
// ESCAPAR HTML
// ==========================================

function escaparHTML(valor) {

    return String(valor ?? "")

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}

// ==========================================
// ALTA DE INSTRUCTOR
// ==========================================

// Solo administración da de alta docentes: la secretaría carga alumnos.
// El botón se esconde para los demás, y el backend igual responde 403
// aunque alguien lo haga aparecer a mano.
const ROLES_QUE_DAN_ALTA = ["superadmin", "admin"];


const btnNuevoInstructor =
    document.getElementById("btnNuevoInstructor");

const formularioInstructor =
    document.getElementById("formularioInstructor");

const instructorForm =
    document.getElementById("instructorForm");

const btnCancelarInstructor =
    document.getElementById("btnCancelarInstructor");

const btnGuardarInstructor =
    document.getElementById("btnGuardarInstructor");

const contenedorInstrumentos =
    document.getElementById("instructorInstrumentos");


document.addEventListener("DOMContentLoaded", () => {

    if (!btnNuevoInstructor) {
        return;
    }


    if (!puedeDarDeAlta()) {
        return;
    }


    btnNuevoInstructor.classList.remove("hidden");

    btnNuevoInstructor.addEventListener(
        "click",
        abrirFormularioInstructor
    );

    btnCancelarInstructor.addEventListener(
        "click",
        cerrarFormularioInstructor
    );

    instructorForm.addEventListener(
        "submit",
        guardarInstructor
    );


    cargarInstrumentosParaAlta();

});


function puedeDarDeAlta() {

    try {

        const yo =
            JSON.parse(
                localStorage.getItem("usuario") || "null"
            );

        return !!yo &&
            ROLES_QUE_DAN_ALTA.includes(yo.rol);

    } catch (error) {

        return false;

    }

}


// ==========================================
// INSTRUMENTOS DEL FORMULARIO
// ==========================================

async function cargarInstrumentosParaAlta() {

    try {

        const respuesta = await fetch(
            `${API_BASE_URL}/instrumentos`
        );


        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron cargar los instrumentos"
            );

        }


        const instrumentos =
            await respuesta.json();


        if (!instrumentos.length) {

            contenedorInstrumentos.innerHTML = `
                <p class="empty-state">
                    No hay instrumentos cargados.
                </p>
            `;

            return;

        }


        contenedorInstrumentos.innerHTML =
            instrumentos.map(instrumento => `

                <label class="check-line">

                    <input
                        type="checkbox"
                        name="instrumentos"
                        value="${instrumento.id}"
                    >

                    <span>
                        ${escaparHTML(instrumento.nombre)}
                    </span>

                </label>

            `).join("");


    } catch (error) {

        console.error(error);

        contenedorInstrumentos.innerHTML = `
            <p class="error-state">
                No se pudieron cargar los instrumentos.
            </p>
        `;

    }

}


// ==========================================
// ABRIR Y CERRAR
// ==========================================

function abrirFormularioInstructor() {

    formularioInstructor.classList.remove("hidden");

    btnNuevoInstructor.classList.add("hidden");

    document.getElementById("instructorApellido").focus();

}


function cerrarFormularioInstructor() {

    instructorForm.reset();

    formularioInstructor.classList.add("hidden");

    btnNuevoInstructor.classList.remove("hidden");

}


// ==========================================
// GUARDAR
// ==========================================

function instrumentosElegidos() {

    return Array.from(
        contenedorInstrumentos.querySelectorAll(
            "input[name='instrumentos']:checked"
        )
    ).map(casilla => Number(casilla.value));

}


async function guardarInstructor(evento) {

    evento.preventDefault();


    const datos = {

        apellido:
            document.getElementById("instructorApellido").value.trim(),

        nombre:
            document.getElementById("instructorNombre").value.trim(),

        telefono:
            document.getElementById("instructorTelefono").value.trim(),

        estado:
            document.getElementById("instructorEstado").value,

        ensena_teoria:
            document.getElementById("instructorEnsenaTeoria").checked,

        instrumentos:
            instrumentosElegidos()

    };


    // Se avisa acá y no después del viaje al servidor, que de todos modos
    // vuelve a validarlo.
    if (!datos.ensena_teoria && datos.instrumentos.length === 0) {

        mostrarNotificacion(
            "Marcá Teoría y Solfeo o elegí al menos un instrumento",
            "error"
        );

        return;

    }


    await enviarInstructor(datos);

}


async function enviarInstructor(datos) {

    btnGuardarInstructor.disabled = true;


    try {

        const respuesta = await fetch(
            `${API_BASE_URL}/instructores`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(datos)
            }
        );


        const cuerpo =
            await respuesta.json();


        // Un homónimo casi siempre es alguien cargado dos veces, pero puede
        // haber dos personas con el mismo nombre. Lo decide quien está
        // cargando, no el sistema.
        if (respuesta.status === 409 && cuerpo.homonimo) {

            btnGuardarInstructor.disabled = false;

            const seguir =
                await confirmarHomonimo(cuerpo.homonimo);

            if (!seguir) {
                return;
            }

            return enviarInstructor({
                ...datos,
                permitir_homonimo: true
            });

        }


        if (!respuesta.ok) {

            throw new Error(
                cuerpo.error ||
                "No se pudo crear el instructor"
            );

        }


        mostrarNotificacion(
            `Instructor ${cuerpo.apellido}, ${cuerpo.nombre} creado`,
            "exito"
        );


        cerrarFormularioInstructor();

        cargarInstructores();


    } catch (error) {

        console.error(error);

        mostrarNotificacion(
            error.message,
            "error"
        );

    } finally {

        btnGuardarInstructor.disabled = false;

    }

}


// ==========================================
// CONFIRMAR HOMONIMO
// ==========================================

// Con el modal propio de SIGEM y no con el confirm() del navegador, que
// desentona con el resto de la app.
function confirmarHomonimo(homonimo) {

    return new Promise(resolver => {

        const modal =
            document.getElementById("modalHomonimo");

        const nombre =
            document.getElementById("nombreHomonimo");

        const btnCancelar =
            document.getElementById("btnCancelarHomonimo");

        const btnConfirmar =
            document.getElementById("btnConfirmarHomonimo");


        nombre.textContent =
            `${homonimo.apellido}, ${homonimo.nombre} (${homonimo.estado})`;


        modal.classList.remove("hidden");


        function cerrar(respuesta) {

            modal.classList.add("hidden");

            btnCancelar.removeEventListener("click", alCancelar);
            btnConfirmar.removeEventListener("click", alConfirmar);
            modal.removeEventListener("click", alTocarAfuera);

            resolver(respuesta);

        }


        function alCancelar() {
            cerrar(false);
        }


        function alConfirmar() {
            cerrar(true);
        }


        // Tocar el fondo equivale a cancelar, como en los otros modales
        function alTocarAfuera(evento) {

            if (evento.target === modal) {
                cerrar(false);
            }

        }


        btnCancelar.addEventListener("click", alCancelar);
        btnConfirmar.addEventListener("click", alConfirmar);
        modal.addEventListener("click", alTocarAfuera);

    });

}
