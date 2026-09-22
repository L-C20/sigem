// ===============================
// BOTONES DE ACCION CON ICONO
// ===============================

// Usado por los listados (alumnos, instrumentos, teoria,
// instruccion ministerial) para dibujar ver / editar / eliminar


const ICONO_VER = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
     stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
     aria-hidden="true">
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/>
    <circle cx="12" cy="12" r="3"/>
</svg>
`;


const ICONO_EDITAR = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
     stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
     aria-hidden="true">
    <path d="M12 20h9"/>
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>
</svg>
`;


const ICONO_ELIMINAR = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
     stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
     aria-hidden="true">
    <path d="M3 6h18"/>
    <path d="M8 6V4h8v2"/>
    <path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6M14 11v6"/>
</svg>
`;


// opciones:
//   ficha       -> url de la ficha (obligatoria)
//   eliminarId  -> si viene, agrega el boton de eliminar
//   nombre      -> se usa en las etiquetas accesibles

function botonesAccion(opciones){


    const ficha = opciones.ficha;


    const nombre =
    opciones.nombre
        ? " de " + opciones.nombre
        : "";


    const separador =
    ficha.includes("?") ? "&" : "?";


    let html = `

    <div class="action-group">

        <a
            class="action-icon action-ver"
            href="${ficha}"
            title="Ver"
            aria-label="Ver ficha${nombre}">
            ${ICONO_VER}
        </a>

        <a
            class="action-icon action-editar"
            href="${ficha}${separador}editar=1"
            title="Editar"
            aria-label="Editar ficha${nombre}">
            ${ICONO_EDITAR}
        </a>
    `;


    if(opciones.eliminarId !== undefined){


        html += `

        <button
            type="button"
            class="action-icon action-eliminar action-delete"
            data-id="${opciones.eliminarId}"
            title="Eliminar"
            aria-label="Eliminar${nombre}">
            ${ICONO_ELIMINAR}
        </button>
        `;


    }


    return html + "</div>";


}




// ===============================
// ABRIR LA FICHA EN MODO EDICION
// ===============================

// Las fichas llegan con ?editar=1 desde el lapiz del listado

function abrirEnModoEdicion(activar){


    const pedido =
    new URLSearchParams(window.location.search)
        .get("editar");


    if(pedido === "1"){


        activar();


    }


}
