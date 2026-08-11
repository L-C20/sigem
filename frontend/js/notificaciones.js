// ==========================================
// NOTIFICACIONES SIGEM
// ==========================================

let temporizadorNotificacion = null;


function mostrarNotificacion(
    mensaje,
    tipo = "exito"
) {

    const notificacion =
        document.getElementById(
            "notificacionSIGEM"
        );

    const icono =
        document.getElementById(
            "notificacionIcono"
        );

    const texto =
        document.getElementById(
            "notificacionMensaje"
        );


    // Si esta página no tiene notificaciones,
    // simplemente no hacemos nada.

    if (
        !notificacion ||
        !icono ||
        !texto
    ) {

        return;

    }


    clearTimeout(
        temporizadorNotificacion
    );


    texto.textContent =
        mensaje;


    notificacion.classList.remove(
        "exito",
        "error"
    );


    notificacion.classList.add(
        tipo
    );


    icono.textContent =
        tipo === "exito"
            ? "✓"
            : "✕";


    notificacion.classList.add(
        "mostrar"
    );


    temporizadorNotificacion =
        setTimeout(
            () => {

                notificacion.classList.remove(
                    "mostrar"
                );

            },
            3000
        );

}