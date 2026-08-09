const API_BASE_URL = "https://sigem-backend.onrender.com";

let alumnoEditando = null;

const elementos = {

  btnAbrirFormulario:
    document.getElementById("btnAbrirFormulario"),

  btnCancelar:
    document.getElementById("btnCancelar"),

  btnActualizar:
    document.getElementById("btnActualizar"),

  formularioAlumno:
    document.getElementById("formularioAlumno"),

    listadoAlumnos:
  document.getElementById("listadoAlumnos"),

  alumnoForm:
    document.getElementById("alumnoForm"),

  tablaAlumnos:
    document.getElementById("tablaAlumnos"),

  buscadorAlumnos:
    document.getElementById("buscadorAlumnos"),

    fechaNacimiento: document.getElementById("fecha_nacimiento"),
edad: document.getElementById("edad"),

estadoMinisterial:
  document.getElementById("estado_ministerial"),

fechaInicioMinisterial:
  document.getElementById("fecha_inicio_ministerial"),

fechaFinMinisterial:
  document.getElementById("fecha_fin_ministerial"),

observacionesMinisterial:
  document.getElementById("observaciones_ministerial"),

  // Formulario

  filialSelect:
    document.getElementById("filial_id"),

  // Filtro tabla

  filtroFilial:
    document.getElementById("filtroFilial"),

  // Instrumento

  instrumentoSelect:
    document.getElementById("instrumento_id"),

  nivelInstrumentoSelect:
    document.getElementById("nivel_instrumento_id"),

  instructorInstrumentoSelect:
    document.getElementById("instructor_instrumento_id"),

  // Teoría

  nivelTeoriaSelect:
    document.getElementById("nivel_teoria_id"),

  instructorTeoriaSelect:
    document.getElementById("instructor_teoria_id")

};


function calcularEdad() {

    const fechaNacimiento = elementos.fechaNacimiento.value;

    if (!fechaNacimiento) {
        elementos.edad.value = "";
        return;
    }

    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento + "T00:00:00");

    let edad = hoy.getFullYear() - nacimiento.getFullYear();

    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (
        mes < 0 ||
        (mes === 0 && hoy.getDate() < nacimiento.getDate())
    ) {
        edad--;
    }

    elementos.edad.value = edad;
}


let alumnos = [];


// =====================================
// INICIO
// =====================================

document.addEventListener("DOMContentLoaded", () => {

  cargarFiliales();

  cargarFilialesFiltro();

  cargarAlumnos();

  cargarInstrumentos();

  cargarNivelesInstrumento();

  cargarNivelesTeoria();

  cargarInstructoresTeoria();


  elementos.btnAbrirFormulario.addEventListener(
    "click",
    mostrarFormulario
  );


  elementos.btnCancelar.addEventListener(
    "click",
    ocultarFormulario
  );


  elementos.btnActualizar.addEventListener(
    "click",
    cargarAlumnos
  );


  elementos.alumnoForm.addEventListener(
    "submit",
    guardarAlumno
  );


  elementos.buscadorAlumnos.addEventListener(
    "input",
    buscarAlumnos
  );

  elementos.fechaNacimiento.addEventListener(
    "change",
    calcularEdad
);

  // =====================================
  // CAMBIO DE INSTRUMENTO
  // =====================================

  elementos.instrumentoSelect.addEventListener(
    "change",
    () => {

      const instrumentoId =
        elementos.instrumentoSelect.value;

      cargarInstructoresInstrumento(
        instrumentoId
      );

    }
  );

});


// =====================================
// MOSTRAR FORMULARIO
// =====================================

function mostrarFormulario() {

  elementos.formularioAlumno.classList.remove("hidden");

  elementos.listadoAlumnos.classList.add("hidden");

  document.getElementById("dni").focus();

}


// =====================================
// OCULTAR FORMULARIO
// =====================================

function ocultarFormulario() {

  elementos.alumnoForm.reset();

  elementos.formularioAlumno.classList.add("hidden");

  elementos.listadoAlumnos.classList.remove("hidden");

  alumnoEditando = null;

}


// =====================================
// CARGAR FILIALES
// =====================================

