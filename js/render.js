// Renderizado seguro de los datos estructurados a DOM.
// Regla del proyecto: nunca se inyecta HTML (innerHTML/insertAdjacentHTML);
// todo se construye con createElement/textContent, por lo que el contenido
// de los ejercicios (markdown ya parseado) no puede inyectar marcado.

import { numerosDePagina } from "./paginacion.js";

/**
 * Crea un icono de Material Symbols (decorativo: aria-hidden).
 * @param {string} nombre Nombre del glifo (p. ej. "star", "arrow_forward").
 * @returns {HTMLSpanElement}
 */
export function crearIcono(nombre) {
  const icono = document.createElement("span");
  icono.className = "material-symbols-outlined icono";
  icono.setAttribute("aria-hidden", "true");
  icono.textContent = nombre;
  return icono;
}

/**
 * Convierte texto con marcas inline (`**negrita**` y `` `código` ``) en un
 * fragmento de nodos de texto/strong/code. La negrita se usa como énfasis
 * de lectura; el código se renderiza con la fuente monoespaciada.
 * @param {string} texto
 * @returns {DocumentFragment}
 */
export function renderTextoEnriquecido(texto) {
  const fragmento = document.createDocumentFragment();
  // Divide el texto en tokens: negrita, itálica, código o texto plano.
  const tokens = texto.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  for (const token of tokens) {
    if (token === "") {
      continue;
    }
    if (token.startsWith("**") && token.endsWith("**") && token.length > 4) {
      const fuerte = document.createElement("strong");
      fuerte.textContent = token.slice(2, -2);
      fragmento.append(fuerte);
    } else if (token.startsWith("`") && token.endsWith("`") && token.length > 2) {
      const codigo = document.createElement("code");
      codigo.textContent = token.slice(1, -1);
      fragmento.append(codigo);
    } else if (token.startsWith("*") && token.endsWith("*") && token.length > 2) {
      const enfasis = document.createElement("em");
      enfasis.textContent = token.slice(1, -1);
      fragmento.append(enfasis);
    } else {
      fragmento.append(document.createTextNode(token));
    }
  }
  return fragmento;
}

/** Renderiza la dificultad (1–5) como cinco iconos de estrella. */
export function renderEstrellas(dificultad) {
  const contenedor = document.createElement("span");
  contenedor.className = "dificultad";
  contenedor.setAttribute("role", "img");
  contenedor.setAttribute("aria-label", `Dificultad: ${dificultad} de 5`);
  for (let i = 1; i <= 5; i += 1) {
    const icono = crearIcono("star");
    icono.classList.add("dificultad__estrella");
    if (i > dificultad) {
      icono.classList.add("dificultad__estrella--vacia");
    }
    contenedor.append(icono);
  }
  return contenedor;
}

/** Renderiza un bloque de código como panel oscuro sin chrome falso. */
function renderBloqueCodigo(codigo) {
  const pre = document.createElement("pre");
  pre.className = "bloque__codigo";
  const code = document.createElement("code");
  code.textContent = codigo;
  pre.append(code);
  return pre;
}

/** Renderiza un bloque tipado (parrafo | lista | codigo | ejemplo | pista). */
export function renderBloque(bloque) {
  switch (bloque.tipo) {
    case "parrafo": {
      const parrafo = document.createElement("p");
      parrafo.className = "bloque__parrafo";
      parrafo.append(renderTextoEnriquecido(bloque.texto));
      return parrafo;
    }
    case "lista": {
      const lista = document.createElement(bloque.ordenada ? "ol" : "ul");
      lista.className = bloque.ordenada ? "bloque__lista bloque__lista--numerada" : "bloque__lista";
      for (const item of bloque.items) {
        const elemento = document.createElement("li");
        elemento.append(renderTextoEnriquecido(item));
        lista.append(elemento);
      }
      return lista;
    }
    case "codigo":
      return renderBloqueCodigo(bloque.codigo);
    case "ejemplo": {
      const figura = document.createElement("figure");
      figura.className = "ejemplo";
      const leyenda = document.createElement("figcaption");
      leyenda.className = "ejemplo__titulo";
      leyenda.textContent = bloque.titulo;
      figura.append(leyenda, renderBloqueCodigo(bloque.codigo));
      return figura;
    }
    case "pista": {
      const detalles = document.createElement("details");
      detalles.className = "pista";
      const resumen = document.createElement("summary");
      resumen.className = "pista__resumen";
      resumen.append(crearIcono("lightbulb"), renderTextoEnriquecido(bloque.resumen));
      detalles.append(resumen);
      const contenido = document.createElement("div");
      contenido.className = "pista__contenido";
      contenido.append(renderBloques(bloque.contenido));
      detalles.append(contenido);
      return detalles;
    }
    default:
      // Bloque desconocido: no debería ocurrir con los datos generados.
      return document.createElement("p");
  }
}

