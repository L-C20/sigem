const API = "";


// ===============================
// DATOS
// ===============================

let niveles = [];

let alumnos = [];

let alumnoExcepcion = null;




// ===============================
// INICIO
// ===============================

document.addEventListener(
"DOMContentLoaded",
async()=>{


    // Cosmetico: el backend rechaza igual a quien no
    // sea superadmin o admin

    const yo = obtenerUsuario();


    if(!yo || !["superadmin","admin"].includes(yo.rol)){


        window.location.href = "index.html";


        return;


    }


    await cargarNiveles();


    await cargarExcepciones();


    cargarEventos();


});




// ===============================
// NIVELES
// ===============================

async function cargarNiveles(){


    try{


        const respuesta =
        await fetch(`${API}/academico/niveles`);


        if(!respuesta.ok){


            throw new Error("respuesta " + respuesta.status);


        }


        niveles = await respuesta.json();


        const select =
        document.getElementById("filtroNivel");


        niveles.forEach(nivel=>{


            select.innerHTML +=
            `
            <option value="${nivel.nivel_id}">
                ${escaparHTML(nivel.nivel)} — ${escaparHTML(nivel.instructor)}
            </option>
            `;


        });


    }
    catch(error){


        console.error(error);


        mostrarNotificacion(
            "Error cargando los niveles",
            "error"
        );


    }


}




// ===============================
// ALUMNOS DE UN NIVEL
// ===============================

async function cargarAlumnos(){


    const nivelId =
    document.getElementById("filtroNivel").value;


    const cuatrimestre =
    document.getElementById("filtroCuatrimestre").value;


    if(!nivelId){


        return;


    }


    try{


        const respuesta = await fetch(
            `${API}/academico/niveles/${nivelId}/habilitacion`
            + `?cuatrimestre=${cuatrimestre}`
        );


        const datos = await respuesta.json();


        // Descarta una respuesta que llega tarde
        if(document.getElementById("filtroNivel").value !== nivelId){


            return;


        }


        if(!respuesta.ok){


            mostrarNotificacion(
                datos.error || "No se pudo cargar",
                "error"
            );


            return;


        }


        alumnos = datos;


        mostrarAlumnos();


    }
    catch(error){


        console.error(error);


        mostrarNotificacion(
            "Error cargando los alumnos",
            "error"
        );


    }


}




function mostrarAlumnos(){


    const tabla =
    document.getElementById("tablaAlumnos");


    if(alumnos.length === 0){


        tabla.innerHTML =
        `
        <tr>
            <td colspan="5" class="empty-state">
                Sin alumnos en este nivel.
            </td>
        </tr>
        `;


        return;


    }


    const pueden =
    alumnos.filter(a=>!a.adeuda || a.excepcion_id).length;


    document.getElementById("resumen").textContent =
    pueden + " de " + alumnos.length + " pueden rendir";


    tabla.innerHTML =
    alumnos.map(alumno=>{


        const porExcepcion =
        !!alumno.adeuda && !!alumno.excepcion_id;


        const puede =
        !alumno.adeuda || !!alumno.excepcion_id;


        const etiqueta =
        porExcepcion
            ? "Habilitado por excepción"
            : puede
                ? "Habilitado"
                : "No habilitado";


        return `

        <tr>

            <td>
                ${escaparHTML(alumno.apellido)},
                ${escaparHTML(alumno.nombre)}
            </td>

            <td>
                ${alumno.aprobadas} / ${alumno.obligatorias}
            </td>

            <td>
                <span class="estado ${puede ? "estado-activo" : "estado-inactivo"}">
                    ${etiqueta}
                </span>
                ${porExcepcion
                    ? `<br><small class="texto-tenue">
                           autorizó ${escaparHTML(alumno.excepcion_por || "")}
                       </small>`
                    : ""}
            </td>

            <td>
                ${escaparHTML(alumno.adeuda || "—")}
                ${alumno.excepcion_motivo
                    ? `<br><small class="texto-tenue">
                           motivo: ${escaparHTML(alumno.excepcion_motivo)}
                       </small>`
                    : ""}
            </td>

            <td>
                ${botonDeAccion(alumno)}
            </td>

        </tr>

        `;


    }).join("");


    conectarBotones();


}




// Solo tiene sentido autorizar a quien adeuda algo

