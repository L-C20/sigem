console.log("AUTH FRONTEND CARGADO");


// ==========================================
// COMPROBAR SESIÓN
// ==========================================

function verificarSesion() {

    const token =
        localStorage.getItem("token");


    if (!token) {

        window.location.href =
            "login.html";

        return false;

    }


    return true;

}


// ==========================================
// OBTENER USUARIO
// ==========================================

function obtenerUsuario() {

    const usuario =
        localStorage.getItem("usuario");


    if (!usuario) {
        return null;
    }


    try {

        return JSON.parse(usuario);

    }
    catch (error) {

        console.error(
            "Error leyendo usuario:",
            error
        );

        return null;

    }

}


// ==========================================
// CERRAR SESIÓN
// ==========================================

function cerrarSesion() {

    localStorage.removeItem("token");

    localStorage.removeItem("usuario");

    window.location.href =
        "login.html";

}