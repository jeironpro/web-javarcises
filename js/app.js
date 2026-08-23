// Punto de entrada de la aplicación: estado, filtros, paginación y routing.
// La vista de listado se compone de una barra de filtros (estable) y un
// contenedor de resultados que se redibuja al cambiar filtros o página.

import { JAVARCISES } from "../data/ejercicios.js";
import { paginar } from "./paginacion.js";
import {
  crearIcono,
  renderTarjeta,
  renderPaginador,
  renderDetalle,
  renderVacio,
} from "./render.js";

const elementoApp = document.querySelector("#app");
const elementoEstadisticas = document.querySelector("#estadisticas");
const elementoResultados = document.createElement("div");
elementoResultados.id = "resultados";

// Estado de la aplicación (se conserva entre renders).
const estado = {
  coleccion: "ejercicios", // clave de la colección activa
  pagina: 1,
  nivel: "todos", // número de nivel o "todos"
  busqueda: "",
};

// --- Utilidades sobre los datos ----------------------------------------------

function obtenerColecciones() {
  return JAVARCISES.colecciones;
}

function obtenerColeccion(clave) {
  return (
    JAVARCISES.colecciones.find((coleccion) => coleccion.clave === clave) ??
    JAVARCISES.colecciones[0]
  );
}

/** Niveles presentes en una colección, ordenados y con su nombre. */
function nivelesDeColeccion(coleccion) {
  const niveles = [];
  for (const item of coleccion.items) {
    if (!niveles.some((nivel) => nivel.numero === item.nivel)) {
      niveles.push({ numero: item.nivel, nombre: item.nombreNivel });
    }
  }
  return niveles.sort((a, b) => a.numero - b.numero);
}

/** Aplica el filtro por nivel y la búsqueda por texto a una colección. */
function filtrarItems(coleccion) {
  const busqueda = estado.busqueda.trim().toLowerCase();
  return coleccion.items.filter((item) => {
    if (estado.nivel !== "todos" && item.nivel !== Number(estado.nivel)) {
      return false;
    }
    if (busqueda === "") {
      return true;
    }
    const campos = [item.titulo, item.nombreNivel, item.categoria ?? "", ...item.temas];
    return campos.some((campo) => campo.toLowerCase().includes(busqueda));
  });
}

// --- Barra de filtros (pestañas, nivel y búsqueda) -----------------------------

