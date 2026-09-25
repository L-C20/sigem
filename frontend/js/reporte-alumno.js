// ===============================
// REPORTE DEL ALUMNO
// ===============================

// Todo lo que la escuela sabe de una persona, en una hoja:
// quién es, qué cursa, cuánto vino, cómo le fue y qué se
// decidió al cerrar.

// La página no calcula permisos: pide el reporte y el
// backend decide. Si no le corresponde, vuelve 403 y acá se
// muestra el motivo.

// La nota de aprobación no se repite acá: el resultado
// (Aprobado / Desaprobado) lo guardó quien corrigió, y es
// eso lo que se muestra. Si mañana cambia el 7, lo ya
// corregido no cambia de estado solo.


const idDelAlumno =
new URLSearchParams(window.location.search).get("id");


const caja =
document.getElementById("reporte");




// ===============================
// ESCAPAR
// ===============================

function esc(valor){


    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");


}




// ===============================
// FORMATOS
// ===============================

function fecha(valor){


    if(!valor){


        return "—";


    }


    // Las fechas llegan como 2026-03-14 o con hora: se
    // parte el texto en vez de usar new Date, que
    // interpreta la zona horaria y a veces corre un día
    const soloFecha = String(valor).slice(0, 10);


    const partes = soloFecha.split("-");


    if(partes.length !== 3){


        return esc(valor);


    }


    return partes[2] + "/" + partes[1] + "/" + partes[0];


}




function texto(valor){


    const limpio = String(valor ?? "").trim();


    return limpio === "" ? "—" : esc(limpio);


}




function numero(valor, decimales = 2){


    const n = Number(valor);


    return Number.isFinite(n)
        ? n.toFixed(decimales).replace(".", ",")
        : "—";


}




// ===============================
// PEDIR EL REPORTE
// ===============================

async function cargar(){


    if(!idDelAlumno){


        caja.innerHTML = `
        <p class="error-state">
            Falta el alumno en la dirección.
        </p>`;


        return;


    }


    document.getElementById("enlaceFicha").href =
    "alumno.html?id=" + encodeURIComponent(idDelAlumno);


    try{


        const respuesta =
        await fetch(
            "/academico/alumnos/"
            + encodeURIComponent(idDelAlumno)
            + "/reporte"
        );


        if(!respuesta.ok){


            const detalle =
            await respuesta.json().catch(()=>({}));


            caja.innerHTML = `
            <p class="error-state">
                ${esc(detalle.error || "No se pudo armar el reporte.")}
            </p>`;


            return;


        }


        dibujar(await respuesta.json());


    }
    catch(error){


        console.error(error);


        caja.innerHTML = `
        <p class="error-state">
            No se pudo conectar con el servidor.
        </p>`;


    }


}




// ===============================
// DIBUJAR
// ===============================

function dibujar(datos){


    const a = datos.alumno;


    document.getElementById("nombreAlumno").textContent =
    a.apellido + ", " + a.nombre;


    document.getElementById("subtitulo").textContent =
    [
        a.dni ? "DNI " + a.dni : null,
        a.edad ? Number(a.edad) + " años" : null,
        a.iglesia
    ]
    .filter(Boolean)
    .join(" · ");


    caja.innerHTML =
      seccionDatos(a)
    + seccionCursa(datos)
    + seccionAsistencia(datos.asistencia)
    + seccionEvaluaciones(datos.evaluaciones)
    + seccionHabilitacion(datos.habilitacion)
    + seccionCierres(datos.cierres);


}




// ===============================
// QUIEN ES
// ===============================

function seccionDatos(a){


    // texto() escapa; fecha() ya devuelve algo armado por
    // nosotros, así que se pasa tal cual

    const filas = [
        ["DNI",                  texto(a.dni)],
        ["Fecha de nacimiento",  fecha(a.fecha_nacimiento)],
        ["Edad",                 a.edad ? Number(a.edad) + " años" : "—"],
        ["Iglesia",              texto(a.iglesia)],
        ["Teléfono",             texto(a.telefono)],
        ["Teléfono del tutor",   texto(a.telefono_tutor)],
        ["Correo",               texto(a.correo)],
        ["Anciano que autoriza", texto(a.anciano_autoriza)],
        ["Bautizado en agua",    texto(a.bautizado_agua)]
    ];


    return tarjeta(

        "Datos personales",

        null,

        `<dl class="reporte-datos">`
        + filas.map(([rotulo, valor])=>`
            <div>
                <dt>${esc(rotulo)}</dt>
                <dd>${valor}</dd>
            </div>
        `).join("")
        + `</dl>`

        + (String(a.observaciones ?? "").trim()
            ? `<p class="reporte-nota">
                   <strong>Observaciones:</strong>
                   ${esc(a.observaciones)}
               </p>`
            : "")

    );


}