/** Renderiza una lista de bloques en orden. */
export function renderBloques(bloques) {
  const fragmento = document.createDocumentFragment();
  for (const bloque of bloques) {
    fragmento.append(renderBloque(bloque));
  }
  return fragmento;
}

/**
 * Renderiza la ficha (tarjeta) de un ejercicio. Toda la tarjeta es un único
 * enlace para que el teclado tenga un solo punto de tabulación.
 * @param {object} item Ítem estructurado (ver scripts/extraer-datos.js).
 * @returns {HTMLElement}
 */
export function renderTarjeta(item) {
  const articulo = document.createElement("article");
  articulo.className = "ficha";

  const enlace = document.createElement("a");
  enlace.className = "ficha__enlace";
  enlace.href = `#/ficha/${item.coleccion}/${item.numero}`;
  enlace.setAttribute(
    "aria-label",
    `Ver ficha ${String(item.numero).padStart(3, "0")}: ${item.titulo}`
  );

  // Fila de metadatos: número, nivel y dificultad.
  const meta = document.createElement("div");
  meta.className = "ficha__meta";
  const numero = document.createElement("span");
  numero.className = "ficha__numero";
  numero.textContent = String(item.numero).padStart(3, "0");
  const nivel = document.createElement("span");
  nivel.className = "badge";
  nivel.textContent = `Nivel ${item.nivel} · ${item.nombreNivel}`;
  meta.append(numero, nivel, renderEstrellas(item.dificultad));
  enlace.append(meta);

  const titulo = document.createElement("h2");
  titulo.className = "ficha__titulo";
  titulo.textContent = item.titulo;
  enlace.append(titulo);

  // Categoría solo en los problemas de diseño.
  if (item.categoria) {
    const categoria = document.createElement("p");
    categoria.className = "ficha__categoria";
    categoria.textContent = item.categoria;
    enlace.append(categoria);
  }

  // Temas como chips (se quitan los backticks de marcado de código del markdown).
  if (item.temas.length > 0) {
    const temas = document.createElement("ul");
    temas.className = "ficha__temas";
    for (const tema of item.temas) {
      const chip = document.createElement("li");
      chip.className = "chip";
      chip.textContent = tema.replaceAll("`", "");
      temas.append(chip);
    }
    enlace.append(temas);
  }

  const pie = document.createElement("p");
  pie.className = "ficha__pie";
  pie.append(document.createTextNode("Ver ficha"), crearIcono("arrow_forward"));
  enlace.append(pie);

  articulo.append(enlace);
  return articulo;
}

/**
 * Renderiza el paginador: anterior, páginas (con elipsis) y siguiente.
 * @param {{pagina: number, totalPaginas: number, alIrAPagina: Function}} opciones
 * @returns {HTMLElement}
 */
