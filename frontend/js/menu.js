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
// SECCIONES SOLO DEL SUPERADMIN
// ===============================

// Esconde los enlaces reservados. Es solo cosmetico:
// quien decide de verdad es el backend, que rechaza
// el pedido venga de donde venga.

(function(){


    let rol = null;


    try{


        rol = JSON.parse(
            localStorage.getItem("usuario") || "null"
        )?.rol;


    }
    catch(error){


        rol = null;


    }


    if(rol === "superadmin"){


        document
            .querySelectorAll(".solo-superadmin")
            .forEach(elemento=>{


                elemento.classList.remove("solo-superadmin");


            });


    }


})();