// ===============================
// QUE CURSA
// ===============================

function seccionCursa(datos){


    let cuerpo = "";


    // ---- TEORIA ----

    if(datos.teoria.length === 0){


        cuerpo += bloqueVacio(
            "Teoría y Solfeo",
            "No cursa."
        );


    }
    else{


        cuerpo += `
        <div class="reporte-bloque">

            <h3>Teoría y Solfeo</h3>

            <ul class="reporte-lista">
            ${datos.teoria.map(c=>`
                <li>
                    <span class="reporte-etiqueta">${esc(c.anio)}</span>
                    ${esc(c.nivel)}
                    <span class="texto-tenue">
                        · ${texto(c.instructor)}
                    </span>
                    ${etiquetaEstado(c.estado)}
                </li>
            `).join("")}
            </ul>

        </div>`;


    }


    // ---- INSTRUMENTO ----

    if(datos.instrumento.length === 0){


        cuerpo += bloqueVacio(
            "Instrumento",
            "No cursa."
        );


    }
    else{


        cuerpo += `
        <div class="reporte-bloque">

            <h3>Instrumento</h3>

            <ul class="reporte-lista">
            ${datos.instrumento.map(c=>`
                <li>
                    ${texto(c.instrumento)}
                    <span class="texto-tenue">
                        · ${texto(c.nivel)}
                        · ${texto(c.instructor)}
                    </span>
                    ${etiquetaEstado(c.estado)}
                </li>
            `).join("")}
            </ul>

        </div>`;


    }


    // ---- MINISTERIAL ----

    const m = datos.ministerial;


    if(!m || m.estado === "No pertenece"){


        cuerpo += bloqueVacio(
            "Instrucción Ministerial",
            "No pertenece."
        );


    }
    else{


        cuerpo += `
        <div class="reporte-bloque">

            <h3>Instrucción Ministerial</h3>

            <ul class="reporte-lista">
                <li>
                    ${etiquetaEstado(m.estado)}
                    <span class="texto-tenue">
                        · desde ${fecha(m.fecha_inicio)}
                        ${m.fecha_finalizacion
                            ? " · hasta " + fecha(m.fecha_finalizacion)
                            : ""}
                    </span>
                </li>
            </ul>

            ${String(m.observaciones ?? "").trim()
                ? `<p class="reporte-nota">
                       ${esc(m.observaciones)}
                   </p>`
                : ""}

        </div>`;


    }


    return tarjeta("Qué cursa", null, cuerpo);


}




function bloqueVacio(titulo, mensaje){


    return `
    <div class="reporte-bloque">
        <h3>${esc(titulo)}</h3>
        <p class="texto-tenue">${esc(mensaje)}</p>
    </div>`;


}




function etiquetaEstado(estado){


    const limpio = String(estado ?? "").trim();


    if(limpio === ""){


        return "";


    }


    const clase =
    limpio === "Activo" ? "estado-activo" : "estado-inactivo";


    return `<span class="estado ${clase}">${esc(limpio)}</span>`;


}




// ===============================
// CUANTO VINO
// ===============================

function seccionAsistencia(filas){


    // Presentes sobre clases tomadas, no sobre clases del
    // año: si ese día no se tomó lista, no es una falta

    const conClases =
    filas.filter(f=>Number(f.clases) > 0);


    if(conClases.length === 0){


        return tarjeta(
            "Asistencia",
            "Presentes sobre clases en las que se tomó lista.",
            `<p class="empty-state">
                Todavía no se le tomó asistencia.
            </p>`
        );


    }


    const tarjetas =
    conClases.map(f=>{


        const clases    = Number(f.clases);
        const presentes = Number(f.presentes);

        const porcentaje =
        Math.round(presentes / clases * 100);


        return `
        <div class="reporte-medida">

            <span class="reporte-medida-rotulo">
                ${esc(f.area)}
            </span>

            <strong class="reporte-medida-numero">
                ${porcentaje}%
            </strong>

            <div class="reporte-barra">
                <span style="width:${porcentaje}%"></span>
            </div>

            <span class="reporte-medida-pie">
                ${presentes} de ${clases} clases
                · última ${fecha(f.ultima)}
            </span>

        </div>`;


    }).join("");


    return tarjeta(
        "Asistencia",
        "Presentes sobre clases en las que se tomó lista.",
        `<div class="reporte-medidas">${tarjetas}</div>`
    );


}




