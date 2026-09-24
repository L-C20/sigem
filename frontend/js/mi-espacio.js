const API = "";


// ===============================
// DATOS
// ===============================

let misNiveles = [];

let nivelActual = null;

let listaAsistencia = [];




// ===============================
// INICIO
// ===============================

document.addEventListener(
"DOMContentLoaded",
async()=>{


    const yo = obtenerUsuario();


    if(yo){


        document.getElementById("bienvenida").textContent =
        "Hola, " + yo.nombre + ".";


    }


    await cargarNiveles();


    cargarEventos();


});




// ===============================
// MIS NIVELES
// ===============================

async function cargarNiveles(){


    try{


        const respuesta =
        await fetch(`${API}/mi-espacio/resumen`);


        if(respuesta.status === 403){


            mostrarSinCursos();


            return;


        }


        if(!respuesta.ok){


            throw new Error("respuesta " + respuesta.status);


        }


        misNiveles =
        await respuesta.json();


        mostrarNiveles();


    }
    catch(error){


        console.error(error);


        mostrarNotificacion(
            "Error cargando tus cursos",
            "error"
        );


    }


}




function mostrarSinCursos(){


    document.getElementById("tarjetasNiveles").innerHTML =
    `
    <p class="empty-state">
        Tu cuenta todavía no está vinculada a ningún curso.
        Pedile al administrador que te asigne uno.
    </p>
    `;


}




function mostrarNiveles(){


    const contenedor =
    document.getElementById("tarjetasNiveles");


    if(misNiveles.length === 0){


        mostrarSinCursos();


        return;


    }


    contenedor.innerHTML =
    misNiveles.map(nivel=>`

        <div class="card card-asistencia instrumento-card">

            <h2>
                ${escaparHTML(nivel.nivel)}
            </h2>

            <p>
                ${nivel.alumnos}
                ${Number(nivel.alumnos) === 1 ? "alumno" : "alumnos"}
                · ${escaparHTML(String(nivel.anio))}
            </p>

            <button
                class="button abrirNivel"
                data-nivel="${nivel.nivel_id}">
                Ingresar
            </button>

        </div>

    `).join("");


    document.querySelectorAll(".abrirNivel")
        .forEach(boton=>{


            boton.addEventListener(
                "click",
                ()=>abrirNivel(Number(boton.dataset.nivel))
            );


        });


}




// ===============================
// ABRIR UN NIVEL
// ===============================

function abrirNivel(nivelId){


    nivelActual =
    misNiveles.find(n=>Number(n.nivel_id) === nivelId);


    document.getElementById("tituloNivel").textContent =
    nivelActual.nivel;


    document.getElementById("titulo").textContent =
    nivelActual.nivel;


    document.getElementById("vistaNiveles")
        .classList.add("hidden");


    document.getElementById("vistaNivel")
        .classList.remove("hidden");


    // Las partes del curso pasan al menu lateral
    if(typeof mostrarSeccionesDeCurso === "function"){


        mostrarSeccionesDeCurso(
            nivelActual.nivel,
            SECCIONES_DEL_CURSO,
            activarPanel
        );


    }


    activarPanel("panelAsistencia");


    // Arranca en el dia de hoy
    document.getElementById("fechaClase").value =
    fechaDeHoy();


    cargarAsistencia();


}




function volver(){


    nivelActual = null;


    if(typeof ocultarSeccionesDeCurso === "function"){


        ocultarSeccionesDeCurso();


    }


    document.getElementById("titulo").textContent =
    "Mis cursos";


    document.getElementById("vistaNivel")
        .classList.add("hidden");


    document.getElementById("vistaNiveles")
        .classList.remove("hidden");


}




// ===============================
// ASISTENCIA
// ===============================

