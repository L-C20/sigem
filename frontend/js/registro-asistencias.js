const API_BASE_URL = "http://localhost:3000";


// ==========================================
// ELEMENTOS
// ==========================================

const tablaHistorial =
    document.getElementById("tablaHistorial");

const encabezadoHistorial =
    document.getElementById("encabezadoHistorial");

const tituloHistorial =
    document.getElementById("tituloHistorial");

const descripcionHistorial =
    document.getElementById("descripcionHistorial");

const buscadorHistorial =
    document.getElementById("buscadorHistorial");

const btnActualizar =
    document.getElementById("btnActualizar");

const btnInstrumento =
    document.getElementById("btnInstrumento");

const btnTeoria =
    document.getElementById("btnTeoria");

const btnInstructores =
    document.getElementById("btnInstructores");

const filtroMes =
    document.getElementById("filtroMes");

const filtroInstrumento =
    document.getElementById("filtroInstrumento");

const filtroNivelInstrumento =
    document.getElementById("filtroNivelInstrumento");

const filtroNivelTeoria =
    document.getElementById("filtroNivelTeoria");

const filtroInstructor =
    document.getElementById("filtroInstructor");

const btnLimpiarFiltros =
    document.getElementById("btnLimpiarFiltros");

const contenedorInstrumento =
    document.getElementById("contenedorInstrumento");

const contenedorNivelInstrumento =
    document.getElementById("contenedorNivelInstrumento");

const contenedorNivelTeoria =
    document.getElementById("contenedorNivelTeoria");

const contenedorInstructor =
    document.getElementById("contenedorInstructor");


// ==========================================
// VARIABLES
// ==========================================

let historial = [];

let tipoActual = "instrumento";


// ==========================================
// INICIAR
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        establecerMesActual();

        actualizarInterfaz();

        await cargarFiltros();

        await cargarHistorial();


        btnInstrumento.addEventListener(
            "click",
            () => cambiarTipo("instrumento")
        );


        btnTeoria.addEventListener(
            "click",
            () => cambiarTipo("teoria")
        );


        btnInstructores.addEventListener(
            "click",
            () => cambiarTipo("instructores")
        );


        btnActualizar.addEventListener(
            "click",
            cargarHistorial
        );


        buscadorHistorial.addEventListener(
            "input",
            aplicarFiltros
        );


        filtroMes.addEventListener(
            "change",
            aplicarFiltros
        );


        filtroInstrumento.addEventListener(
            "change",
            aplicarFiltros
        );


        filtroNivelInstrumento.addEventListener(
            "change",
            aplicarFiltros
        );


        filtroNivelTeoria.addEventListener(
            "change",
            aplicarFiltros
        );


        filtroInstructor.addEventListener(
            "change",
            aplicarFiltros
        );


        btnLimpiarFiltros.addEventListener(
            "click",
            limpiarFiltros
        );

    }
);


// ==========================================
// MES ACTUAL
// ==========================================

function establecerMesActual() {

    const ahora = new Date();

    const año =
        ahora.getFullYear();

    const mes =
        String(
            ahora.getMonth() + 1
        ).padStart(2, "0");


    filtroMes.value =
        `${año}-${mes}`;

}


// ==========================================
// CAMBIAR TIPO
// ==========================================

async function cambiarTipo(tipo) {

    tipoActual = tipo;


    btnInstrumento.classList.remove("primary");
    btnInstrumento.classList.add("secondary");

    btnTeoria.classList.remove("primary");
    btnTeoria.classList.add("secondary");

    btnInstructores.classList.remove("primary");
    btnInstructores.classList.add("secondary");


    if (tipo === "instrumento") {

        btnInstrumento.classList.remove("secondary");
        btnInstrumento.classList.add("primary");

    }


    if (tipo === "teoria") {

        btnTeoria.classList.remove("secondary");
        btnTeoria.classList.add("primary");

    }


    if (tipo === "instructores") {

        btnInstructores.classList.remove("secondary");
        btnInstructores.classList.add("primary");

    }


    actualizarInterfaz();

    await cargarFiltros();

    await cargarHistorial();

}


