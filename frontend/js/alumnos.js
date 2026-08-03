const API_BASE_URL = "http://localhost:3000";
let alumnoEditando = null;
const elementos = {
  btnAbrirFormulario: document.getElementById("btnAbrirFormulario"),
  btnCancelar: document.getElementById("btnCancelar"),
  btnActualizar: document.getElementById("btnActualizar"),
  formularioAlumno: document.getElementById("formularioAlumno"),
  alumnoForm: document.getElementById("alumnoForm"),
  tablaAlumnos: document.getElementById("tablaAlumnos"),
  buscadorAlumnos: document.getElementById("buscadorAlumnos"),

  // Formulario
  filialSelect: document.getElementById("filial_id"),

  // Filtro tabla
filtroFilial: document.getElementById("filtroFilial"),

  instrumentoSelect: document.getElementById("instrumento_id"),
  nivelInstrumentoSelect: document.getElementById("nivel_instrumento_id"),
  instructorInstrumentoSelect: document.getElementById("instructor_instrumento_id"),
  nivelTeoriaSelect: document.getElementById("nivel_teoria_id"),
  instructorTeoriaSelect: document.getElementById("instructor_teoria_id"),
};

let alumnos = [];

document.addEventListener("DOMContentLoaded", () => {
  cargarFiliales();
  cargarFilialesFiltro();
  cargarAlumnos();
  cargarInstrumentos();
cargarNivelesInstrumento();
cargarNivelesTeoria();
cargarInstructores();

  elementos.btnAbrirFormulario.addEventListener("click", mostrarFormulario);
  elementos.btnCancelar.addEventListener("click", ocultarFormulario);
  elementos.btnActualizar.addEventListener("click", cargarAlumnos);
  elementos.alumnoForm.addEventListener("submit", guardarAlumno);
  elementos.buscadorAlumnos.addEventListener("input", buscarAlumnos);
});

function mostrarFormulario() {
  elementos.formularioAlumno.classList.remove("hidden");
  document.getElementById("dni").focus();
}

function ocultarFormulario() {
  elementos.alumnoForm.reset();
  elementos.formularioAlumno.classList.add("hidden");
}

async function cargarFiliales() {
  try {

    const respuesta = await fetch(`${API_BASE_URL}/filiales`);

    if (!respuesta.ok) {
      throw new Error("No se pudieron cargar iglesias");
    }

    const iglesias = await respuesta.json();

    elementos.filialSelect.innerHTML =
      '<option value="">Seleccione una iglesia</option>';

    iglesias.forEach((iglesia) => {

      const opcion = document.createElement("option");

      opcion.value = iglesia.id;
      opcion.textContent = iglesia.nombre;

      elementos.filialSelect.appendChild(opcion);

    });

  } catch (error) {

    console.error(error);

    elementos.filialSelect.innerHTML =
      '<option value="">No hay iglesias disponibles</option>';

  }
}

async function cargarFilialesFiltro(){

    const respuesta = await fetch(
        `${API_BASE_URL}/filiales`
    );

    const iglesias = await respuesta.json();


    elementos.filtroFilial.innerHTML = `
        <option value="">
            Todas las iglesias
        </option>
    `;


    iglesias.forEach(i => {

        elementos.filtroFilial.innerHTML += `
            <option value="${i.id}">
                ${i.nombre}
            </option>
        `;

    });

}

async function cargarAlumnos() {
  mostrarEstadoTabla("Cargando alumnos...");

  try {
    // Endpoint preparado: GET http://localhost:3000/alumnos
    const respuesta = await fetch(`${API_BASE_URL}/alumnos`);

    if (!respuesta.ok) {
      throw new Error("No se pudieron cargar los alumnos.");
    }

    alumnos = await respuesta.json();
    renderizarAlumnos(alumnos);
  } catch (error) {
    console.error(error);
    mostrarEstadoTabla("No se pudo conectar con el listado de alumnos.", true);
  }
}