// ===============================
// COMO LE FUE
// ===============================

function seccionEvaluaciones(filas){


    if(filas.length === 0){


        return tarjeta(
            "Evaluaciones",
            null,
            `<p class="empty-state">
                Todavía no tiene evaluaciones corregidas.
            </p>`
        );


    }


    // ---- RESUMEN ----

    const notas =
    filas
        .filter(f=>f.area === "Teoría" && f.nota !== null && !f.ausente)
        .map(f=>Number(f.nota));


    const promedio =
    notas.length > 0
        ? notas.reduce((suma, n)=>suma + n, 0) / notas.length
        : null;


    const solfeo =
    filas.filter(f=>f.area === "Solfeo");


    const resumen = [

        promedio !== null
            ? {
                rotulo: "Promedio de Teoría",
                valor:  numero(promedio, 2),
                pie:    notas.length + " notas"
              }
            : null,

        solfeo.length > 0
            ? {
                rotulo: "Solfeo",
                valor:  solfeo.filter(f=>f.resultado === "Aprobado").length
                        + "/" + solfeo.length,
                pie:    "aprobadas"
              }
            : null,

        {
            rotulo: "Ausencias",
            valor:  filas.filter(f=>f.ausente).length,
            pie:    "en evaluaciones"
        }

    ].filter(Boolean);


    const cabezaResumen = `
    <div class="reporte-cifras">
    ${resumen.map(r=>`
        <div class="reporte-cifra">
            <span class="reporte-medida-rotulo">${esc(r.rotulo)}</span>
            <strong class="reporte-medida-numero">${esc(r.valor)}</strong>
            <span class="reporte-medida-pie">${esc(r.pie)}</span>
        </div>
    `).join("")}
    </div>`;


    // ---- TABLA ----

    const tabla = `
    <div class="table-wrapper">
    <table>

        <thead>
            <tr>
                <th>Período</th>
                <th>Nivel</th>
                <th>Área</th>
                <th>Tipo</th>
                <th>Evaluación</th>
                <th>Fecha</th>
                <th>Resultado</th>
            </tr>
        </thead>

        <tbody>
        ${filas.map(f=>`
            <tr>
                <td>${esc(f.anio)} · ${esc(f.cuatrimestre)}º</td>
                <td>${texto(f.nivel)}</td>
                <td>${texto(f.area)}</td>
                <td>
                    ${texto(f.tipo)}
                    ${f.obligatoria
                        ? `<span class="reporte-marca">obligatoria</span>`
                        : ""}
                </td>
                <td>
                    ${texto(f.titulo)}
                    ${String(f.observaciones ?? "").trim()
                        ? `<span class="reporte-observacion">
                               ${esc(f.observaciones)}
                           </span>`
                        : ""}
                </td>
                <td>${fecha(f.fecha)}</td>
                <td>${resultadoDe(f)}</td>
            </tr>
        `).join("")}
        </tbody>

    </table>
    </div>`;


    return tarjeta(
        "Evaluaciones",
        "Solo las que tienen algo cargado.",
        cabezaResumen + tabla
    );


}




function resultadoDe(f){


    if(f.ausente){


        return `<span class="estado estado-inactivo">Ausente</span>`;


    }


    const partes = [];


    if(f.nota !== null && f.nota !== undefined){


        partes.push(
            `<strong>${numero(f.nota, 2)}</strong>`
        );


    }


    if(f.resultado){


        const clase =
        f.resultado === "Aprobado"
            ? "estado-activo"
            : "estado-desaprobado";


        partes.push(
            `<span class="estado ${clase}">${esc(f.resultado)}</span>`
        );


    }


    return partes.length > 0 ? partes.join(" ") : "—";


}




// ===============================
// SI PUEDE RENDIR
// ===============================