async function cargarFiliales() {

  try {

    const respuesta =
      await fetch(
        `${API_BASE_URL}/filiales`
      );


    if (!respuesta.ok) {

      throw new Error(
        "No se pudieron cargar iglesias"
      );

    }


    const iglesias =
      await respuesta.json();


    elementos.filialSelect.innerHTML =
      '<option value="">Seleccione una iglesia</option>';


    iglesias.forEach((iglesia) => {

      const opcion =
        document.createElement("option");


      opcion.value =
        iglesia.id;


      opcion.textContent =
        iglesia.nombre;


      elementos.filialSelect.appendChild(
        opcion
      );

    });


  } catch (error) {

    console.error(error);


    elementos.filialSelect.innerHTML =
      '<option value="">No hay iglesias disponibles</option>';

  }

}


// =====================================
// FILTRO DE FILIALES
// =====================================

async function cargarFilialesFiltro() {

  try {

    const respuesta =
      await fetch(
        `${API_BASE_URL}/filiales`
      );


    const iglesias =
      await respuesta.json();


    elementos.filtroFilial.innerHTML = `
      <option value="">
        Todas las iglesias
      </option>
    `;


    iglesias.forEach((iglesia) => {

      elementos.filtroFilial.innerHTML += `
        <option value="${iglesia.id}">
          ${iglesia.nombre}
        </option>
      `;

    });

  } catch (error) {

    console.error(
      "Error cargando filtro de filiales",
      error
    );

  }

}


// =====================================
// CARGAR ALUMNOS
// =====================================

async function cargarAlumnos() {

  mostrarEstadoTabla(
    "Cargando alumnos..."
  );


  try {

    const respuesta =
      await fetch(
        `${API_BASE_URL}/alumnos`
      );


    if (!respuesta.ok) {

      throw new Error(
        "No se pudieron cargar los alumnos."
      );

    }


    alumnos =
      await respuesta.json();


    renderizarAlumnos(alumnos);


  } catch (error) {

    console.error(error);


    mostrarEstadoTabla(
      "No se pudo conectar con el listado de alumnos.",
      true
    );

  }

}


// =====================================
// GUARDAR ALUMNO
// =====================================

async function guardarAlumno(evento) {

  evento.preventDefault();


  const formData =
    new FormData(
      elementos.alumnoForm
    );


  const alumno = {

    dni:
      formData.get("dni")?.trim() || null,

    nombre:
      formData.get("nombre")?.trim(),

    apellido:
      formData.get("apellido")?.trim(),

    fecha_nacimiento:
      formData.get("fecha_nacimiento")?.trim() || null,

    telefono:
      formData.get("telefono")?.trim() || "",

    telefono_tutor:
      formData.get("telefono_tutor")?.trim() || "",

    filial_id:
      Number(
        formData.get("filial_id")
      )

  };


  try {

    // =====================================
    // CREAR ALUMNO
    // =====================================

    const respuesta =
      await fetch(
        `${API_BASE_URL}/alumnos`,
        {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body:
            JSON.stringify(alumno)

        }
      );


    if (!respuesta.ok) {

      const errorTexto =
        await respuesta.text();

      console.error(errorTexto);

      throw new Error(
        "No se pudo guardar el alumno."
      );

    }


    // IMPORTANTE:
    // obtenemos el ID del alumno recién creado

    const alumnoCreado =
      await respuesta.json();


    const nuevoAlumnoId =
      alumnoCreado.id;


    // =====================================
    // GUARDAR INSTRUMENTO
    // =====================================

    if (
      elementos.instrumentoSelect.value
    ) {

      await guardarInstrumento(
        nuevoAlumnoId
      );

    }


    // =====================================
    // GUARDAR TEORÍA
    // =====================================

    if (
      elementos.nivelTeoriaSelect.value
    ) {

      await guardarTeoria(
        nuevoAlumnoId
      );

    }


    // =====================================
    // GUARDAR INSTRUCCIÓN MINISTERIAL
    // =====================================

    await guardarInstruccionMinisterial(
      nuevoAlumnoId
    );


    alert(
      "Alumno guardado correctamente"
    );


    ocultarFormulario();

    await cargarAlumnos();


  } catch (error) {

    console.error(error);


    alert(
      error.message ||
      "No se pudo guardar el alumno."
    );

  }

}


