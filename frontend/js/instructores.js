const API_BASE_URL = "http://localhost:3000";


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