export function renderPaginador({ pagina, totalPaginas, alIrAPagina }) {
  const nav = document.createElement("nav");
  nav.className = "paginacion";
  nav.setAttribute("aria-label", "Paginación de fichas");

  nav.append(
    crearBotonPaginacion("Anterior", "chevron_left", pagina <= 1, () => alIrAPagina(pagina - 1))
  );

  for (const entrada of numerosDePagina(pagina, totalPaginas)) {
    if (entrada.tipo === "elipsis") {
      const elipsis = document.createElement("span");
      elipsis.className = "paginacion__elipsis";
      elipsis.textContent = "…";
      elipsis.setAttribute("aria-hidden", "true");
      nav.append(elipsis);
      continue;
    }
    const boton = crearBotonPaginacion(String(entrada.numero), null, false, () =>
      alIrAPagina(entrada.numero)
    );
    if (entrada.numero === pagina) {
      boton.classList.add("paginacion__boton--activo");
      boton.setAttribute("aria-current", "page");
    }
    nav.append(boton);
  }

  nav.append(
    crearBotonPaginacion("Siguiente", "chevron_right", pagina >= totalPaginas, () =>
      alIrAPagina(pagina + 1)
    )
  );
  return nav;
}

/** Botón del paginador: nativo, con icono opcional. */
function crearBotonPaginacion(etiqueta, icono, deshabilitado, alClic) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "paginacion__boton";
  if (icono) {
    boton.append(crearIcono(icono));
  }
  boton.append(document.createTextNode(etiqueta));
  boton.disabled = deshabilitado;
  boton.addEventListener("click", alClic);
  return boton;
}

/**
 * Renderiza la vista de detalle de un ejercicio con todas sus secciones.
 * @param {object} item Ítem actual.
 * @param {object} coleccion Colección a la que pertenece (para navegar).
 * @param {object|null} anterior Ítem previo de la colección.
 * @param {object|null} siguiente Ítem siguiente de la colección.
 * @returns {HTMLElement}
 */
export function renderDetalle(item, coleccion, anterior, siguiente) {
  const articulo = document.createElement("article");
  articulo.className = "detalle";

  // Cabecera de navegación: volver + miga de pan.
  const cabecera = document.createElement("nav");
  cabecera.className = "detalle__navegacion-superior";
  cabecera.setAttribute("aria-label", "Navegación superior");
  const volver = document.createElement("a");
  volver.className = "detalle__volver";
  volver.href = "#/";
  volver.append(crearIcono("arrow_back"), document.createTextNode("Volver al listado"));
  const miga = document.createElement("span");
  miga.className = "detalle__miga";
  miga.textContent = `${coleccion.nombre} / ${String(item.numero).padStart(3, "0")}`;
  cabecera.append(volver, miga);
  articulo.append(cabecera);

  // Encabezado de la ficha.
  const encabezado = document.createElement("header");
  encabezado.className = "detalle__encabezado";
  const meta = document.createElement("div");
  meta.className = "ficha__meta";
  const numero = document.createElement("span");
  numero.className = "ficha__numero";
  numero.textContent = String(item.numero).padStart(3, "0");
  const nivel = document.createElement("span");
  nivel.className = "badge";
  nivel.textContent = `Nivel ${item.nivel} · ${item.nombreNivel}`;
  meta.append(numero, nivel, renderEstrellas(item.dificultad));
  encabezado.append(meta);

  const titulo = document.createElement("h1");
  titulo.className = "detalle__titulo";
  titulo.id = "titulo-ficha";
  titulo.tabIndex = -1;
  titulo.textContent = item.titulo;
  encabezado.append(titulo);

  // Datos extra de los problemas de diseño.
  const datos = [];
  if (item.categoria) {
    datos.push(`Categoría: ${item.categoria}`);
  }
  if (item.enfoquePoo) {
    datos.push(`Enfoque POO: ${item.enfoquePoo}`);
  }
  if (datos.length > 0) {
    const detalleDatos = document.createElement("dl");
    detalleDatos.className = "detalle__datos";
    for (const dato of datos) {
      const [clave, ...resto] = dato.split(": ");
      const termino = document.createElement("dt");
      termino.textContent = clave;
      const valor = document.createElement("dd");
      valor.textContent = resto.join(": ");
      detalleDatos.append(termino, valor);
    }
    encabezado.append(detalleDatos);
  }

  if (item.temas.length > 0) {
    const temas = document.createElement("ul");
    temas.className = "ficha__temas detalle__temas";
    for (const tema of item.temas) {
      const chip = document.createElement("li");
      chip.className = "chip";
      chip.textContent = tema.replaceAll("`", "");
      temas.append(chip);
    }
    encabezado.append(temas);
  }
  articulo.append(encabezado);

  // Cuerpo: secciones.
  const cuerpo = document.createElement("div");
  cuerpo.className = "detalle__cuerpo";
  for (const seccion of item.secciones) {
    const section = document.createElement("section");
    section.className = "detalle__seccion";
    const tituloSeccion = document.createElement("h2");
    tituloSeccion.className = "detalle__seccion-titulo";
    // Se descartan los paréntesis de metadato del markdown (p. ej. "(opcional, ocultables)").
    tituloSeccion.textContent = seccion.titulo.replace(/\s*\([^)]*\)\s*$/, "");
    const contenido = document.createElement("div");
    contenido.className = "detalle__seccion-contenido";
    contenido.append(renderBloques(seccion.bloques));
    section.append(tituloSeccion, contenido);
    cuerpo.append(section);
  }
  articulo.append(cuerpo);

  // Navegación entre fichas (anterior/siguiente).
  const navegacion = document.createElement("nav");
  navegacion.className = "detalle__navegacion-fichas";
  navegacion.setAttribute("aria-label", "Fichas anterior y siguiente");
  navegacion.append(
    crearEnlaceFicha(anterior, "Anterior", "chevron_left", true),
    crearEnlaceFicha(siguiente, "Siguiente", "chevron_right", false)
  );
  articulo.append(navegacion);

  return articulo;
}