// =====================================
// GUARDAR INSTRUMENTO
// =====================================

async function guardarInstrumento(
  alumnoId
) {

  const datos = {

    alumno_id:
      Number(alumnoId),

    instrumento_id:
      Number(
        elementos.instrumentoSelect.value
      ),

    nivel_instrumento_id:
      elementos.nivelInstrumentoSelect.value
        ? Number(
            elementos.nivelInstrumentoSelect.value
          )
        : null,

    instructor_id:
      elementos.instructorInstrumentoSelect.value
        ? Number(
            elementos.instructorInstrumentoSelect.value
          )
        : null,

    anio:
      new Date().getFullYear(),

    estado:
      "Activo"

  };


  console.log(
    "Guardando instrumento:",
    datos
  );


  const respuesta =
    await fetch(
      `${API_BASE_URL}/cursada-instrumento`,
      {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body:
          JSON.stringify(datos)

      }
    );


  if (!respuesta.ok) {

    const error =
      await respuesta.text();

    console.error(error);


    throw new Error(
      "El alumno se creó, pero hubo un error guardando el instrumento."
    );

  }

}


// =====================================
// GUARDAR TEORÍA
// =====================================

async function guardarTeoria(
  alumnoId
) {

  const datos = {

    alumno_id:
      Number(alumnoId),

    nivel_id:
      Number(
        elementos.nivelTeoriaSelect.value
      ),

    instructor_id:
      elementos.instructorTeoriaSelect.value
        ? Number(
            elementos.instructorTeoriaSelect.value
          )
        : null,

    anio:
      new Date().getFullYear(),

    estado:
      "Activo"

  };


  console.log(
    "Guardando teoría:",
    datos
  );


  const respuesta =
    await fetch(
      `${API_BASE_URL}/cursadas-teoria`,
      {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body:
          JSON.stringify(datos)

      }
    );


  if (!respuesta.ok) {

    const error =
      await respuesta.text();

    console.error(error);


    throw new Error(
      "El alumno se creó, pero hubo un error guardando teoría."
    );

  }

}

// =====================================
// GUARDAR INSTRUCCIÓN MINISTERIAL
// =====================================

async function guardarInstruccionMinisterial(
  alumnoId
) {

  const datos = {

    alumno_id:
      Number(alumnoId),

    estado:
      elementos.estadoMinisterial.value,

    fecha_inicio:
      elementos.fechaInicioMinisterial.value ||
      null,

    fecha_fin:
      elementos.fechaFinMinisterial.value ||
      null,

  };


  console.log(
    "Guardando instrucción ministerial:",
    datos
  );


  const respuesta =
    await fetch(
      `${API_BASE_URL}/instruccion-ministerial`,
      {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body:
          JSON.stringify(datos)

      }
    );


  if (!respuesta.ok) {

    const error =
      await respuesta.text();

    console.error(error);


    throw new Error(
      "El alumno se creó, pero hubo un error guardando la instrucción ministerial."
    );

  }

}

// =====================================
// BUSCAR ALUMNOS
// =====================================

function buscarAlumnos() {

  const termino =
    elementos.buscadorAlumnos.value
      .trim()
      .toLowerCase();


  if (!termino) {

    renderizarAlumnos(alumnos);

    return;

  }


  const alumnosFiltrados =
    alumnos.filter((alumno) => {

      const dni =
        String(
          alumno.dni || ""
        ).toLowerCase();


      const nombre =
        String(
          alumno.nombre || ""
        ).toLowerCase();


      const apellido =
        String(
          alumno.apellido || ""
        ).toLowerCase();


      return (
        dni.includes(termino) ||
        nombre.includes(termino) ||
        apellido.includes(termino)
      );

    });


  renderizarAlumnos(
    alumnosFiltrados
  );

}


// =====================================
// RENDERIZAR ALUMNOS
// =====================================