function renderBarra() {
  const coleccion = obtenerColeccion(estado.coleccion);

  const barra = document.createElement("div");
  barra.className = "barra";

  // Pestañas de colección.
  const pestanas = document.createElement("div");
  pestanas.className = "pestanas";
  pestanas.setAttribute("role", "group");
  pestanas.setAttribute("aria-label", "Elegir colección de ejercicios");
  for (const candidata of obtenerColecciones()) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "pestana";
    const activa = candidata.clave === estado.coleccion;
    boton.append(
      crearIcono(candidata.clave === "ejercicios" ? "code" : "design_services"),
      document.createTextNode(candidata.nombre)
    );
    boton.setAttribute("aria-pressed", String(activa));
    if (activa) {
      boton.classList.add("pestana--activa");
    }
    boton.addEventListener("click", () => {
      if (estado.coleccion === candidata.clave) {
        return;
      }
      estado.coleccion = candidata.clave;
      estado.pagina = 1;
      estado.nivel = "todos";
      renderVistaLista();
    });
    pestanas.append(boton);
  }
  barra.append(pestanas);

  // Selector de nivel (las opciones dependen de la colección activa).
  const campoNivel = document.createElement("div");
  campoNivel.className = "campo";
  const etiquetaNivel = document.createElement("label");
  etiquetaNivel.htmlFor = "filtro-nivel";
  etiquetaNivel.textContent = "Nivel";
  const select = document.createElement("select");
  select.id = "filtro-nivel";
  const opcionTodos = document.createElement("option");
  opcionTodos.value = "todos";
  opcionTodos.textContent = "Todos los niveles";
  select.append(opcionTodos);
  for (const nivel of nivelesDeColeccion(coleccion)) {
    const opcion = document.createElement("option");
    opcion.value = String(nivel.numero);
    opcion.textContent = `${nivel.numero} — ${nivel.nombre}`;
    select.append(opcion);
  }
  select.value = estado.nivel === "todos" ? "todos" : String(estado.nivel);
  select.addEventListener("change", () => {
    estado.nivel = select.value === "todos" ? "todos" : Number(select.value);
    estado.pagina = 1;
    renderResultados();
  });
  campoNivel.append(etiquetaNivel, select);
  barra.append(campoNivel);

  // Búsqueda por texto.
  const campoBusqueda = document.createElement("div");
  campoBusqueda.className = "campo campo--busqueda";
  const etiquetaBusqueda = document.createElement("label");
  etiquetaBusqueda.htmlFor = "busqueda";
  etiquetaBusqueda.textContent = "Buscar";
  const entrada = document.createElement("div");
  entrada.className = "campo__entrada";
  entrada.append(crearIcono("search"));
  const input = document.createElement("input");
  input.type = "search";
  input.id = "busqueda";
  input.placeholder = "Título, tema, nivel…";
  input.value = estado.busqueda;
  input.addEventListener("input", () => {
    estado.busqueda = input.value;
    estado.pagina = 1;
    renderResultados();
  });
  entrada.append(input);
  campoBusqueda.append(etiquetaBusqueda, entrada);
  barra.append(campoBusqueda);

  return barra;
}

// --- Vista de listado ----------------------------------------------------------

function renderResultados() {
  const coleccion = obtenerColeccion(estado.coleccion);
  const filtrados = filtrarItems(coleccion);
  const resultado = paginar(filtrados, estado.pagina);

  const contenedor = document.createElement("div");

  // Contador de resultados (anunciado por lectores de pantalla).
  const contador = document.createElement("p");
  contador.className = "contador";
  contador.setAttribute("aria-live", "polite");
  contador.textContent =
    filtrados.length === 0
      ? "0 fichas"
      : `Mostrando ${resultado.desde}–${resultado.hasta} de ${resultado.total} fichas`;
  contenedor.append(contador);

  if (filtrados.length === 0) {
    contenedor.append(
      renderVacio(
        "Ninguna ficha coincide con los filtros actuales. Prueba con otro término o borra los filtros.",
        limpiarFiltros
      )
    );
  } else {
    const grilla = document.createElement("div");
    grilla.className = "grilla";
    for (const item of resultado.items) {
      grilla.append(renderTarjeta(item));
    }
    contenedor.append(grilla);

    if (resultado.totalPaginas > 1) {
      contenedor.append(
        renderPaginador({
          pagina: resultado.pagina,
          totalPaginas: resultado.totalPaginas,
          alIrAPagina: (pagina) => {
            estado.pagina = pagina;
            renderResultados();
            window.scrollTo(0, 0);
          },
        })
      );
    }
  }

  elementoResultados.replaceChildren(contenedor);
}

function limpiarFiltros() {
  estado.nivel = "todos";
  estado.busqueda = "";
  renderVistaLista();
}

function renderVistaLista() {
  const coleccion = obtenerColeccion(estado.coleccion);

  const encabezado = document.createElement("div");
  encabezado.className = "lista-encabezado";
  const titulo = document.createElement("h2");
  titulo.className = "lista-encabezado__titulo";
  titulo.textContent = coleccion.nombre;
  const descripcion = document.createElement("p");
  descripcion.className = "lista-encabezado__descripcion";
  descripcion.textContent = coleccion.descripcion;
  encabezado.append(titulo, descripcion);

  elementoApp.replaceChildren(encabezado, renderBarra(), elementoResultados);
  renderResultados();
  document.title = "Javarcises — Ejercicios de programación en Java";
}