function botonDeAccion(alumno){


    if(alumno.excepcion_id){


        return `
        <button type="button"
            class="button secondary pequeno quitar-excepcion"
            data-id="${alumno.excepcion_id}">
            Quitar excepción
        </button>
        `;


    }


    if(!alumno.adeuda){


        return `<span class="texto-tenue">—</span>`;


    }


    return `
    <button type="button"
        class="button pequeno autorizar"
        data-alumno="${alumno.alumno_id}"
        data-nivel="${alumno.nivel_id}"
        data-anio="${alumno.anio}"
        data-nombre="${escaparHTML(alumno.apellido + ", " + alumno.nombre)}">
        Autorizar
    </button>
    `;


}




function conectarBotones(){


    document.querySelectorAll(".autorizar")
        .forEach(boton=>{


            boton.addEventListener(
                "click",
                ()=>abrirModal(boton.dataset)
            );


        });


    document.querySelectorAll(".quitar-excepcion")
        .forEach(boton=>{


            boton.addEventListener(
                "click",
                ()=>quitarExcepcion(Number(boton.dataset.id))
            );


        });


}




// ===============================
// AUTORIZAR
// ===============================

function abrirModal(datos){


    alumnoExcepcion = datos;


    document.getElementById("nombreExcepcion").textContent =
    datos.nombre;


    document.getElementById("motivoExcepcion").value = "";


    document.getElementById("modalExcepcion")
        .classList.remove("hidden");


}




function cerrarModal(){


    alumnoExcepcion = null;


    document.getElementById("modalExcepcion")
        .classList.add("hidden");


}




async function confirmarExcepcion(){


    const motivo =
    document.getElementById("motivoExcepcion").value.trim();


    if(!motivo){


        mostrarNotificacion(
            "Escribí el motivo",
            "error"
        );


        return;


    }


    try{


        const respuesta = await fetch(
            `${API}/academico/excepciones`,
            {
                method:"POST",
                headers:{ "Content-Type":"application/json" },
                body: JSON.stringify({
                    alumno_id:    Number(alumnoExcepcion.alumno),
                    nivel_id:     Number(alumnoExcepcion.nivel),
                    anio:         Number(alumnoExcepcion.anio),
                    cuatrimestre: Number(
                        document.getElementById("filtroCuatrimestre").value
                    ),
                    motivo
                })
            }
        );


        const datos = await respuesta.json();


        if(!respuesta.ok){


            mostrarNotificacion(
                datos.error || "No se pudo autorizar",
                "error"
            );


            return;


        }


        mostrarNotificacion("Excepción autorizada", "exito");


        cerrarModal();


        await cargarAlumnos();


        await cargarExcepciones();


    }
    catch(error){


        console.error(error);


        mostrarNotificacion(
            "Error autorizando la excepción",
            "error"
        );


    }


}




async function quitarExcepcion(id){


    try{


        const respuesta = await fetch(
            `${API}/academico/excepciones/${id}`,
            { method:"DELETE" }
        );


        const datos = await respuesta.json();


        mostrarNotificacion(
            datos.error || datos.mensaje,
            respuesta.ok ? "exito" : "error"
        );


        if(respuesta.ok){


            await cargarAlumnos();


            await cargarExcepciones();


        }


    }
    catch(error){


        console.error(error);


        mostrarNotificacion(
            "Error quitando la excepción",
            "error"
        );


    }


}




// ===============================
// REGISTRO DE EXCEPCIONES
// ===============================

async function cargarExcepciones(){


    try{


        const respuesta =
        await fetch(`${API}/academico/excepciones`);


        if(!respuesta.ok){


            return;


        }


        const lista = await respuesta.json();


        const tabla =
        document.getElementById("tablaExcepciones");


        if(lista.length === 0){


            tabla.innerHTML =
            `
            <tr>
                <td colspan="5" class="empty-state">
                    Sin excepciones registradas.
                </td>
            </tr>
            `;


            return;


        }


        tabla.innerHTML =
        lista.map(x=>`

            <tr>

                <td>${escaparHTML(x.alumno)}</td>

                <td>${escaparHTML(x.nivel)}</td>

                <td>
                    ${x.cuatrimestre}º cuatr.
                    <br><small class="texto-tenue">${x.anio}</small>
                </td>

                <td>${escaparHTML(x.motivo)}</td>

                <td>
                    ${escaparHTML(x.autorizado_por)}
                    <br><small class="texto-tenue">
                        ${formatearFecha(x.autorizado_el)}
                    </small>
                </td>

            </tr>

        `).join("");


    }
    catch(error){


        console.error(error);


    }


}




// ===============================
// EVENTOS
// ===============================