// ==========================================
// INTERFAZ
// ==========================================

function actualizarInterfaz() {

    contenedorInstrumento.classList.add("hidden");
    contenedorNivelInstrumento.classList.add("hidden");
    contenedorNivelTeoria.classList.add("hidden");
    contenedorInstructor.classList.add("hidden");


    if (tipoActual === "instrumento") {

        tituloHistorial.textContent =
            "Asistencia de Instrumento";

        descripcionHistorial.textContent =
            "Registro mensual de asistencia de alumnos de instrumento.";

        buscadorHistorial.placeholder =
            "Buscar alumno...";


        contenedorInstrumento.classList.remove("hidden");

        contenedorNivelInstrumento.classList.remove("hidden");

        contenedorInstructor.classList.remove("hidden");

    }


    if (tipoActual === "teoria") {

        tituloHistorial.textContent =
            "Asistencia de Teoría y Solfeo";

        descripcionHistorial.textContent =
            "Registro mensual de asistencia de alumnos de Teoría y Solfeo.";

        buscadorHistorial.placeholder =
            "Buscar alumno...";


        contenedorNivelTeoria.classList.remove("hidden");

        contenedorInstructor.classList.remove("hidden");

    }


    if (tipoActual === "instructores") {

        tituloHistorial.textContent =
            "Asistencia de Instructores";

        descripcionHistorial.textContent =
            "Registro mensual de asistencia de instructores.";

        buscadorHistorial.placeholder =
            "Buscar instructor...";


        contenedorInstructor.classList.remove("hidden");

    }

}


// ==========================================
// CARGAR FILTROS
// ==========================================

async function cargarFiltros() {

    try {

        if (tipoActual === "instrumento") {

            await cargarInstrumentosFiltro();

            await cargarNivelesInstrumentoFiltro();

            await cargarInstructoresFiltro();

        }


        if (tipoActual === "teoria") {

            await cargarNivelesTeoriaFiltro();

            await cargarInstructoresFiltro();

        }


        if (tipoActual === "instructores") {

            await cargarInstructoresFiltro();

        }

    }
    catch(error) {

        console.error(
            "Error cargando filtros:",
            error
        );

    }

}


// ==========================================
// INSTRUMENTOS
// ==========================================

async function cargarInstrumentosFiltro() {

    const respuesta =
        await fetch(
            `${API_BASE_URL}/instrumentos`
        );


    const datos =
        await respuesta.json();


    filtroInstrumento.innerHTML = `
        <option value="">
            Todos
        </option>
    `;


    datos.forEach(item => {

        filtroInstrumento.innerHTML += `
            <option value="${item.nombre}">
                ${item.nombre}
            </option>
        `;

    });

}


// ==========================================
// NIVELES INSTRUMENTO
// ==========================================

async function cargarNivelesInstrumentoFiltro() {

    const respuesta =
        await fetch(
            `${API_BASE_URL}/niveles-instrumento`
        );


    const datos =
        await respuesta.json();


    filtroNivelInstrumento.innerHTML = `
        <option value="">
            Todos
        </option>
    `;


    datos.forEach(item => {

        filtroNivelInstrumento.innerHTML += `
            <option value="${item.nombre}">
                ${item.nombre}
            </option>
        `;

    });

}


// ==========================================
// NIVELES TEORÍA
// ==========================================

async function cargarNivelesTeoriaFiltro() {

    const respuesta =
        await fetch(
            `${API_BASE_URL}/niveles-teoria`
        );


    const datos =
        await respuesta.json();


    filtroNivelTeoria.innerHTML = `
        <option value="">
            Todos
        </option>
    `;


    datos.forEach(item => {

        filtroNivelTeoria.innerHTML += `
            <option value="${item.nombre}">
                ${item.nombre}
            </option>
        `;

    });

}


// ==========================================
// INSTRUCTORES
// ==========================================

