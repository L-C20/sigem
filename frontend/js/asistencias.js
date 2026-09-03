// ======================================
// ELEMENTOS
// ======================================

const vistaPrincipal =
    document.getElementById("vistaPrincipal");

const vistaTeoria =
    document.getElementById("vistaTeoria");

const vistaInstrumentos =
    document.getElementById("vistaInstrumentos");

const vistaInstrumentoAlumnos =
    document.getElementById("vistaInstrumentoAlumnos");

const vistaTeoriaAlumnos =
    document.getElementById("vistaTeoriaAlumnos");

const vistaNivel1 =
    document.getElementById("vistaNivel1");

const vistaInstructores =
    document.getElementById("vistaInstructores");

const btnTeoria =
    document.getElementById("btnTeoria");

const btnInstrumentos =
    document.getElementById("btnInstrumentos");

const btnInstructores =
    document.getElementById("btnInstructores");

const volverPrincipal1 =
    document.getElementById("volverPrincipal1");

const volverPrincipal2 =
    document.getElementById("volverPrincipal2");

const volverPrincipal3 =
    document.getElementById("volverPrincipal3");

const volverNiveles =
    document.getElementById("volverNiveles");

const volverTeoria =
    document.getElementById("volverTeoria");

const volverInstrumentos =
    document.getElementById("volverInstrumentos");

const headerAsistencias =
    document.getElementById("headerAsistencias");


// ======================================
// ELEMENTOS INSTRUMENTOS
// ======================================

const tituloInstrumento =
    document.getElementById("tituloInstrumento");

const tablaInstrumentoAlumnos =
    document.getElementById("tablaInstrumentoAlumnos");

const fechaInstrumento =
    document.getElementById("fechaInstrumento");

const botonGuardarAsistenciaInstrumento =
    document.getElementById("guardarAsistenciaInstrumento");

const buscarAlumnoInstrumento =
    document.getElementById("buscarAlumnoInstrumento");

const filtroNivelInstrumento =
    document.getElementById("filtroNivelInstrumento");

const filtroInstructorInstrumento =
    document.getElementById("filtroInstructorInstrumento");

const filtroEstadoInstrumento =
    document.getElementById("filtroEstadoInstrumento");


// ======================================
// ELEMENTOS TEORÍA
// ======================================

const tituloTeoria =
    document.getElementById("tituloTeoria");

const tablaTeoriaAlumnos =
    document.getElementById("tablaTeoriaAlumnos");

const fechaTeoria =
    document.getElementById("fechaTeoria");

const botonGuardarAsistenciaTeoria =
    document.getElementById("guardarAsistenciaTeoria");

const buscarAlumnoTeoria =
    document.getElementById("buscarAlumnoTeoria");

const filtroInstrumentoTeoria =
    document.getElementById("filtroInstrumentoTeoria");

const filtroInstructorTeoria =
    document.getElementById("filtroInstructorTeoria");

const filtroNivelInstrumentoTeoria =
    document.getElementById("filtroNivelInstrumentoTeoria");

const filtroEstadoTeoria =
    document.getElementById("filtroEstadoTeoria");


// ======================================
// ELEMENTOS NIVELES
// ======================================

const btnNivel1 =
    document.getElementById("btnNivel1");


// ======================================
// ELEMENTOS INSTRUCTORES
// ======================================

const buscarInstructor =
    document.getElementById("buscarInstructor");

const filtroArea =
    document.getElementById("filtroArea");

const fechaInstructor =
    document.getElementById("fechaInstructor");

const tablaInstructores =
    document.getElementById("tablaInstructores");

const botonGuardarAsistenciaInstructor =
    document.getElementById("guardarAsistenciaInstructor");


// ======================================
// BOTONES DINÁMICOS
// ======================================

const botonesInstrumento =
    document.querySelectorAll(".abrirInstrumento");

const botonesNivel =
    document.querySelectorAll(".abrirNivel");


// ======================================
// DATOS ACTUALES
// ======================================

let instrumentoActual = "";

let nivelTeoriaActual = "";

let listaInstructores = [];

let listaAlumnosInstrumento = [];

let listaAlumnosTeoria = [];

// ======================================
// GENERAR SÁBADOS DEL MES
// ======================================

