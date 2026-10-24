// ======================================
// SIGEM - nueva-iglesia.js
// Agregar una iglesia sin salir del formulario
// ======================================

// Se usa en el alta de alumnos y en la ficha, porque el caso es el mismo en
// los dos lados: aparece un alumno de una iglesia que todavía no está
// cargada, y mandar a la persona a otra pantalla significa perder todo lo
// que ya escribió.


function montarNuevaIglesia(idSelect){


    const select =
        document.getElementById(idSelect);


    if(!select){
        return;
    }


    // Las iglesias se recargan varias veces (al abrir el alta, al entrar en
    // edición), y no hace falta volver a montar el botón cada vez.
    if(select.dataset.nuevaIglesia === "si"){
        return;
    }

    select.dataset.nuevaIglesia = "si";



    const caja =
        document.createElement("div");

    caja.className = "nueva-iglesia";


    caja.innerHTML = `

        <button
            type="button"
            class="button secondary nueva-iglesia-abrir">
            + Agregar iglesia
        </button>


        <div class="nueva-iglesia-form hidden">

            <input
                type="text"
                class="nueva-iglesia-nombre"
                maxlength="100"
                placeholder="Nombre de la iglesia"
                autocomplete="off">

            <div class="nueva-iglesia-acciones">

                <button
                    type="button"
                    class="button primary nueva-iglesia-guardar">
                    Guardar
                </button>

                <button
                    type="button"
                    class="button secondary nueva-iglesia-cerrar">
                    Cancelar
                </button>

            </div>

        </div>

    `;


    select.insertAdjacentElement("afterend", caja);



    const botonAbrir =
        caja.querySelector(".nueva-iglesia-abrir");

    const formulario =
        caja.querySelector(".nueva-iglesia-form");

    const campoNombre =
        caja.querySelector(".nueva-iglesia-nombre");

    const botonGuardar =
        caja.querySelector(".nueva-iglesia-guardar");

    const botonCerrar =
        caja.querySelector(".nueva-iglesia-cerrar");



    // El select vive dentro de un <label>, y un click en cualquier cosa de
    // adentro se reenvía al control etiquetado: sin esto, tocar "Guardar"
    // también abriría el desplegable de iglesias.
    caja.addEventListener("click", evento => {
        evento.preventDefault();
    });



    function abrir(){

        formulario.classList.remove("hidden");

        botonAbrir.classList.add("hidden");

        campoNombre.focus();

    }


    function cerrar(){

        campoNombre.value = "";

        formulario.classList.add("hidden");

        botonAbrir.classList.remove("hidden");

    }



    async function guardar(){


        const nombre =
            campoNombre.value.trim();


        if(!nombre){

            mostrarNotificacion(
                "Escribí el nombre de la iglesia",
                "error"
            );

            campoNombre.focus();

            return;

        }



        botonGuardar.disabled = true;


        try{


            const respuesta = await fetch(
                "/filiales",
                {
                    method:"POST",

                    headers:{
                        "Content-Type":"application/json"
                    },

                    body:JSON.stringify({ nombre })
                }
            );


            const datos =
                await respuesta.json();


            if(!respuesta.ok){

                throw new Error(
                    datos.error ||
                    "No se pudo crear la iglesia"
                );

            }



            agregarYSeleccionar(datos);


            mostrarNotificacion(
                datos.yaExistia
                    ? `"${datos.nombre}" ya estaba cargada, la seleccioné`
                    : `Iglesia "${datos.nombre}" creada`,
                datos.yaExistia ? "info" : "exito"
            );


            cerrar();


        }catch(error){

            console.error(error);

            mostrarNotificacion(
                error.message,
                "error"
            );

        }finally{

            botonGuardar.disabled = false;

        }

    }



    // Se agrega la opción a mano en lugar de recargar la lista entera:
    // recargar pisaría lo que la persona ya eligió en el resto del formulario
    // si alguna otra parte vuelve a dibujar el select.
    function agregarYSeleccionar(iglesia){


        const yaEsta =
            Array.from(select.options).some(
                opcion => opcion.value == iglesia.id
            );


        if(!yaEsta){

            const opcion =
                document.createElement("option");

            opcion.value = iglesia.id;

            opcion.textContent = iglesia.nombre;

            select.appendChild(opcion);

        }


        select.value = iglesia.id;


        // Para que cualquier cosa que escuche al select se entere del cambio
        select.dispatchEvent(
            new Event("change", { bubbles:true })
        );

    }



    botonAbrir.addEventListener("click", abrir);

    botonCerrar.addEventListener("click", cerrar);

    botonGuardar.addEventListener("click", guardar);


    // Enter dentro del campo guarda la iglesia, y sobre todo NO manda el
    // formulario del alumno, que es lo que haría por defecto.
    campoNombre.addEventListener("keydown", evento => {

        if(evento.key === "Enter"){

            evento.preventDefault();

            guardar();

        }

        if(evento.key === "Escape"){

            evento.preventDefault();

            cerrar();

        }

    });



    // El botón solo tiene sentido cuando el select se puede usar. En la ficha
    // del alumno los campos arrancan deshabilitados y se habilitan al entrar
    // en edición, en tres lugares distintos del código; mirar el atributo
    // evita tener que acordarse de avisarle al botón en cada uno.
    function sincronizarConSelect(){

        caja.classList.toggle("hidden", select.disabled);

        if(select.disabled){
            cerrar();
        }

    }


    new MutationObserver(sincronizarConSelect)
        .observe(select, {
            attributes:true,
            attributeFilter:["disabled"]
        });


    sincronizarConSelect();


}