// --- Vista de detalle -----------------------------------------------------------

function renderVistaDetalle(ruta) {
  const coleccion = obtenerColeccion(ruta.coleccion);
  const indice = coleccion.items.findIndex((item) => item.numero === ruta.numero);

  if (indice === -1) {
    const contenedor = document.createElement("div");
    contenedor.className = "vacio";
    contenedor.append(crearIcono("error"));
    const titulo = document.createElement("h2");
    titulo.className = "vacio__titulo";
    titulo.textContent = "Ficha no encontrada";
    contenedor.append(titulo);
    const texto = document.createElement("p");
    texto.className = "vacio__texto";
    texto.textContent = "El número de ficha no existe en esta colección.";
    contenedor.append(texto);
    const volver = document.createElement("a");
    volver.className = "boton boton--secundario detalle__volver";
    volver.href = "#/";
    volver.textContent = "Volver al listado";
    contenedor.append(volver);
    elementoApp.replaceChildren(contenedor);
    return;
  }

  const item = coleccion.items[indice];
  const anterior = coleccion.items[indice - 1] ?? null;
  const siguiente = coleccion.items[indice + 1] ?? null;
  elementoApp.replaceChildren(renderDetalle(item, coleccion, anterior, siguiente));
  document.title = `${item.titulo} — Javarcises`;

  // Mueve el foco al título para lectores de pantalla (sin desplazar la página).
  const tituloFicha = document.querySelector("#titulo-ficha");
  if (tituloFicha && document.activeElement !== tituloFicha) {
    tituloFicha.focus({ preventScroll: true });
  }
}

// --- Routing y arranque ----------------------------------------------------------

/** Interpreta el hash: #/ficha/<coleccion>/<numero> → detalle; lo demás → listado. */
function leerRuta() {
  const coincidencia = location.hash.match(/^#\/ficha\/(ejercicios|problemas)\/(\d+)$/);
  if (coincidencia) {
    return { vista: "detalle", coleccion: coincidencia[1], numero: Number(coincidencia[2]) };
  }
  return { vista: "lista" };
}

function renderizar() {
  const ruta = leerRuta();
  if (ruta.vista === "detalle") {
    renderVistaDetalle(ruta);
  } else {
    renderVistaLista();
  }
}

/** Resumen del catálogo en el masthead: cantidades reales de cada colección. */
function renderEstadisticas() {
  const lista = document.createElement("ul");
  lista.className = "estadisticas__lista";

  for (const coleccion of obtenerColecciones()) {
    const elemento = document.createElement("li");
    elemento.className = "estadistica";
    const numero = document.createElement("span");
    numero.className = "estadistica__numero";
    numero.textContent = String(coleccion.items.length);
    const etiqueta = document.createElement("span");
    etiqueta.className = "estadistica__etiqueta";
    etiqueta.textContent = coleccion.nombre;
    elemento.append(numero, etiqueta);
    lista.append(elemento);
  }

  const niveles = new Set();
  for (const coleccion of obtenerColecciones()) {
    for (const item of coleccion.items) {
      niveles.add(`${coleccion.clave}-${item.nivel}`);
    }
  }
  const elementoNiveles = document.createElement("li");
  elementoNiveles.className = "estadistica";
  const numeroNiveles = document.createElement("span");
  numeroNiveles.className = "estadistica__numero";
  numeroNiveles.textContent = String(niveles.size);
  const etiquetaNiveles = document.createElement("span");
  etiquetaNiveles.className = "estadistica__etiqueta";
  etiquetaNiveles.textContent = "Niveles de dificultad";
  elementoNiveles.append(numeroNiveles, etiquetaNiveles);
  lista.append(elementoNiveles);

  elementoEstadisticas.replaceChildren(lista);
}

function inicializar() {
  renderEstadisticas();
  window.addEventListener("hashchange", renderizar);
  renderizar();
}

inicializar();