function generarSabadosDelMes() {

    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = hoy.getMonth();

    const primerDia = new Date(anio, mes, 1);
    const ultimoDia = new Date(anio, mes + 1, 0);

    let primerSabado = new Date(primerDia);
    
    primerSabado.setDate(
        primerDia.getDate() + (6 - primerDia.getDay())
    );

    const sabados = [];

    while (primerSabado <= ultimoDia) {
        sabados.push(new Date(primerSabado));
        primerSabado.setDate(primerSabado.getDate() + 7);
    }

    return sabados;
}

function llenarSelectsFechas() {

    const sabados = generarSabadosDelMes();

    const selects = [
        'fechaTeoria',
        'fechaInstrumento',
        'fechaInstructor'
    ];

    selects.forEach(id => {
        const select = document.getElementById(id);
        select.innerHTML = '<option value="">Seleccione fecha</option>';

        sabados.forEach(sabado => {
            const fecha = sabado.toISOString().split('T')[0];
            const formateada = sabado.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });

            const opcion = document.createElement('option');
            opcion.value = fecha;
            opcion.textContent = formateada;
            select.appendChild(opcion);
        });
    });
}

// ======================================
// MOSTRAR VISTA
// ======================================

function mostrarVista(vista) {

    vistaPrincipal.classList.add("hidden");

    vistaTeoria.classList.add("hidden");

    vistaInstrumentos.classList.add("hidden");

    vistaInstructores.classList.add("hidden");

    vistaInstrumentoAlumnos.classList.add("hidden");

    vistaTeoriaAlumnos.classList.add("hidden");

    vistaNivel1.classList.add("hidden");

    vista.classList.remove("hidden");

}


// ======================================
// TEORÍA
// ======================================

btnTeoria.addEventListener(
    "click",
    () => {

        headerAsistencias.classList.add("hidden");

        mostrarVista(vistaTeoria);

    }
);


// ======================================
// NIVEL 1
// ======================================

if (btnNivel1) {

    btnNivel1.addEventListener(
        "click",
        () => {

            mostrarVista(vistaNivel1);

        }
    );

}


// ======================================
// VOLVER A NIVELES
// ======================================

if (volverNiveles) {

    volverNiveles.addEventListener(
        "click",
        () => {

            mostrarVista(vistaTeoria);

        }
    );

}


// ======================================
// VOLVER A PRINCIPAL DESDE TEORÍA
// ======================================

if (volverPrincipal1) {

    volverPrincipal1.addEventListener(
        "click",
        () => {

            mostrarVista(vistaPrincipal);

            headerAsistencias.classList.remove("hidden");

        }
    );

}


// ======================================
// INSTRUMENTOS
// ======================================

btnInstrumentos.addEventListener(
    "click",
    () => {

        headerAsistencias.classList.add("hidden");

        mostrarVista(vistaInstrumentos);

    }
);


// ======================================
// VOLVER A PRINCIPAL DESDE INSTRUMENTOS
// ======================================

if (volverPrincipal2) {

    volverPrincipal2.addEventListener(
        "click",
        () => {

            mostrarVista(vistaPrincipal);

            headerAsistencias.classList.remove("hidden");

        }
    );

}


// ==========================================
// INSTRUCTORES
// ==========================================

async function cargarInstructoresFiltro() {

    let url =
        `${API_BASE_URL}/asistencias/instructores`;


    if (tipoActual === "instrumento") {

        url += "?tipo=instrumento";

    }


    if (tipoActual === "teoria") {

        url += "?tipo=teoria";

    }


    const respuesta =
        await fetch(url);


    if (!respuesta.ok) {

        throw new Error(
            "No se pudieron cargar los instructores"
        );

    }


    const datos =
        await respuesta.json();


    filtroInstructor.innerHTML = `
        <option value="">
            Todos
        </option>
    `;


    datos.forEach(item => {

        const opcion =
            document.createElement("option");


        opcion.value =
            item.id;


        opcion.textContent =
            `${item.apellido}, ${item.nombre}`;


        filtroInstructor.appendChild(
            opcion
        );

    });

}


// ======================================
// VOLVER A PRINCIPAL DESDE INSTRUCTORES
// ======================================

if (volverPrincipal3) {

    volverPrincipal3.addEventListener(
        "click",
        () => {

            mostrarVista(vistaPrincipal);

            headerAsistencias.classList.remove("hidden");

        }
    );

}