async function guardarAlumno(evento) {
  evento.preventDefault();

  const formData = new FormData(elementos.alumnoForm);
  const alumno = {
    dni: formData.get("dni")?.trim() || null,
    nombre: formData.get("nombre")?.trim(),
    apellido: formData.get("apellido")?.trim(),
    telefono: formData.get("telefono")?.trim() || "",
    telefono_tutor: formData.get("telefono_tutor")?.trim() || "",
    filial_id: Number(formData.get("filial_id"))
};

  try {
    // Endpoint preparado: POST http://localhost:3000/alumnos
    const respuesta = await fetch(`${API_BASE_URL}/alumnos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(alumno)
    });

    if (!respuesta.ok) {
      throw new Error("No se pudo guardar el alumno.");
    }

    ocultarFormulario();
    await cargarAlumnos();
  } catch (error) {
    console.error(error);
    alert("No se pudo guardar el alumno. Revise la conexion con la API.");
  }
}

function buscarAlumnos() {
  const termino = elementos.buscadorAlumnos.value.trim().toLowerCase();

  if (!termino) {
    renderizarAlumnos(alumnos);
    return;
  }

  const alumnosFiltrados = alumnos.filter((alumno) => {
    const dni = String(alumno.dni || "").toLowerCase();
    const nombre = String(alumno.nombre || "").toLowerCase();
    const apellido = String(alumno.apellido || "").toLowerCase();

    return dni.includes(termino) || nombre.includes(termino) || apellido.includes(termino);
  });

  renderizarAlumnos(alumnosFiltrados);
}

function renderizarFiliales(filiales) {
  elementos.filialSelect.innerHTML = '<option value="">Seleccione una Iglesia</option>';

  filiales.forEach((filial) => {
    const opcion = document.createElement("option");
    opcion.value = filial.id;
    opcion.textContent = filial.nombre || filial.descripcion || `Filial ${filial.id}`;
    elementos.filialSelect.appendChild(opcion);
  });
}
function renderizarAlumnos(listaAlumnos) {
  elementos.tablaAlumnos.innerHTML = "";

  if (!listaAlumnos.length) {
    mostrarEstadoTabla("Sin alumnos cargados.");
    return;
  }

  listaAlumnos.forEach((alumno) => {

    const fila = document.createElement("tr");

    const filial = alumno.filial?.nombre || alumno.filial_nombre || alumno.filial || "-";

    const instrumento = alumno.instrumento || "Sin asignar";


    fila.innerHTML = `
      <td>
        ${escaparHTML(alumno.apellido)}, ${escaparHTML(alumno.nombre)}
      </td>

      <td>
        ${escaparHTML(alumno.dni || "Sin DNI")}
      </td>

      <td>
        ${escaparHTML(filial)}
      </td>

      <td>
        ${escaparHTML(instrumento)}
      </td>

      <td>
        <div class="action-group">
          <a class="action-link" href="alumno.html?id=${alumno.id}">
            Editar
          </a>
        </div>
      </td>
    `;


    elementos.tablaAlumnos.appendChild(fila);

  });
}

function mostrarEstadoTabla(mensaje, esError = false) {
  elementos.tablaAlumnos.innerHTML = `
    <tr>
      <td colspan="5" class="${esError ? "error-state" : "empty-state"}">${mensaje}</td>
    </tr>
  `;
}

function escaparHTML(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
async function cargarInstrumentos(){

  const respuesta = await fetch(`${API_BASE_URL}/instrumentos`);
  const datos = await respuesta.json();

  elementos.instrumentoSelect.innerHTML =
  `<option value="">Seleccione instrumento</option>`;

  datos.forEach(item=>{

    elementos.instrumentoSelect.innerHTML +=
    `
    <option value="${item.id}">
      ${item.nombre}
    </option>
    `;

  });

}



async function cargarNivelesInstrumento(){

  const respuesta = await fetch(`${API_BASE_URL}/niveles-instrumento`);
  const datos = await respuesta.json();

  elementos.nivelInstrumentoSelect.innerHTML =
  `<option value="">Seleccione nivel</option>`;

  datos.forEach(item=>{

    elementos.nivelInstrumentoSelect.innerHTML +=
    `
    <option value="${item.id}">
      ${item.nombre}
    </option>
    `;

  });

}



async function cargarNivelesTeoria(){

  const respuesta = await fetch(`${API_BASE_URL}/niveles-teoria`);
  const datos = await respuesta.json();

  elementos.nivelTeoriaSelect.innerHTML =
  `<option value="">Seleccione nivel</option>`;

  datos.forEach(item=>{

    elementos.nivelTeoriaSelect.innerHTML +=
    `
    <option value="${item.id}">
      ${item.nombre}
    </option>
    `;

  });

}



async function cargarInstructores(){

  const respuesta = await fetch(`${API_BASE_URL}/instructores`);
  const datos = await respuesta.json();


  const opciones =
  `<option value="">Seleccione instructor</option>`;


  elementos.instructorInstrumentoSelect.innerHTML = opciones;
  elementos.instructorTeoriaSelect.innerHTML = opciones;


  datos.forEach(item=>{


    const opcion =
    `
    <option value="${item.id}">
      ${item.nombre}
    </option>
    `;


    elementos.instructorInstrumentoSelect.innerHTML += opcion;
    elementos.instructorTeoriaSelect.innerHTML += opcion;


  });

}

async function editarAlumno(id){

  console.log("Editando alumno:", id);

  alumnoEditando = id;


  const respuesta = await fetch(
    `${API_BASE_URL}/alumnos/${id}`
  );


  if(!respuesta.ok){
    alert("No se pudo cargar el alumno");
    return;
  }


  const alumno = await respuesta.json();



  document.getElementById("dni").value =
    alumno.dni || "";


  document.getElementById("nombre").value =
    alumno.nombre || "";


  document.getElementById("apellido").value =
    alumno.apellido || "";


  document.getElementById("telefono").value =
    alumno.telefono || "";


  document.getElementById("telefono_tutor").value =
    alumno.telefono_tutor || "";


  document.getElementById("correo").value =
    alumno.correo || "";


  document.getElementById("filial_id").value =
    alumno.filial_id || "";



  elementos.formularioAlumno.classList.remove("hidden");


  document.getElementById("tituloFormulario")
    .textContent = "Editar alumno";


}