function cargarEventos(){


    document
        .getElementById("filtroNivel")
        .addEventListener("change", cambiarNivel);


    document
        .getElementById("filtroCuatrimestre")
        .addEventListener("change", cargarAlumnos);


    document
        .getElementById("filtroPeriodo")
        .addEventListener("change", cargarCierres);


    document
        .getElementById("volverEvaluaciones")
        .addEventListener("click", volverALista);


    conectarSolapas();


    document
        .getElementById("btnCancelarExcepcion")
        .addEventListener("click", cerrarModal);


    document
        .getElementById("btnConfirmarExcepcion")
        .addEventListener("click", confirmarExcepcion);


}




// ===============================
// AYUDAS
// ===============================

function formatearFecha(valor){


    if(!valor){


        return "";


    }


    const partes =
    String(valor).slice(0, 10).split("-");


    return partes[2] + "/" + partes[1] + "/" + partes[0];


}




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




// ===============================
// SOLAPAS
// ===============================

function conectarSolapas(){


    document.querySelectorAll(".solapa")
        .forEach(solapa=>{


            solapa.addEventListener("click", ()=>{


                document.querySelectorAll(".solapa")
                    .forEach(otra=>otra.classList.remove("activa"));


                solapa.classList.add("activa");


                ["panelNotas","panelHabilitacion","panelCierres"]
                    .forEach(id=>{


                        document.getElementById(id)
                            .classList.toggle(
                                "hidden",
                                id !== solapa.dataset.panel
                            );


                    });


                cargarSolapaActual();


            });


        });


}




// Cada solapa pide lo suyo cuando se la mira

function cargarSolapaActual(){


    const activa =
    document.querySelector(".solapa.activa");


    if(!activa){


        return;


    }


    if(activa.dataset.panel === "panelNotas"){


        cargarEvaluaciones();


    }


    if(activa.dataset.panel === "panelHabilitacion"){


        cargarAlumnos();


    }


    if(activa.dataset.panel === "panelCierres"){


        cargarCierres();


    }


}




function cambiarNivel(){


    // Al cambiar de nivel, el detalle abierto ya no
    // corresponde a nada
    volverALista();


    cargarSolapaActual();


}




// ===============================
// EVALUACIONES DEL NIVEL
// ===============================

let evaluaciones = [];


async function cargarEvaluaciones(){


    const nivelId =
    document.getElementById("filtroNivel").value;


    if(!nivelId){


        return;


    }


    try{


        const respuesta = await fetch(
            `${API}/academico/niveles/${nivelId}/evaluaciones`
        );


        const datos = await respuesta.json();


        if(document.getElementById("filtroNivel").value !== nivelId){


            return;


        }


        if(!respuesta.ok){


            mostrarNotificacion(
                datos.error || "No se pudieron cargar las evaluaciones",
                "error"
            );


            return;


        }


        evaluaciones = datos;


        mostrarEvaluaciones();


    }
    catch(error){


        console.error(error);


        mostrarNotificacion(
            "Error cargando las evaluaciones",
            "error"
        );


    }


}




function mostrarEvaluaciones(){


    const tabla =
    document.getElementById("tablaEvaluaciones");


    if(evaluaciones.length === 0){


        tabla.innerHTML =
        `
        <tr>
            <td colspan="6" class="empty-state">
                Este nivel todavía no tiene evaluaciones cargadas.
            </td>
        </tr>
        `;


        return;


    }


    tabla.innerHTML =
    evaluaciones.map(ev=>`

        <tr>

            <td>
                ${escaparHTML(ev.titulo)}
                <br><small class="texto-tenue">
                    ${escaparHTML(ev.instructor)}
                    ${ev.fecha ? " · " + formatearFecha(ev.fecha) : ""}
                </small>
            </td>

            <td>
                ${escaparHTML(ev.area)}
                <br><small class="texto-tenue">${escaparHTML(ev.tipo)}</small>
            </td>

            <td>${ev.cuatrimestre}º</td>

            <td>
                ${ev.corregidos}
                ${Number(ev.corregidos) > 0
                    ? `<br><small class="texto-tenue">${ev.aprobados} aprobados</small>`
                    : ""}
            </td>

            <td>${ev.promedio ?? "—"}</td>

            <td>
                <button type="button"
                    class="button pequeno ver-notas"
                    data-id="${ev.id}">
                    Ver notas
                </button>
            </td>

        </tr>

    `).join("");


    document.querySelectorAll(".ver-notas")
        .forEach(boton=>{


            boton.addEventListener(
                "click",
                ()=>abrirNotas(Number(boton.dataset.id))
            );


        });


}




// ===============================
// NOTAS DE UNA EVALUACION
// ===============================