// ==========================================
// ABRIR ASISTENCIA DE INSTRUCTORES
// ==========================================

if (btnInstructores) {

    btnInstructores.addEventListener(
        "click",
        () => {

            headerAsistencias.classList.add("hidden");

            mostrarVista(vistaInstructores);

            cargarInstructores();

        }
    );

}

// =====================================================
// ABRIR PLANILLA DE INSTRUMENTO
// =====================================================

botonesInstrumento.forEach(
    boton => {

        boton.addEventListener(
            "click",
            () => {

                const instrumento =
                    boton.dataset.instrumento;

                instrumentoActual =
                    instrumento;

                tituloInstrumento.textContent =
                    "Asistencia - " + instrumento;

                mostrarVista(
                    vistaInstrumentoAlumnos
                );

                cargarAlumnosInstrumento(
                    instrumento
                );

            }
        );

    }
);


// =====================================================
// VOLVER A INSTRUMENTOS
// =====================================================

if (volverInstrumentos) {

    volverInstrumentos.addEventListener(
        "click",
        () => {

            mostrarVista(
                vistaInstrumentos
            );

        }
    );

}


// =====================================================
// ABRIR PLANILLA DE TEORÍA
// =====================================================

botonesNivel.forEach(
    boton => {

        boton.addEventListener(
            "click",
            () => {

                const nivel =
                    boton.dataset.nivel;

                nivelTeoriaActual =
                    nivel;

                tituloTeoria.textContent =
                    "Asistencia - " + nivel;

                mostrarVista(
                    vistaTeoriaAlumnos
                );

                cargarAlumnosTeoria(
                    nivel
                );

            }
        );

    }
);


// =====================================================
// VOLVER A NIVELES DE TEORÍA
// =====================================================

if (volverTeoria) {

    volverTeoria.addEventListener(
        "click",
        () => {

            mostrarVista(
                vistaTeoria
            );

        }
    );

}


// =====================================================
// INSTRUMENTOS
// CARGAR ALUMNOS
// =====================================================

async function cargarAlumnosInstrumento(
    instrumento
) {

    try {

        const respuesta =
            await fetch(
                `https://sigem-backend.onrender.com/asistencias/instrumento/${encodeURIComponent(instrumento)}`
            );

        if (!respuesta.ok) {

            throw new Error(
                "Error obteniendo alumnos del instrumento"
            );

        }

        const alumnos =
            await respuesta.json();

        listaAlumnosInstrumento =
            alumnos;

        mostrarAlumnosInstrumento(
            alumnos
        );

    }
    catch (error) {

        console.error(
            "ERROR CARGANDO ALUMNOS:",
            error
        );

    }

}


// =====================================================
// MOSTRAR ALUMNOS DE INSTRUMENTO
// =====================================================

function mostrarAlumnosInstrumento(
    alumnos
) {

    tablaInstrumentoAlumnos.innerHTML = "";

    alumnos.forEach(
        alumno => {

            tablaInstrumentoAlumnos.innerHTML += `

                <tr>

                    <td>

                        <input
                            type="checkbox"
                            class="checkAsistencia"
                            data-alumno="${alumno.id}"
                            data-cursada="${alumno.cursada_id}"
                        >

                    </td>

                    <td>

                        ${alumno.apellido}
                        ${alumno.nombre}

                    </td>

                    <td>

                        ${alumno.instructor}

                    </td>

                    <td>
    ${alumno.nivel_teoria || "-"}
</td>

<td>
    ${alumno.nivel_instrumento || "-"}
</td>
                    <td>

                        -

                    </td>

                </tr>

            `;

        }
    );

}


// =====================================================
// BUSCAR ALUMNO DE INSTRUMENTO
// =====================================================

if (buscarAlumnoInstrumento) {

    buscarAlumnoInstrumento.addEventListener(
        "input",
        filtrarAlumnosInstrumento
    );

}


// =====================================================
// FILTRAR ALUMNOS DE INSTRUMENTO
// =====================================================

