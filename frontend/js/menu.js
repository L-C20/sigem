// ===============================
// MENU LATERAL
// ===============================

// El menu se arma acá, en un solo lugar, y no copiado en
// cada página: así no se desincronizan y alcanza con tocar
// este archivo para cambiarlo en todas.

// Esconder un enlace es cosmético: no protege nada. Quien
// decide de verdad es el backend, que rechaza el pedido
// venga de donde venga. Acá solo evitamos mostrarle a
// alguien puertas que no puede abrir.


const SECCIONES = [

    {
        titulo: null,
        enlaces: [
            {
                href: "index.html",
                texto: "Inicio",
                roles: ["superadmin", "admin", "secretaria"]
            },
            {
                href: "mi-espacio.html",
                texto: "Mi espacio",
                // No depende del rol sino de dar clases:
                // Cesia administra y además enseña
                soloInstructor: true
            }
        ]
    },

    {
        titulo: "Cursos",
        enlaces: [
            {
                href: "alumnos.html",
                texto: "Alumnos",
                roles: ["superadmin", "admin", "secretaria"]
            },
            {
                href: "instrumentos.html",
                texto: "Instrumentos",
                roles: ["superadmin", "admin"]
            },
            {
                href: "teoria.html",
                texto: "Teoría y Solfeo",
                roles: ["superadmin", "admin"]
            },
            {
                href: "instruccion-ministerial.html",
                texto: "Instrucción Ministerial",
                roles: ["superadmin", "admin"]
            }
        ]
    },

    {
        titulo: "Asistencias",
        enlaces: [
            {
                href: "asistencias.html",
                texto: "Tomar asistencia",
                roles: ["superadmin", "admin"]
            },
            {
                href: "registro-asistencias.html",
                texto: "Historial",
                roles: ["superadmin", "admin"]
            }
        ]
    },

    {
        titulo: "Administración",
        enlaces: [
            {
                href: "instructores.html",
                texto: "Instructores",
                roles: ["superadmin", "admin"]
            },
            {
                href: "academico.html",
                texto: "Académico",
                roles: ["superadmin", "admin"]
            },
            {
                href: "usuarios.html",
                texto: "Usuarios",
                roles: ["superadmin"]
            }
        ]
    }

];


const NOMBRE_DEL_ROL = {
    superadmin: "SuperAdmin",
    admin:      "Administración",
    instructor: "Instructor",
    secretaria: "Secretaría"
};




// ===============================
// QUIEN ESTA MIRANDO
// ===============================

function usuarioDelMenu(){


    try{


        return JSON.parse(
            localStorage.getItem("usuario") || "null"
        );


    }
    catch(error){


        return null;


    }


}




// ===============================
// PAGINA ACTUAL
// ===============================

function paginaActual(){


    const partes =
    window.location.pathname.split("/");


    return partes[partes.length - 1] || "index.html";


}




// ===============================
// ARMAR EL MENU
// ===============================

function armarMenu(){


    const sidebar =
    document.querySelector(".sidebar");


    if(!sidebar){


        return;


    }


    const yo = usuarioDelMenu();


    const aqui = paginaActual();


    const puedeVer = enlace=>{


        if(enlace.soloInstructor){


            return !!(yo && yo.instructor_id);


        }


        return !!(yo && enlace.roles.includes(yo.rol));


    };


    let html =
    `
    <div class="brand">
        <div class="brand-logo">SIGEM Dorrego</div>
        <p>Enseñanza de música</p>
    </div>

    <nav class="main-nav" aria-label="Menú principal">
    `;


    SECCIONES.forEach(seccion=>{


        const visibles =
        seccion.enlaces.filter(puedeVer);


        // Un título sin enlaces debajo no tiene sentido
        if(visibles.length === 0){


            return;


        }


        // Un título sobre un solo enlace es ruido: no
        // agrupa nada
        if(seccion.titulo && visibles.length > 1){


            html +=
            `
            <p class="nav-grupo">
                ${seccion.titulo}
            </p>
            `;


        }


        visibles.forEach(enlace=>{


            const activo =
            enlace.href === aqui ? " active" : "";


            html +=
            `
            <a class="nav-link${activo}" href="${enlace.href}">
                ${enlace.texto}
            </a>
            `;


        });


    });


    html += `</nav>`;


    if(yo){


        html +=
        `
        <div class="sidebar-pie">

            <div class="usuario-actual">

                <span class="usuario-nombre">
                    ${escaparMenu(yo.nombre)} ${escaparMenu(yo.apellido)}
                </span>

                <span class="usuario-rol">
                    ${NOMBRE_DEL_ROL[yo.rol] || escaparMenu(yo.rol)}
                </span>

            </div>

            <button type="button" class="logout-button" id="btnCerrarSesion">
                Cerrar sesión
            </button>

        </div>
        `;


    }


    sidebar.innerHTML = html;


    const salir =
    document.getElementById("btnCerrarSesion");


    if(salir){


        salir.addEventListener(
            "click",
            ()=>{


                // cerrarSesion vive en auth.js, que puede
                // cargarse después: lo buscamos al hacer
                // clic, no antes
                if(typeof cerrarSesion === "function"){


                    cerrarSesion();


                }
                else{


                    localStorage.removeItem("token");

                    localStorage.removeItem("usuario");

                    window.location.href = "login.html";


                }


            }
        );


    }


}