async function cargarAsistencia(){


    const fecha =
    document.getElementById("fechaClase").value;


    if(!nivelActual || !fecha){


        return;


    }


    try{


        const respuesta = await fetch(
            `${API}/mi-espacio/asistencia/${nivelActual.nivel_id}`
            + `?fecha=${encodeURIComponent(fecha)}`
        );


        const datos = await respuesta.json();


        // Si mientras viajaba la respuesta cambiaron la
        // fecha, esta llega tarde: la descartamos. Si no,
        // podria pisar la lista de la fecha nueva.

        if(document.getElementById("fechaClase").value !== fecha){


            return;


        }


        if(!respuesta.ok){


            mostrarNotificacion(
                datos.error || "No se pudo cargar la asistencia",
                "error"
            );


            return;


        }


        listaAsistencia = datos;


        mostrarAsistencia();


    }
    catch(error){


        console.error(error);


        mostrarNotificacion(
            "Error cargando la asistencia",
            "error"
        );


    }


}




function mostrarAsistencia(){


    const tabla =
    document.getElementById("tablaAsistencia");


    if(listaAsistencia.length === 0){


        tabla.innerHTML =
        `
        <tr>
            <td colspan="3" class="empty-state">
                No hay alumnos activos en este curso.
            </td>
        </tr>
        `;


        document.getElementById("resumenAsistencia").textContent = "";


        return;


    }


    tabla.innerHTML =
    listaAsistencia.map(item=>`

        <tr>

            <td>
                ${escaparHTML(item.apellido)},
                ${escaparHTML(item.nombre)}
            </td>

            <td class="ocultar-movil">
                ${escaparHTML(item.filial || "—")}
            </td>

            <td>
                <input
                    type="checkbox"
                    class="marca-presente"
                    data-cursada="${item.cursada_id}"
                    ${item.presente === true ? "checked" : ""}>
            </td>

        </tr>

    `).join("");


    document.querySelectorAll(".marca-presente")
        .forEach(caja=>{


            caja.addEventListener("change", actualizarResumen);


        });


    actualizarResumen();


}




function actualizarResumen(){


    const cajas =
    [...document.querySelectorAll(".marca-presente")];


    const presentes =
    cajas.filter(caja=>caja.checked).length;


    document.getElementById("resumenAsistencia").textContent =
    presentes + " de " + cajas.length + " presentes";


}