function filtrarAlumnosInstrumento() {

    const texto =
        buscarAlumnoInstrumento.value
            .toLowerCase()
            .trim();

    const nivel =
        filtroNivelInstrumento
            ? filtroNivelInstrumento.value
            : "";

    const instructor =
        filtroInstructorInstrumento
            ? filtroInstructorInstrumento.value
            : "";

    const resultado =
        listaAlumnosInstrumento.filter(
            alumno => {

                const nombreCompleto =
                    `${alumno.apellido} ${alumno.nombre}`
                        .toLowerCase();

                const coincideNombre =
                    nombreCompleto.includes(
                        texto
                    );

                const coincideNivel =
                    nivel === "" ||
                    alumno.nivel === nivel;

                const coincideInstructor =
                    instructor === "" ||
                    alumno.instructor === instructor;

                return (
                    coincideNombre &&
                    coincideNivel &&
                    coincideInstructor
                );

            }
        );

    mostrarAlumnosInstrumento(
        resultado
    );

}


if (filtroNivelInstrumento) {

    filtroNivelInstrumento.addEventListener(
        "change",
        filtrarAlumnosInstrumento
    );

}


if (filtroInstructorInstrumento) {

    filtroInstructorInstrumento.addEventListener(
        "change",
        filtrarAlumnosInstrumento
    );

}


// =====================================================
// GUARDAR ASISTENCIA INSTRUMENTO
// =====================================================

async function guardarAsistenciaInstrumento() {

    const checkboxes =
        document.querySelectorAll(
            ".checkAsistencia"
        );

    const fecha =
        fechaInstrumento.value;

    if (!fecha) {

        mostrarNotificacion(
    "Seleccione una fecha antes de guardar la asistencia",
    "error"
);
        return;

    }

    for (
        const checkbox of checkboxes
    ) {

        if (!checkbox.checked) {

            continue;

        }

        const datos = {

            alumno_id:
                Number(
                    checkbox.dataset.alumno
                ),

            cursada_instrumento_id:
                Number(
                    checkbox.dataset.cursada
                ),

            fecha:
                fecha,

            presente:
                true

        };

        try {

            const respuesta =
                await fetch(
                    "https://sigem-backend.onrender.com/asistencias/instrumento",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                datos
                            )

                    }
                );

            if (!respuesta.ok) {

                const error =
                    await respuesta.text();

                console.error(
                    "Error guardando asistencia:",
                    error
                );

            }

        }
        catch (error) {

            console.error(
                "Error de conexión:",
                error
            );

        }

    }

    mostrarNotificacion(
    "Asistencia guardada correctamente",
    "exito"
);

}


if (botonGuardarAsistenciaInstrumento) {

    botonGuardarAsistenciaInstrumento.addEventListener(
        "click",
        guardarAsistenciaInstrumento
    );

}


// =====================================================
// TEORÍA
// CARGAR ALUMNOS
// =====================================================

async function cargarAlumnosTeoria(
    nivel
) {

    try {

        const respuesta =
            await fetch(
                `https://sigem-backend.onrender.com/asistencias/teoria/${encodeURIComponent(nivel)}`
            );

        if (!respuesta.ok) {

            throw new Error(
                "Error obteniendo alumnos de teoría"
            );

        }

        const alumnos =
            await respuesta.json();

        listaAlumnosTeoria =
            alumnos;

        mostrarAlumnosTeoria(
            alumnos
        );

    }
    catch (error) {

        console.error(
            "ERROR CARGANDO TEORÍA:",
            error
        );

    }

}


// =====================================================
// MOSTRAR ALUMNOS DE TEORÍA
// =====================================================

function mostrarAlumnosTeoria(
    alumnos
) {

    tablaTeoriaAlumnos.innerHTML = "";

    alumnos.forEach(
        alumno => {

            tablaTeoriaAlumnos.innerHTML += `

                <tr>

                    <td>

                        <input
                            type="checkbox"
                            class="checkAsistenciaTeoria"
                            data-alumno="${alumno.id}"
                            data-cursada="${alumno.cursada_id}"
                        >

                    </td>

                    <td>

                        ${alumno.apellido}
                        ${alumno.nombre}

                    </td>

                    <td>

                        ${alumno.instructor}

                    </td>

                    <td>

                        ${alumno.nivel}

                    </td>

                </tr>

            `;

        }
    );

}


// =====================================================
// GUARDAR ASISTENCIA TEORÍA
// =====================================================