function seccionHabilitacion(filas){


    if(filas.length === 0){


        return tarjeta(
            "Habilitación al examen",
            null,
            `<p class="empty-state">
                No hay evaluaciones obligatorias cargadas.
            </p>`
        );


    }


    const cuerpo =
    filas.map(f=>{


        const obligatorias = Number(f.obligatorias);
        const aprobadas    = Number(f.aprobadas);

        const completo =
        obligatorias > 0 && aprobadas === obligatorias;


        const porExcepcion =
        !completo && !!f.excepcion_motivo;


        const habilitado = completo || porExcepcion;


        return `
        <div class="reporte-bloque">

            <h3>
                ${esc(f.anio)} · ${esc(f.cuatrimestre)}º cuatrimestre
                <span class="texto-tenue">· ${texto(f.nivel)}</span>
            </h3>

            <p>
                <span class="estado ${habilitado
                    ? "estado-activo"
                    : "estado-desaprobado"}">
                    ${habilitado ? "Habilitado" : "No habilitado"}
                </span>

                <span class="texto-tenue">
                    ${obligatorias > 0
                        ? aprobadas + " de " + obligatorias
                          + " obligatorias aprobadas"
                        : "por excepción; no hay obligatorias cargadas"}
                </span>
            </p>

            ${f.adeuda
                ? `<p class="reporte-nota">
                       <strong>Adeuda:</strong> ${esc(f.adeuda)}
                   </p>`
                : ""}

            ${f.excepcion_motivo
                ? `<p class="reporte-nota reporte-excepcion">
                       <strong>Excepción:</strong>
                       ${esc(f.excepcion_motivo)}
                       <span class="texto-tenue">
                           — ${texto(f.excepcion_por)},
                           ${fecha(f.excepcion_fecha)}
                       </span>
                   </p>`
                : ""}

        </div>`;


    }).join("");


    return tarjeta(
        "Habilitación al examen",
        "Se calcula: hay que aprobar todas las obligatorias del curso.",
        cuerpo
    );


}




// ===============================
// QUE SE DECIDIO
// ===============================

function seccionCierres(filas){


    if(filas.length === 0){


        return tarjeta(
            "Cierres de período",
            null,
            `<p class="empty-state">
                Todavía no tiene períodos cerrados.
            </p>`
        );


    }


    const tabla = `
    <div class="table-wrapper">
    <table>

        <thead>
            <tr>
                <th>Año</th>
                <th>Nivel</th>
                <th>Período</th>
                <th>Nota final</th>
                <th>Condición</th>
                <th>Cerrado por</th>
            </tr>
        </thead>

        <tbody>
        ${filas.map(f=>`
            <tr>
                <td>${esc(f.anio)}</td>
                <td>${texto(f.nivel)}</td>
                <td>${texto(f.periodo)}</td>
                <td><strong>${numero(f.nota_final, 2)}</strong></td>
                <td>
                    <span class="estado ${f.condicion === "Promocionado"
                        ? "estado-activo"
                        : "estado-inactivo"}">
                        ${texto(f.condicion)}
                    </span>
                    ${String(f.observaciones ?? "").trim()
                        ? `<span class="reporte-observacion">
                               ${esc(f.observaciones)}
                           </span>`
                        : ""}
                </td>
                <td>
                    ${texto(f.cerrado_por)}
                    <span class="reporte-observacion">
                        ${fecha(f.cerrado_el)}
                    </span>
                </td>
            </tr>
        `).join("")}
        </tbody>

    </table>
    </div>`;


    return tarjeta(
        "Cierres de período",
        "La condición la decide una persona; el sistema solo sugiere el promedio.",
        tabla
    );


}




// ===============================
// TARJETA
// ===============================

function tarjeta(titulo, bajada, cuerpo){


    return `
    <section class="card reporte-seccion">

        <div class="section-heading">
            <div>
                <h2>${esc(titulo)}</h2>
                ${bajada ? `<p>${esc(bajada)}</p>` : ""}
            </div>
        </div>

        ${cuerpo}

    </section>`;


}




// ===============================
// IMPRIMIR
// ===============================

document.getElementById("btnImprimir")
    .addEventListener("click", ()=>window.print());


document.getElementById("pieFecha").textContent =
"Emitido el " + new Date().toLocaleDateString("es-AR");


cargar();