function renderizarAlumnos(
  listaAlumnos
) {

  elementos.tablaAlumnos.innerHTML =
    "";


  if (!listaAlumnos.length) {

    mostrarEstadoTabla(
      "Sin alumnos cargados."
    );

    return;

  }


  listaAlumnos.forEach((alumno) => {

    const fila =
      document.createElement("tr");


    const filial =
      alumno.filial?.nombre ||
      alumno.filial_nombre ||
      alumno.filial ||
      "-";


    const instrumento =
      alumno.instrumento ||
      "Sin asignar";


    fila.innerHTML = `

      <td>
        ${escaparHTML(
          alumno.apellido
        )},
        ${escaparHTML(
          alumno.nombre
        )}
      </td>

      <td>
        ${escaparHTML(
          alumno.dni || "Sin DNI"
        )}
      </td>

      <td>
        ${escaparHTML(filial)}
      </td>

      <td>
        ${escaparHTML(instrumento)}
      </td>

      <td>

        <div class="action-group">

          <a
            class="action-link"
            href="alumno.html?id=${alumno.id}"
          >
            Ver/Editar
          </a>

        </div>

      </td>

    `;


    elementos.tablaAlumnos.appendChild(
      fila
    );

  });

}


// =====================================
// ESTADO TABLA
// =====================================

function mostrarEstadoTabla(
  mensaje,
  esError = false
) {

  elementos.tablaAlumnos.innerHTML = `

    <tr>

      <td
        colspan="5"
        class="${
          esError
            ? "error-state"
            : "empty-state"
        }"
      >
        ${mensaje}
      </td>

    </tr>

  `;

}


// =====================================
// ESCAPAR HTML
// =====================================

function escaparHTML(valor) {

  return String(
    valor ?? ""
  )

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}


// =====================================
// CARGAR INSTRUMENTOS
// =====================================

async function cargarInstrumentos() {

  try {

    const respuesta =
      await fetch(
        `${API_BASE_URL}/instrumentos`
      );


    const datos =
      await respuesta.json();


    elementos.instrumentoSelect.innerHTML = `

      <option value="">
        No pertenece
      </option>

    `;


    datos.forEach(item => {

      elementos.instrumentoSelect.innerHTML += `

        <option value="${item.id}">
          ${item.nombre}
        </option>

      `;

    });


  } catch (error) {

    console.error(
      "Error cargando instrumentos:",
      error
    );

  }

}


// =====================================
// CARGAR NIVELES INSTRUMENTO
// =====================================

async function cargarNivelesInstrumento() {

  try {

    const respuesta =
      await fetch(
        `${API_BASE_URL}/niveles-instrumento`
      );


    const datos =
      await respuesta.json();


    elementos.nivelInstrumentoSelect.innerHTML = `

      <option value="">
        No pertenece
      </option>

    `;


    datos.forEach(item => {

      elementos.nivelInstrumentoSelect.innerHTML += `

        <option value="${item.id}">
          ${item.nombre}
        </option>

      `;

    });


  } catch (error) {

    console.error(
      "Error cargando niveles de instrumento:",
      error
    );

  }

}


// =====================================
// CARGAR NIVELES TEORÍA
// =====================================

async function cargarNivelesTeoria() {

  try {

    const respuesta =
      await fetch(
        `${API_BASE_URL}/niveles-teoria`
      );


    const datos =
      await respuesta.json();


    elementos.nivelTeoriaSelect.innerHTML = `

      <option value="">
        No pertenece
      </option>

    `;


    datos.forEach(item => {

      elementos.nivelTeoriaSelect.innerHTML += `

        <option value="${item.id}">
          ${item.nombre}
        </option>

      `;

    });


  } catch (error) {

    console.error(
      "Error cargando niveles de teoría:",
      error
    );

  }

}


// =====================================
// CARGAR INSTRUCTORES DE TEORÍA
// =====================================

async function cargarInstructoresTeoria() {

  try {

    const respuesta =
      await fetch(
        `${API_BASE_URL}/instructores/teoria`
      );


    const datos =
      await respuesta.json();


    elementos.instructorTeoriaSelect.innerHTML = `

      <option value="">
        No pertenece
      </option>

    `;


    datos.forEach(item => {

      elementos.instructorTeoriaSelect.innerHTML += `

        <option value="${item.id}">
          ${item.apellido}, ${item.nombre}
        </option>

      `;

    });


  } catch (error) {

    console.error(
      "Error cargando instructores de teoría:",
      error
    );

  }

}


