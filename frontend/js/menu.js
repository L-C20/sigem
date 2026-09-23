const menuToggle =
    document.getElementById("menuToggle");

const sidebar =
    document.querySelector(".sidebar");


menuToggle.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "menu-open"
        );

        const abierto =
            document.body.classList.contains(
                "menu-open"
            );

        sidebar.classList.toggle(
            "menu-open",
            abierto
        );

        menuToggle.setAttribute(
            "aria-expanded",
            abierto
        );

    }
);

// ===============================
// EL MENU SEGUN QUIEN ENTRA
// ===============================

// Esto es solo cosmetico: esconder un enlace no protege
// nada. Quien decide de verdad es el backend, que rechaza
// el pedido venga de donde venga. Aca solo evitamos
// mostrarle a alguien puertas que no puede abrir.

(function(){


    let yo = null;


    try{


        yo = JSON.parse(
            localStorage.getItem("usuario") || "null"
        );


    }
    catch(error){


        yo = null;


    }


    if(!yo){


        return;


    }


    function revelar(clase){


        document
            .querySelectorAll("." + clase)
            .forEach(elemento=>{


                elemento.classList.remove(clase);


            });


    }


    // El ABM de cuentas es solo tuyo
    if(yo.rol === "superadmin"){


        revelar("solo-superadmin");


    }


    // La vista academica es de quien gobierna la escuela
    if(yo.rol === "superadmin" || yo.rol === "admin"){


        revelar("solo-admin");


    }


    // Quien da clases ve su espacio, sea cual sea su rol.
    // Asi Cesia, que administra y ademas ensena, tiene las
    // dos cosas en el mismo menu.
    if(yo.instructor_id){


        revelar("solo-instructor");


    }


    // El instructor no tiene nada mas que su espacio
    if(yo.rol === "instructor"){


        document
            .querySelectorAll(".main-nav .nav-link")
            .forEach(enlace=>{


                const destino =
                enlace.getAttribute("href") || "";


                if(!destino.startsWith("mi-espacio")){


                    enlace.remove();


                }


            });


    }


})();
