// ===============================
// TOKEN EN CADA PEDIDO
// ===============================

// Envuelve a fetch para que todas las llamadas viajen
// con el token. Si el servidor responde 401, cierra la
// sesion y vuelve al login.

// Tiene que cargarse primero, antes que el resto de los
// scripts, para que el envoltorio ya este puesto cuando
// las pantallas salen a pedir datos.

(function(){


    const fetchOriginal =
    window.fetch.bind(window);


    window.fetch = async function(recurso, opciones){


        const config = { ...opciones };


        const destino =
        String(recurso?.url ?? recurso ?? "");


        // Solo le ponemos el token a nuestra propia API
        const esExterno =
        /^https?:\/\//i.test(destino)
        && !destino.startsWith(window.location.origin);


        const token =
        localStorage.getItem("token");


        if(token && !esExterno){


            config.headers =
            new Headers(config.headers || {});


            config.headers.set(
                "Authorization",
                "Bearer " + token
            );


        }


        const respuesta =
        await fetchOriginal(recurso, config);


        // El login tiene que poder fallar sin que lo
        // mandemos de nuevo al login
        if(
            respuesta.status === 401
            && !destino.includes("/auth/login")
        ){


            localStorage.removeItem("token");

            localStorage.removeItem("usuario");

            window.location.href = "login.html";


        }


        return respuesta;


    };


})();