/** Enlace "Anterior/Siguiente" de una ficha (o placeholder si no existe). */
function crearEnlaceFicha(item, etiqueta, icono, esAnterior) {
  const contenedor = document.createElement("div");
  contenedor.className = "detalle__navegacion-ficha";
  if (!item) {
    const vacio = document.createElement("span");
    vacio.className = "detalle__navegacion-ficha--vacio";
    vacio.append(crearIcono(icono), document.createTextNode(etiqueta));
    contenedor.append(vacio);
    return contenedor;
  }
  const enlace = document.createElement("a");
  enlace.className = "detalle__navegacion-ficha--enlace";
  enlace.href = `#/ficha/${item.coleccion}/${item.numero}`;
  const fila = document.createElement("span");
  fila.className = "detalle__navegacion-ficha--fila";
  if (esAnterior) {
    fila.append(crearIcono(icono), document.createTextNode(etiqueta));
  } else {
    fila.append(document.createTextNode(etiqueta), crearIcono(icono));
  }
  const titulo = document.createElement("span");
  titulo.className = "detalle__navegacion-ficha--titulo";
  titulo.textContent = `${String(item.numero).padStart(3, "0")} · ${item.titulo}`;
  enlace.append(fila, titulo);
  contenedor.append(enlace);
  return contenedor;
}

/**
 * Estado vacío: sin resultados para los filtros actuales.
 * @param {string} mensaje Texto orientativo.
 * @param {Function|null} alLimpiar Acción del botón "Limpiar filtros".
 * @returns {HTMLElement}
 */
export function renderVacio(mensaje, alLimpiar) {
  const contenedor = document.createElement("div");
  contenedor.className = "vacio";
  const icono = crearIcono("search_off");
  icono.classList.add("vacio__icono");
  contenedor.append(icono);
  const titulo = document.createElement("h2");
  titulo.className = "vacio__titulo";
  titulo.textContent = "Sin resultados";
  contenedor.append(titulo);
  const texto = document.createElement("p");
  texto.className = "vacio__texto";
  texto.textContent = mensaje;
  contenedor.append(texto);
  if (alLimpiar) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "boton boton--secundario";
    boton.textContent = "Limpiar filtros";
    boton.addEventListener("click", alLimpiar);
    contenedor.append(boton);
  }
  return contenedor;
}