// =====================================
// CARGAR INSTRUCTORES SEGÚN INSTRUMENTO
// =====================================

async function cargarInstructoresInstrumento(
  instrumentoId
) {

  elementos.instructorInstrumentoSelect.innerHTML = `

    <option value="">
      No pertenece
    </option>

  `;


  if (!instrumentoId) {

    return;

  }


  try {

    console.log(
      "Buscando instructores para instrumento:",
      instrumentoId
    );


    const respuesta =
      await fetch(
        `${API_BASE_URL}/instructores/instrumento/${instrumentoId}`
      );


    if (!respuesta.ok) {

      throw new Error(
        "No se pudieron obtener los instructores"
      );

    }


    const instructores =
      await respuesta.json();


    console.log(
      "Instructores encontrados:",
      instructores
    );


    instructores.forEach(item => {

      elementos.instructorInstrumentoSelect.innerHTML += `

        <option value="${item.id}">
          ${item.apellido}, ${item.nombre}
        </option>

      `;

    });


  } catch (error) {

    console.error(
      "Error cargando instructores del instrumento:",
      error
    );

  }

}


// =====================================
// EDITAR ALUMNO
// =====================================

async function editarAlumno(id) {

  console.log(
    "Editando alumno:",
    id
  );


  alumnoEditando = id;


  try {

    const respuesta =
      await fetch(
        `${API_BASE_URL}/alumnos/${id}`
      );


    if (!respuesta.ok) {

      throw new Error(
        "No se pudo cargar el alumno"
      );

    }


    const alumno =
      await respuesta.json();


    document.getElementById(
      "dni"
    ).value =
      alumno.dni || "";


    document.getElementById(
      "nombre"
    ).value =
      alumno.nombre || "";


    document.getElementById(
      "apellido"
    ).value =
      alumno.apellido || "";

      elementos.fechaNacimiento.value =
      alumno.fecha_nacimiento || "";

      calcularEdad();


    document.getElementById(
      "telefono"
    ).value =
      alumno.telefono || "";


    document.getElementById(
      "telefono_tutor"
    ).value =
      alumno.telefono_tutor || "";


    document.getElementById(
      "correo"
    ).value =
      alumno.correo || "";


    document.getElementById(
      "filial_id"
    ).value =
      alumno.filial_id || "";


    // Instrumento

    elementos.instrumentoSelect.value =
      alumno.instrumento_id || "";


    elementos.nivelInstrumentoSelect.value =
      alumno.nivel_instrumento_id || "";


    await cargarInstructoresInstrumento(
      alumno.instrumento_id
    );


    elementos.instructorInstrumentoSelect.value =
      alumno.instructor_instrumento_id || "";


    // Teoría

    elementos.nivelTeoriaSelect.value =
      alumno.nivel_teoria_id || "";


    elementos.instructorTeoriaSelect.value =
      alumno.instructor_teoria_id || "";
      
// =====================================
// INSTRUCCIÓN MINISTERIAL
// =====================================

const respuestaMinisterial =
  await fetch(
    `${API_BASE_URL}/instruccion-ministerial/${id}`
  );


if (respuestaMinisterial.ok) {

  const instruccionMinisterial =
    await respuestaMinisterial.json();


  if (instruccionMinisterial) {

    elementos.estadoMinisterial.value =
      instruccionMinisterial.estado || "No pertenece";


    elementos.fechaInicioMinisterial.value =
      instruccionMinisterial.fecha_inicio || "";


    elementos.fechaFinMinisterial.value =
      instruccionMinisterial.fecha_finalizacion || "";

  }

}

    elementos.formularioAlumno.classList.remove(
      "hidden"
    );
    elementos.listadoAlumnos.classList.add(
  "hidden"
  );


    const titulo =
      document.getElementById(
        "tituloFormulario"
      );


    if (titulo) {

      titulo.textContent =
        "Editar alumno";

    }


  } catch (error) {

    console.error(error);


    alert(
      "No se pudo cargar el alumno"
    );

  }

}