async function abrirNotas(id){


    try{


        const respuesta = await fetch(
            `${API}/academico/evaluaciones/${id}/resultados`
        );


        const datos = await respuesta.json();


        if(!respuesta.ok){


            mostrarNotificacion(
                datos.error || "No se pudieron cargar las notas",
                "error"
            );


            return;


        }


        const ev = datos.evaluacion;


        document.getElementById("tituloNotas").textContent =
        ev.titulo;


        document.getElementById("subtituloNotas").textContent =
        ev.area + " · " + ev.tipo + " · " + ev.instructor;


        document.getElementById("columnaNota").textContent =
        ev.area === "Teoría" ? "Nota" : "Resultado";


        document.getElementById("tablaNotas").innerHTML =
        datos.alumnos.map(alumno=>`

            <tr>

                <td>
                    ${escaparHTML(alumno.apellido)},
                    ${escaparHTML(alumno.nombre)}
                </td>

                <td>
                    ${celdaResultado(alumno, ev.area)}
                </td>

                <td>
                    ${escaparHTML(alumno.observaciones || "—")}
                </td>

                <td>
                    ${escaparHTML(alumno.cargado_por || "—")}
                </td>

            </tr>

        `).join("");


        document.getElementById("listadoEvaluaciones")
            .classList.add("hidden");


        document.getElementById("detalleNotas")
            .classList.remove("hidden");


    }
    catch(error){


        console.error(error);


        mostrarNotificacion(
            "Error abriendo la evaluación",
            "error"
        );


    }


}




function celdaResultado(alumno, area){


    if(alumno.ausente){


        return `<span class="estado estado-inactivo">Ausente</span>`;


    }


    if(area === "Teoría"){


        if(alumno.nota === null || alumno.nota === undefined){


            return `<span class="texto-tenue">sin corregir</span>`;


        }


        const aprobado =
        alumno.resultado === "Aprobado";


        return `
        <span class="estado ${aprobado ? "estado-activo" : "estado-inactivo"}">
            ${escaparHTML(alumno.nota)}
        </span>
        `;


    }


    if(!alumno.resultado){


        return `<span class="texto-tenue">sin corregir</span>`;


    }


    return `
    <span class="estado ${alumno.resultado === "Aprobado"
        ? "estado-activo" : "estado-inactivo"}">
        ${escaparHTML(alumno.resultado)}
    </span>
    `;


}




function volverALista(){


    const detalle =
    document.getElementById("detalleNotas");


    if(detalle){


        detalle.classList.add("hidden");


        document.getElementById("listadoEvaluaciones")
            .classList.remove("hidden");


    }


}




// ===============================
// CIERRES
// ===============================

async function cargarCierres(){


    const nivelId =
    document.getElementById("filtroNivel").value;


    const periodo =
    document.getElementById("filtroPeriodo").value;


    if(!nivelId){


        return;


    }


    try{


        const respuesta = await fetch(
            `${API}/academico/niveles/${nivelId}/cierres`
            + `?periodo=${encodeURIComponent(periodo)}`
        );


        const datos = await respuesta.json();


        if(document.getElementById("filtroNivel").value !== nivelId
           || document.getElementById("filtroPeriodo").value !== periodo){


            return;


        }


        if(!respuesta.ok){


            mostrarNotificacion(
                datos.error || "No se pudieron cargar los cierres",
                "error"
            );


            return;


        }


        mostrarCierres(datos);


    }
    catch(error){


        console.error(error);


        mostrarNotificacion(
            "Error cargando los cierres",
            "error"
        );


    }


}




function mostrarCierres(lista){


    const cerrados =
    lista.filter(a=>a.condicion).length;


    document.getElementById("resumenCierres").textContent =
    cerrados + " de " + lista.length + " cerrados";


    document.getElementById("tablaCierres").innerHTML =
    lista.map(alumno=>`

        <tr>

            <td>
                ${escaparHTML(alumno.apellido)},
                ${escaparHTML(alumno.nombre)}
            </td>

            <td>
                ${alumno.nota_final ?? "—"}
            </td>

            <td>
                ${alumno.condicion
                    ? `<span class="estado ${alumno.condicion === "Promocionado"
                           ? "estado-activo" : "estado-inactivo"}">
                           ${escaparHTML(alumno.condicion)}
                       </span>`
                    : `<span class="texto-tenue">sin cerrar</span>`}
            </td>

            <td>
                ${escaparHTML(alumno.observaciones || "—")}
            </td>

            <td>
                ${escaparHTML(alumno.cerrado_por || "—")}
                ${alumno.cerrado_el
                    ? `<br><small class="texto-tenue">${formatearFecha(alumno.cerrado_el)}</small>`
                    : ""}
            </td>

        </tr>

    `).join("");


}