function escaparMenu(valor){


    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");


}




// ===============================
// BOTON DE MENU EN PANTALLA CHICA
// ===============================

function conectarBotonMenu(){


    const menuToggle =
    document.getElementById("menuToggle");


    const sidebar =
    document.querySelector(".sidebar");


    if(!menuToggle || !sidebar){


        return;


    }


    menuToggle.addEventListener(
        "click",
        () => {


            const abierto =
            document.body.classList.toggle("menu-open");


            sidebar.classList.toggle("menu-open", abierto);


            menuToggle.setAttribute("aria-expanded", abierto);


        }
    );


    // Al elegir una sección, el menú se cierra solo
    sidebar.addEventListener(
        "click",
        evento=>{


            if(evento.target.closest(".nav-link")){


                document.body.classList.remove("menu-open");

                sidebar.classList.remove("menu-open");

                menuToggle.setAttribute("aria-expanded", false);


            }


        }
    );


}




// ===============================
// SECCIONES DEL CURSO ABIERTO
// ===============================

// Cuando una instructora entra a su nivel, las partes del
// curso se suman al menu lateral en vez de vivir solo como
// pestañas dentro de la pagina. En el telefono el menu
// esta escondido, asi que ahi siguen valiendo las
// pestañas: las dos vias hacen lo mismo.

function mostrarSeccionesDeCurso(titulo, secciones, alElegir){


    const nav =
    document.querySelector(".main-nav");


    if(!nav){


        return;


    }


    ocultarSeccionesDeCurso();


    const bloque = document.createElement("div");


    bloque.className = "nav-curso";


    bloque.innerHTML =
    `<p class="nav-grupo">${escaparMenu(titulo)}</p>`
    + secciones.map(seccion=>`
        <button
            type="button"
            class="nav-link nav-seccion"
            data-panel="${seccion.panel}">
            ${escaparMenu(seccion.texto)}
        </button>
    `).join("");


    nav.appendChild(bloque);


    bloque.querySelectorAll(".nav-seccion")
        .forEach(boton=>{


            boton.addEventListener(
                "click",
                ()=>alElegir(boton.dataset.panel)
            );


        });


    marcarDesborde();


}




function marcarSeccionActiva(panel){


    document.querySelectorAll(".nav-seccion")
        .forEach(boton=>{


            boton.classList.toggle(
                "active",
                boton.dataset.panel === panel
            );


        });


}




function ocultarSeccionesDeCurso(){


    document.querySelectorAll(".nav-curso")
        .forEach(bloque=>bloque.remove());


    marcarDesborde();


}




// ===============================
// AVISAR QUE HAY MAS ABAJO
// ===============================

// Con diez secciones y una pantalla baja, el menú no entra
// entero. En vez de mostrar una barra de desplazamiento
// angosta dentro de la franja oscura, el último renglón se
// desvanece. Solo cuando de verdad hay algo más abajo.

function marcarDesborde(){


    const nav =
    document.querySelector(".main-nav");


    if(!nav){


        return;


    }


    const quedaAbajo =
    nav.scrollHeight - nav.scrollTop - nav.clientHeight > 4;


    nav.classList.toggle("con-mas", quedaAbajo);


}




function vigilarDesborde(){


    const nav =
    document.querySelector(".main-nav");


    if(!nav){


        return;


    }


    marcarDesborde();


    nav.addEventListener("scroll", marcarDesborde);


    window.addEventListener("resize", marcarDesborde);


}




armarMenu();

conectarBotonMenu();

vigilarDesborde();