async function guardarAsistenciaTeoria() {

    const checkboxes =
        document.querySelectorAll(
            ".checkAsistenciaTeoria"
        );

    const fecha =
        fechaTeoria.value;

    if (!fecha) {

        mostrarNotificacion(
    "Seleccione una fecha antes de guardar la asistencia",
    "error"
);

        return;

    }

    for (
        const checkbox of checkboxes
    ) {

        if (!checkbox.checked) {

            continue;

        }

        const datos = {

            alumno_id:
                Number(
                    checkbox.dataset.alumno
                ),

            cursada_teoria_id:
                Number(
                    checkbox.dataset.cursada
                ),

            fecha:
                fecha,

            presente:
                true

        };

        try {

            const respuesta =
                await fetch(
                    "https://sigem-backend.onrender.com/asistencias/teoria",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                datos
                            )

                    }
                );

            if (!respuesta.ok) {

                const error =
                    await respuesta.text();

                console.error(
                    "Error guardando teoría:",
                    error
                );

            }

        }
        catch (error) {

            console.error(
                "Error de conexión:",
                error
            );

        }

    }

    mostrarNotificacion(
    "Asistencia guardada correctamente",
    "exito"
);

}


if (botonGuardarAsistenciaTeoria) {

    botonGuardarAsistenciaTeoria.addEventListener(
        "click",
        guardarAsistenciaTeoria
    );

}


// =====================================================
// INSTRUCTORES
// CARGAR DATOS DESDE LA API
// =====================================================

async function cargarInstructores() {

    try {

        const respuesta =
            await fetch(
                "https://sigem-backend.onrender.com/asistencias/instructores"
            );

        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron obtener los instructores"
            );

        }

        const instructores =
            await respuesta.json();

        listaInstructores =
            instructores;

        console.log(
            "INSTRUCTORES RECIBIDOS:",
            listaInstructores
        );

        mostrarInstructores(
            listaInstructores
        );

    }
    catch (error) {

        console.error(
            "ERROR CARGANDO INSTRUCTORES:",
            error
        );

        tablaInstructores.innerHTML = `

            <tr>

                <td colspan="3">

                    Error al cargar los instructores.

                </td>

            </tr>

        `;

    }

}


// =====================================================
// OBTENER ÁREA DEL INSTRUCTOR
// =====================================================

function obtenerAreaInstructor(
    instructor
) {

    const areas = [];


    // ======================================
    // INSTRUMENTO
    // ======================================

    if (instructor.instrumento) {

        areas.push(
            instructor.instrumento
        );

    }


    // ======================================
    // TEORÍA Y SOLFEO
    // ======================================

    if (instructor.ensena_teoria) {

        areas.push(
            "Teoría y Solfeo"
        );

    }


    // ======================================
    // SIN ASIGNAR
    // ======================================

    if (areas.length === 0) {

        return "Sin asignar";

    }


    return areas.join(
        " / "
    );

}


// =====================================================
// MOSTRAR INSTRUCTORES
// =====================================================

function mostrarInstructores(
    instructores
) {

    tablaInstructores.innerHTML = "";

    if (
        instructores.length === 0
    ) {

        tablaInstructores.innerHTML = `

            <tr>

                <td colspan="3">

                    No se encontraron instructores.

                </td>

            </tr>

        `;

        return;

    }


    instructores.forEach(
        instructor => {

            const fila =
                document.createElement("tr");


            const area =
                obtenerAreaInstructor(
                    instructor
                );


            fila.innerHTML = `

    <td>

        <input
            type="checkbox"
            class="checkAsistenciaInstructor"
            data-instructor="${instructor.id}"
        >

    </td>


    <td>

        ${instructor.apellido},
        ${instructor.nombre}

    </td>

    <td>

        ${area}

    </td>
<td>

        ${instructor.telefono || "-"}

    </td>
`;


            tablaInstructores.appendChild(
                fila
            );

        }
    );

}


// =====================================================
// FILTRAR INSTRUCTORES
// =====================================================

function filtrarInstructores() {

    const texto =
        buscarInstructor.value
            .toLowerCase()
            .trim();

    const area =
        filtroArea.value;

    const resultado =
        listaInstructores.filter(
            instructor => {

                const nombreCompleto =
                    `${instructor.apellido} ${instructor.nombre}`
                        .toLowerCase();


                const coincideNombre =
                    nombreCompleto.includes(
                        texto
                    );


                const areaInstructor =
                    obtenerAreaInstructor(
                        instructor
                    );


                const coincideArea =
                    area === "" ||
                    areaInstructor.includes(
                        area
                    );


                return (
                    coincideNombre &&
                    coincideArea
                );

            }
        );


    mostrarInstructores(
        resultado
    );

}