async function cargarInstructoresFiltro() {

    let url =
        `${API_BASE_URL}/instructores`;


    // ======================================
    // FILTRAR SEGÚN EL TIPO DE ASISTENCIA
    // ======================================

    if (tipoActual === "instrumento") {

        url += "?tipo=instrumento";

    }


    if (tipoActual === "teoria") {

        url += "?tipo=teoria";

    }


    const respuesta =
        await fetch(url);


    const datos =
        await respuesta.json();


    filtroInstructor.innerHTML = `
        <option value="">
            Todos
        </option>
    `;


    datos.forEach(item => {

        filtroInstructor.innerHTML += `
            <option value="${item.id}">
                ${item.apellido}, ${item.nombre}
            </option>
        `;

    });

}

// ==========================================
// CARGAR HISTORIAL
// ==========================================

async function cargarHistorial() {

    mostrarCargando();


    let endpoint;


    if (tipoActual === "instrumento") {

        endpoint =
            `${API_BASE_URL}/asistencias/historial/instrumento`;

    }


    if (tipoActual === "teoria") {

        endpoint =
            `${API_BASE_URL}/asistencias/historial/teoria`;

    }


    if (tipoActual === "instructores") {

        endpoint =
            `${API_BASE_URL}/asistencias/historial/instructores`;

    }


    try {

        const respuesta =
            await fetch(endpoint);


        if (!respuesta.ok) {

            throw new Error(
                "No se pudo obtener el historial"
            );

        }


        historial =
            await respuesta.json();


        aplicarFiltros();

    }
    catch(error) {

        console.error(error);


        tablaHistorial.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    class="error-state"
                >
                    No se pudo cargar el registro.
                </td>

            </tr>

        `;

    }

}


// ==========================================
// APLICAR FILTROS
// ==========================================

function aplicarFiltros() {

    const mesSeleccionado =
        filtroMes.value;


    const termino =
        buscadorHistorial.value
            .trim()
            .toLowerCase();


    let lista =
        [...historial];


    // ======================================
    // FILTRO POR MES
    // ======================================

    if (mesSeleccionado) {

        lista =
            lista.filter(registro => {

                const fecha =
                    String(
                        registro.fecha
                    ).substring(0, 7);

                return fecha === mesSeleccionado;

            });

    }


    // ======================================
    // FILTRO BUSCADOR
    // ======================================

    if (termino) {

        lista =
            lista.filter(registro => {

                if (
                    tipoActual ===
                    "instrumento"
                ) {

                    return (

                        String(
                            registro.alumno_nombre || ""
                        )
                        .toLowerCase()
                        .includes(termino)

                        ||

                        String(
                            registro.alumno_apellido || ""
                        )
                        .toLowerCase()
                        .includes(termino)

                    );

                }


                if (
                    tipoActual ===
                    "teoria"
                ) {

                    return (

                        String(
                            registro.alumno_nombre || ""
                        )
                        .toLowerCase()
                        .includes(termino)

                        ||

                        String(
                            registro.alumno_apellido || ""
                        )
                        .toLowerCase()
                        .includes(termino)

                    );

                }


                return (

                    String(
                        registro.instructor_nombre || ""
                    )
                    .toLowerCase()
                    .includes(termino)

                    ||

                    String(
                        registro.instructor_apellido || ""
                    )
                    .toLowerCase()
                    .includes(termino)

                );

            });

    }


    // ======================================
    // FILTRO INSTRUMENTO
    // ======================================

    if (
        tipoActual === "instrumento" &&
        filtroInstrumento.value
    ) {

        lista =
            lista.filter(registro =>
                String(
                    registro.instrumento
                ).toLowerCase() ===
                filtroInstrumento.value.toLowerCase()
            );

    }


    // ======================================
    // FILTRO NIVEL INSTRUMENTO
    // ======================================

    if (
        tipoActual === "instrumento" &&
        filtroNivelInstrumento.value
    ) {

        lista =
            lista.filter(registro =>
                String(
                    registro.nivel
                ).toLowerCase() ===
                filtroNivelInstrumento.value.toLowerCase()
            );

    }


    // ======================================
    // FILTRO NIVEL TEORÍA
    // ======================================

    if (
        tipoActual === "teoria" &&
        filtroNivelTeoria.value
    ) {

        lista =
            lista.filter(registro =>
                String(
                    registro.nivel
                ).toLowerCase() ===
                filtroNivelTeoria.value.toLowerCase()
            );

    }


    // ======================================
    // FILTRO INSTRUCTOR
    // ======================================

    if (
        filtroInstructor.value
    ) {

        lista =
            lista.filter(registro => {

                const id =
                    tipoActual === "instrumento"
                        ? obtenerIdInstructorInstrumento(registro)
                        : tipoActual === "teoria"
                            ? obtenerIdInstructorTeoria(registro)
                            : registro.instructor_id;


                return String(id) ===
                    String(filtroInstructor.value);

            });

    }


    renderizarHistorialMensual(lista);

}


// ==========================================
// OBTENER ID INSTRUCTOR INSTRUMENTO
// ==========================================

function obtenerIdInstructorInstrumento(registro) {

    return registro.instructor_id ||
           registro.instructor_instrumento_id ||
           null;

}


// ==========================================
// OBTENER ID INSTRUCTOR TEORÍA
// ==========================================

function obtenerIdInstructorTeoria(registro) {

    return registro.instructor_id ||
           registro.instructor_teoria_id ||
           null;

}


// ==========================================
// SÁBADOS DEL MES
// ==========================================

function obtenerSabadosDelMes(valorMes) {

    if (!valorMes) {
        return [];
    }


    const [año, mes] =
        valorMes
            .split("-")
            .map(Number);


    const sabados = [];


    const fecha =
        new Date(
            año,
            mes - 1,
            1
        );


    while (
        fecha.getMonth() ===
        mes - 1
    ) {

        if (
            fecha.getDay() === 6
        ) {

            sabados.push(
                crearFechaLocal(
                    fecha
                )
            );

        }


        fecha.setDate(
            fecha.getDate() + 1
        );

    }


    return sabados;

}


// ==========================================
// CREAR FECHA LOCAL
// ==========================================

function crearFechaLocal(fecha) {

    const año =
        fecha.getFullYear();

    const mes =
        String(
            fecha.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            fecha.getDate()
        ).padStart(2, "0");


    return `${año}-${mes}-${dia}`;

}


// ==========================================
// RENDERIZAR HISTORIAL MENSUAL
// ==========================================

function renderizarHistorialMensual(lista) {

    const sabados =
        obtenerSabadosDelMes(
            filtroMes.value
        );


    construirEncabezado(
        sabados
    );


    tablaHistorial.innerHTML = "";


    if (!lista.length) {

        tablaHistorial.innerHTML = `

            <tr>

                <td
                    colspan="${sabados.length + 3}"
                    class="empty-state"
                >
                    No hay registros para los filtros seleccionados.
                </td>

            </tr>

        `;

        return;

    }


    // ======================================
    // AGRUPAR PERSONAS
    // ======================================

    const personas = {};


    lista.forEach(registro => {

        let id;
        let nombre;
        let apellido;
        let detalle1 = "";
        let detalle2 = "";


        if (
            tipoActual ===
            "instructores"
        ) {

            id =
                registro.instructor_id;

            nombre =
                registro.instructor_nombre;

            apellido =
                registro.instructor_apellido;

            detalle1 =
                registro.telefono || "-";

        }
        else {

            id =
                registro.alumno_id;

            nombre =
                registro.alumno_nombre;

            apellido =
                registro.alumno_apellido;


            if (
                tipoActual ===
                "instrumento"
            ) {

                detalle1 =
                    registro.instrumento || "-";

                detalle2 =
                    registro.nivel || "-";

            }
            else {

                detalle1 =
                    registro.nivel || "-";

            }

        }


        if (!personas[id]) {

            personas[id] = {

                id,
                nombre,
                apellido,
                detalle1,
                detalle2,
                asistencias: {}

            };

        }


        const fecha =
            String(
                registro.fecha
            ).substring(0, 10);


        personas[id]
            .asistencias[fecha] =
            registro.presente;

    });


    // ======================================
    // ORDENAR
    // ======================================

    const listaPersonas =
        Object.values(personas)
        .sort((a, b) => {

            const apellidoA =
                String(
                    a.apellido || ""
                ).toLowerCase();

            const apellidoB =
                String(
                    b.apellido || ""
                ).toLowerCase();


            return apellidoA.localeCompare(
                apellidoB
            );

        });


    // ======================================
    // CREAR FILAS
    // ======================================

    listaPersonas.forEach(persona => {

        const fila =
            document.createElement("tr");


        let html = `

            <td>
                <strong>
                    ${escaparHTML(
                        persona.apellido
                    )},
                    ${escaparHTML(
                        persona.nombre
                    )}
                </strong>
            </td>

        `;


        // Datos adicionales

        if (
            tipoActual ===
            "instrumento"
        ) {

            html += `

                <td>
                    ${escaparHTML(
                        persona.detalle1
                    )}
                </td>

                <td>
                    ${escaparHTML(
                        persona.detalle2
                    )}
                </td>

            `;

        }


        if (
            tipoActual ===
            "teoria"
        ) {

            html += `

                <td>
                    ${escaparHTML(
                        persona.detalle1
                    )}
                </td>

            `;

        }


        if (
            tipoActual ===
            "instructores"
        ) {

            html += `

                <td>
                    ${escaparHTML(
                        persona.detalle1
                    )}
                </td>

            `;

        }


        // Sábados

        sabados.forEach(sabado => {

            const asistencia =
                persona.asistencias[
                    sabado
                ];


            html += `

                <td class="asistencia-celda">
                    ${mostrarAsistenciaMensual(
                        asistencia
                    )}
                </td>

            `;

        });


        fila.innerHTML =
            html;


        tablaHistorial.appendChild(
            fila
        );

    });

}


// ==========================================
// ENCABEZADO
// ==========================================

function construirEncabezado(sabados) {

    let html = "<tr>";


    html += `
        <th>
            ${tipoActual === "instructores"
                ? "Instructor"
                : "Alumno"}
        </th>
    `;


    if (
        tipoActual ===
        "instrumento"
    ) {

        html += `
            <th>Instrumento</th>
            <th>Nivel</th>
        `;

    }


    if (
        tipoActual ===
        "teoria"
    ) {

        html += `
            <th>Nivel</th>
        `;

    }


    if (
        tipoActual ===
        "instructores"
    ) {

        html += `
            <th>Teléfono</th>
        `;

    }


    sabados.forEach(sabado => {

        html += `

            <th>
                ${formatearFechaCorta(
                    sabado
                )}
            </th>

        `;

    });


    html += "</tr>";


    encabezadoHistorial.innerHTML =
        html;

}


// ==========================================
// ASISTENCIA MENSUAL
// ==========================================

function mostrarAsistenciaMensual(
    presente
) {

    if (
        presente === true ||
        presente === "true"
    ) {

        return `
            <span
                title="Presente"
                style="font-weight:700;"
            >
                ✓
            </span>
        `;

    }


    if (
        presente === false ||
        presente === "false"
    ) {

        return `
            <span
                title="Ausente"
                style="font-weight:700;"
            >
                ✕
            </span>
        `;

    }


    return `
        <span
            title="Sin registro"
        >
            —
        </span>
    `;

}


// ==========================================
// FECHA CORTA
// ==========================================

function formatearFechaCorta(
    fecha
) {

    const partes =
        fecha.split("-");


    if (
        partes.length !== 3
    ) {

        return fecha;

    }


    return `
        ${partes[2]}/${partes[1]}
    `;

}


// ==========================================
// LIMPIAR FILTROS
// ==========================================

function limpiarFiltros() {

    establecerMesActual();


    filtroInstrumento.value =
        "";

    filtroNivelInstrumento.value =
        "";

    filtroNivelTeoria.value =
        "";

    filtroInstructor.value =
        "";

    buscadorHistorial.value =
        "";


    aplicarFiltros();

}


// ==========================================
// SEGURIDAD
// ==========================================

function escaparHTML(valor) {

    return String(
        valor ?? ""
    )

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


// ==========================================
// CARGANDO
// ==========================================

function mostrarCargando() {

    tablaHistorial.innerHTML = `

        <tr>

            <td
                colspan="10"
                class="empty-state"
            >
                Cargando registro...
            </td>

        </tr>

    `;

}