async function guardarAsistencia(){


    const fecha =
    document.getElementById("fechaClase").value;


    if(!nivelActual || !fecha){


        mostrarNotificacion(
            "Elegí una fecha",
            "error"
        );


        return;


    }


    const asistencias =
    [...document.querySelectorAll(".marca-presente")]
        .map(caja=>({
            cursada_id: Number(caja.dataset.cursada),
            presente:   caja.checked
        }));


    try{


        const respuesta = await fetch(
            `${API}/mi-espacio/asistencia/${nivelActual.nivel_id}`,
            {
                method:"POST",
                headers:{ "Content-Type":"application/json" },
                body: JSON.stringify({ fecha, asistencias })
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
            "Asistencia guardada (" + datos.guardadas + " alumnos)",
            "exito"
        );


    }
    catch(error){


        console.error(error);


        mostrarNotificacion(
            "Error guardando la asistencia",
            "error"
        );


    }


}




// ===============================
// EVENTOS
// ===============================

function cargarEventos(){


    document
        .getElementById("volverNiveles")
        .addEventListener("click", volver);


    document
        .getElementById("fechaClase")
        .addEventListener("change", cargarAsistencia);


    document
        .getElementById("btnGuardarAsistencia")
        .addEventListener("click", guardarAsistencia);


    conectarSolapas();


    document
        .getElementById("formEvaluacion")
        .addEventListener("submit", crearEvaluacion);


    document
        .getElementById("btnGuardarNotas")
        .addEventListener("click", guardarNotas);


    document
        .getElementById("volverEvaluaciones")
        .addEventListener("click", volverALista);


    document
        .getElementById("habCuatrimestre")
        .addEventListener("change", cargarHabilitacion);


    document
        .getElementById("cierrePeriodo")
        .addEventListener("change", cargarCierre);


    document
        .getElementById("btnGuardarCierre")
        .addEventListener("click", guardarCierre);


    document
        .getElementById("btnUsarPromedios")
        .addEventListener("click", usarPromedios);


    document
        .getElementById("btnTodosPresentes")
        .addEventListener("click", ()=>{


            document.querySelectorAll(".marca-presente")
                .forEach(caja=>{ caja.checked = true; });


            actualizarResumen();


        });


}




// ===============================
// AYUDAS
// ===============================

// El date del navegador espera AAAA-MM-DD en hora local;
// toISOString daria UTC y a la noche cambiaria de dia

function fechaDeHoy(){


    const hoy = new Date();


    const mes =
    String(hoy.getMonth() + 1).padStart(2, "0");


    const dia =
    String(hoy.getDate()).padStart(2, "0");


    return hoy.getFullYear() + "-" + mes + "-" + dia;


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

// Las partes del curso. Aparecen en el menu lateral y,
// en el telefono, como pestañas: las dos llaman a lo mismo.

const SECCIONES_DEL_CURSO = [
    { panel:"panelAsistencia",   texto:"Asistencia" },
    { panel:"panelEvaluaciones", texto:"Evaluaciones" },
    { panel:"panelHabilitacion", texto:"Habilitación al examen" },
    { panel:"panelCierre",       texto:"Cierre de período" }
];


function activarPanel(id){


    document.querySelectorAll(".solapa")
        .forEach(solapa=>{


            solapa.classList.toggle(
                "activa",
                solapa.dataset.panel === id
            );


        });


    SECCIONES_DEL_CURSO.forEach(seccion=>{


        const panel =
        document.getElementById(seccion.panel);


        if(panel){


            panel.classList.toggle(
                "hidden",
                seccion.panel !== id
            );


        }


    });


    if(typeof marcarSeccionActiva === "function"){


        marcarSeccionActiva(id);


    }


    if(id === "panelEvaluaciones"){


        cargarEvaluaciones();


    }


    if(id === "panelHabilitacion"){


        cargarHabilitacion();


    }


    if(id === "panelCierre"){


        cargarCierre();


    }


}




function conectarSolapas(){


    document.querySelectorAll(".solapa")
        .forEach(solapa=>{


            solapa.addEventListener(
                "click",
                ()=>activarPanel(solapa.dataset.panel)
            );


        });


}




// ===============================
// EVALUACIONES
// ===============================

let evaluaciones = [];

let evaluacionActual = null;

let alumnosNotas = [];




async function cargarEvaluaciones(){


    if(!nivelActual){


        return;


    }


    try{


        const respuesta = await fetch(
            `${API}/mi-espacio/niveles/${nivelActual.nivel_id}/evaluaciones`
        );


        const datos = await respuesta.json();


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
            <td colspan="5" class="empty-state">
                Sin evaluaciones todavía.
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
                ${ev.obligatoria
                    ? `<br><small class="texto-tenue">habilita al examen</small>`
                    : ""}
                ${ev.fecha
                    ? `<br><small class="texto-tenue">${formatearFecha(ev.fecha)}</small>`
                    : ""}
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

            <td>
                <div class="action-group">

                    <button type="button"
                        class="button pequeno cargar-notas"
                        data-id="${ev.id}">
                        Cargar
                    </button>

                    ${Number(ev.corregidos) === 0
                        ? `<button type="button"
                               class="button secondary pequeno borrar-evaluacion"
                               data-id="${ev.id}">
                               Borrar
                           </button>`
                        : ""}

                </div>
            </td>

        </tr>

    `).join("");


    document.querySelectorAll(".cargar-notas")
        .forEach(boton=>{


            boton.addEventListener(
                "click",
                ()=>abrirNotas(Number(boton.dataset.id))
            );


        });


    document.querySelectorAll(".borrar-evaluacion")
        .forEach(boton=>{


            boton.addEventListener(
                "click",
                ()=>borrarEvaluacion(Number(boton.dataset.id))
            );


        });


}




async function crearEvaluacion(evento){


    evento.preventDefault();


    const cuerpo = {
        anio:         nivelActual.anio,
        cuatrimestre: Number(document.getElementById("evCuatrimestre").value),
        area:         document.getElementById("evArea").value,
        tipo:         document.getElementById("evTipo").value,
        titulo:       document.getElementById("evTitulo").value.trim(),
        fecha:        document.getElementById("evFecha").value || null,
        obligatoria:  document.getElementById("evObligatoria").value === "si"
    };


    try{


        const respuesta = await fetch(
            `${API}/mi-espacio/niveles/${nivelActual.nivel_id}/evaluaciones`,
            {
                method:"POST",
                headers:{ "Content-Type":"application/json" },
                body: JSON.stringify(cuerpo)
            }
        );


        const datos = await respuesta.json();


        if(!respuesta.ok){


            mostrarNotificacion(
                datos.error || "No se pudo crear",
                "error"
            );


            return;


        }


        mostrarNotificacion("Evaluación creada", "exito");


        document.getElementById("formEvaluacion").reset();


        await cargarEvaluaciones();


    }
    catch(error){


        console.error(error);


        mostrarNotificacion(
            "Error creando la evaluación",
            "error"
        );


    }


}




async function borrarEvaluacion(id){


    try{


        const respuesta = await fetch(
            `${API}/mi-espacio/evaluaciones/${id}`,
            { method:"DELETE" }
        );


        const datos = await respuesta.json();


        mostrarNotificacion(
            datos.error || datos.mensaje,
            respuesta.ok ? "exito" : "error"
        );


        if(respuesta.ok){


            await cargarEvaluaciones();


        }


    }
    catch(error){


        console.error(error);


        mostrarNotificacion(
            "Error eliminando la evaluación",
            "error"
        );


    }


}




// ===============================
// CARGAR NOTAS
// ===============================

async function abrirNotas(id){


    try{


        const respuesta = await fetch(
            `${API}/mi-espacio/evaluaciones/${id}/resultados`
        );


        const datos = await respuesta.json();


        if(!respuesta.ok){


            mostrarNotificacion(
                datos.error || "No se pudieron cargar los resultados",
                "error"
            );


            return;


        }


        evaluacionActual = datos.evaluacion;

        alumnosNotas = datos.alumnos;


        document.getElementById("tituloNotas").textContent =
        evaluacionActual.titulo;


        document.getElementById("subtituloNotas").textContent =
        evaluacionActual.area === "Teoría"
            ? "Notas del 1 al 10. Se aprueba desde 7."
            : "Marcá aprobado o desaprobado.";


        document.getElementById("columnaNota").textContent =
        evaluacionActual.area === "Teoría"
            ? "Nota"
            : "Resultado";


        mostrarNotas();


        document.getElementById("listadoEvaluaciones")
            .classList.add("hidden");


        document.getElementById("panelNotas")
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




function mostrarNotas(){


    const esTeoria =
    evaluacionActual.area === "Teoría";


    document.getElementById("tablaNotas").innerHTML =
    alumnosNotas.map(alumno=>`

        <tr data-alumno="${alumno.alumno_id}">

            <td>
                ${escaparHTML(alumno.apellido)},
                ${escaparHTML(alumno.nombre)}
            </td>

            <td>
                ${esTeoria
                    ? `<input type="number" class="campo-tabla campo-nota"
                           min="1" max="10" step="0.25"
                           value="${alumno.nota ?? ""}">`
                    : `<select class="campo-tabla campo-resultado">
                           <option value="">—</option>
                           <option value="Aprobado"
                               ${alumno.resultado === "Aprobado" ? "selected" : ""}>
                               Aprobado
                           </option>
                           <option value="Desaprobado"
                               ${alumno.resultado === "Desaprobado" ? "selected" : ""}>
                               Desaprobado
                           </option>
                       </select>`}
            </td>

            <td>
                <input type="checkbox" class="campo-ausente"
                    ${alumno.ausente === true ? "checked" : ""}>
            </td>

            <td>
                <input type="text" class="campo-ancho campo-observaciones"
                    value="${escaparHTML(alumno.observaciones || "")}">
            </td>

        </tr>

    `).join("");


}




async function guardarNotas(){


    const resultados =
    [...document.querySelectorAll("#tablaNotas tr")]
        .map(fila=>{


            const nota =
            fila.querySelector(".campo-nota");


            const resultado =
            fila.querySelector(".campo-resultado");


            return {

                alumno_id: Number(fila.dataset.alumno),

                nota: nota && nota.value !== ""
                    ? Number(nota.value)
                    : null,

                resultado: resultado
                    ? resultado.value || null
                    : null,

                ausente:
                    fila.querySelector(".campo-ausente").checked,

                observaciones:
                    fila.querySelector(".campo-observaciones").value.trim() || null

            };


        });


    try{


        const respuesta = await fetch(
            `${API}/mi-espacio/evaluaciones/${evaluacionActual.id}/resultados`,
            {
                method:"POST",
                headers:{ "Content-Type":"application/json" },
                body: JSON.stringify({ resultados })
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
            "Resultados guardados (" + datos.guardados + ")",
            "exito"
        );


    }
    catch(error){


        console.error(error);


        mostrarNotificacion(
            "Error guardando los resultados",
            "error"
        );


    }


}




function volverALista(){


    document.getElementById("panelNotas")
        .classList.add("hidden");


    document.getElementById("listadoEvaluaciones")
        .classList.remove("hidden");


    cargarEvaluaciones();


}




// ===============================
// HABILITACION AL EXAMEN
// ===============================

async function cargarHabilitacion(){


    if(!nivelActual){


        return;


    }


    const cuatrimestre =
    document.getElementById("habCuatrimestre").value;


    try{


        const respuesta = await fetch(
            `${API}/mi-espacio/niveles/${nivelActual.nivel_id}/habilitacion`
            + `?cuatrimestre=${cuatrimestre}`
        );


        const datos = await respuesta.json();


        if(!respuesta.ok){


            mostrarNotificacion(
                datos.error || "No se pudo calcular",
                "error"
            );


            return;


        }


        mostrarHabilitacion(datos);


    }
    catch(error){


        console.error(error);


        mostrarNotificacion(
            "Error calculando la habilitación",
            "error"
        );


    }


}




function mostrarHabilitacion(lista){


    const puedeRendir = alumno=>
    !alumno.adeuda || !!alumno.excepcion_motivo;


    const habilitados =
    lista.filter(puedeRendir).length;


    document.getElementById("resumenHabilitacion").textContent =
    habilitados + " de " + lista.length + " pueden rendir";


    document.getElementById("tablaHabilitacion").innerHTML =
    lista.map(alumno=>{


        const porExcepcion =
        !!alumno.adeuda && !!alumno.excepcion_motivo;


        const puede = puedeRendir(alumno);


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

        </tr>

        `;


    }).join("");


}




// ===============================
// FECHA LEGIBLE
// ===============================

function formatearFecha(valor){


    if(!valor){


        return "";


    }


    const partes =
    String(valor).slice(0, 10).split("-");


    return partes[2] + "/" + partes[1] + "/" + partes[0];


}




// ===============================
// CIERRE DE PERIODO
// ===============================

let listaCierre = [];


async function cargarCierre(){


    if(!nivelActual){


        return;


    }


    const periodo =
    document.getElementById("cierrePeriodo").value;


    try{


        const respuesta = await fetch(
            `${API}/mi-espacio/niveles/${nivelActual.nivel_id}/cierres`
            + `?periodo=${encodeURIComponent(periodo)}`
        );


        const datos = await respuesta.json();


        // Si cambiaron de periodo mientras viajaba, esta
        // respuesta llega tarde y no sirve
        if(document.getElementById("cierrePeriodo").value !== periodo){


            return;


        }


        if(!respuesta.ok){


            mostrarNotificacion(
                datos.error || "No se pudo cargar el cierre",
                "error"
            );


            return;


        }


        listaCierre = datos;


        mostrarCierre();


    }
    catch(error){


        console.error(error);


        mostrarNotificacion(
            "Error cargando el cierre",
            "error"
        );


    }


}




function mostrarCierre(){


    const cerrados =
    listaCierre.filter(a=>a.cierre_id).length;


    document.getElementById("resumenCierre").textContent =
    cerrados + " de " + listaCierre.length + " ya tienen cierre guardado";


    document.getElementById("tablaCierre").innerHTML =
    listaCierre.map(alumno=>`

        <tr data-alumno="${alumno.alumno_id}">

            <td>
                ${escaparHTML(alumno.apellido)},
                ${escaparHTML(alumno.nombre)}
                ${alumno.cerrado_el
                    ? `<br><small class="texto-tenue">cerrado el ${formatearFecha(alumno.cerrado_el)}</small>`
                    : ""}
            </td>

            <td class="promedio-sugerido" data-promedio="${alumno.promedio ?? ""}">
                ${alumno.promedio ?? "—"}
                <br><small class="texto-tenue">
                    ${alumno.notas_contadas}
                    ${Number(alumno.notas_contadas) === 1 ? "nota" : "notas"}
                </small>
            </td>

            <td>
                <input type="number" class="campo-tabla campo-final"
                    min="1" max="10" step="0.25"
                    value="${alumno.nota_final ?? ""}">
            </td>

            <td>
                <select class="campo-tabla campo-condicion">
                    <option value="Promocionado"
                        ${alumno.condicion === "Promocionado" ? "selected" : ""}>
                        Promocionado
                    </option>
                    <option value="Regular"
                        ${alumno.condicion === "Regular" || !alumno.condicion ? "selected" : ""}>
                        Regular
                    </option>
                    <option value="Libre"
                        ${alumno.condicion === "Libre" ? "selected" : ""}>
                        Libre
                    </option>
                </select>
            </td>

            <td>
                <input type="text" class="campo-ancho campo-obs-cierre"
                    value="${escaparHTML(alumno.observaciones || "")}">
            </td>

        </tr>

    `).join("");


}




// Copia el promedio calculado a la nota final, sin pisar
// lo que el instructor ya haya escrito a mano

function usarPromedios(){


    let copiados = 0;


    document.querySelectorAll("#tablaCierre tr")
        .forEach(fila=>{


            const sugerido =
            fila.querySelector(".promedio-sugerido").dataset.promedio;


            const campo =
            fila.querySelector(".campo-final");


            if(sugerido && campo.value === ""){


                campo.value = sugerido;

                copiados++;


            }


        });


    mostrarNotificacion(
        copiados === 0
            ? "No había promedios para copiar"
            : copiados === 1
                ? "Se copió 1 promedio"
                : "Se copiaron " + copiados + " promedios",
        copiados === 0 ? "error" : "exito"
    );


}




async function guardarCierre(){


    const periodo =
    document.getElementById("cierrePeriodo").value;


    const cierres =
    [...document.querySelectorAll("#tablaCierre tr")]
        .map(fila=>({

            alumno_id:
                Number(fila.dataset.alumno),

            nota_final:
                fila.querySelector(".campo-final").value || null,

            condicion:
                fila.querySelector(".campo-condicion").value,

            observaciones:
                fila.querySelector(".campo-obs-cierre").value.trim() || null

        }));


    try{


        const respuesta = await fetch(
            `${API}/mi-espacio/niveles/${nivelActual.nivel_id}/cierres`,
            {
                method:"POST",
                headers:{ "Content-Type":"application/json" },
                body: JSON.stringify({
                    periodo,
                    anio: nivelActual.anio,
                    cierres
                })
            }
        );


        const datos = await respuesta.json();


        if(!respuesta.ok){


            mostrarNotificacion(
                datos.error || "No se pudo guardar el cierre",
                "error"
            );


            return;


        }


        mostrarNotificacion(
            "Cierre guardado (" + datos.guardados + ")",
            "exito"
        );


        await cargarCierre();


    }
    catch(error){


        console.error(error);


        mostrarNotificacion(
            "Error guardando el cierre",
            "error"
        );


    }


}