if (buscarInstructor) {

    buscarInstructor.addEventListener(
        "input",
        filtrarInstructores
    );

}


if (filtroArea) {

    filtroArea.addEventListener(
        "change",
        filtrarInstructores
    );

}


// =====================================================
// GUARDAR ASISTENCIA DE INSTRUCTORES
// =====================================================

async function guardarAsistenciaInstructores() {

    const fecha =
        fechaInstructor.value;


    if (!fecha) {

       mostrarNotificacion(
    "Seleccione una fecha antes de guardar la asistencia",
    "error"
);

        return;

    }


    const checkboxes =
        document.querySelectorAll(
            ".checkAsistenciaInstructor"
        );


    if (
        checkboxes.length === 0
    ) {

        mostrarNotificacion(
    "No hay instructores para guardar",
    "error"
);

        return;

    }

const promesas = [];

for (const checkbox of checkboxes) {

    const datos = {

        instructor_id:
            Number(
                checkbox.dataset.instructor
            ),

        fecha:
            fecha,

        presente:
            checkbox.checked,

        observacion:
            null

    };

    console.log(
        "Guardando asistencia instructor:",
        datos
    );

    const promesa = fetch(
        "https://sigem-backend.onrender.com/asistencias/instructores",
        {

            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body:
                JSON.stringify(datos)

        }
    )
    .then(respuesta => {
        if (!respuesta.ok) {
            return respuesta.text().then(error => {
                console.error(
                    "Error guardando instructor:",
                    error
                );
            });
        }
    })
    .catch(error => {
        console.error(
            "Error de conexión:",
            error
        );
    });

    promesas.push(promesa);

}

await Promise.all(promesas);

   mostrarNotificacion(
    "Asistencia de instructores guardada correctamente",
    "exito"
);
// Limpiar checkboxes
checkboxes.forEach(checkbox => {
    checkbox.checked = false;
});

}


if (
    botonGuardarAsistenciaInstructor
) {

    botonGuardarAsistenciaInstructor.addEventListener(
        "click",
        guardarAsistenciaInstructores
    );

}

// ======================================
// CARGAR FECHAS AL INICIAR
// ======================================

function llenarSelectsFechas() {

    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 
        'Mayo', 'Junio', 'Julio', 'Agosto', 
        'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const sabadosPorMes = {};

    const hoy = new Date();
    
    // Generar sábados para los próximos 12 meses
    for (let i = 0; i < 12; i++) {
        const anio = hoy.getFullYear();
        const mes = (hoy.getMonth() + i) % 12;
        const mesAjustado = hoy.getMonth() + i;
        
        const primerDia = new Date(anio, mesAjustado, 1);
        const ultimoDia = new Date(anio, mesAjustado + 1, 0);

        let primerSabado = new Date(primerDia);
        primerSabado.setDate(
            primerDia.getDate() + (6 - primerDia.getDay() + 7) % 7
        );

        const sabados = [];

        while (primerSabado <= ultimoDia) {
            sabados.push(new Date(primerSabado));
            primerSabado.setDate(primerSabado.getDate() + 7);
        }

        const nombreMes = meses[mes];
        sabadosPorMes[nombreMes] = sabados;
    }

    const selects = [
        'fechaTeoria',
        'fechaInstrumento',
        'fechaInstructor'
    ];

    selects.forEach(id => {
        const select = document.getElementById(id);
        select.innerHTML = '<option value="">Seleccione fecha</option>';

        Object.keys(sabadosPorMes).forEach(nombreMes => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = nombreMes;

            sabadosPorMes[nombreMes].forEach(sabado => {
                const fecha = sabado.toISOString().split('T')[0];
                const dia = sabado.getDate();
                
                const opcion = document.createElement('option');
                opcion.value = fecha;
                opcion.textContent = `${dia} de ${nombreMes}`;
                optgroup.appendChild(opcion);
            });

            select.appendChild(optgroup);
        });
    });
}