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

/**
 * Renderiza un bloque de código como panel claro con hairline y, si se
 * indica una etiqueta (p. ej. el lenguaje), una cabecera sin chrome falso.
 */
function renderBloqueCodigo(codigo, etiqueta = "") {
  const contenedor = document.createElement("div");
  contenedor.className = "bloque__codigo";
  if (etiqueta) {
    const cabecera = document.createElement("div");
    cabecera.className = "bloque__codigo-cabecera";
    const texto = document.createElement("span");
    texto.textContent = etiqueta;
    cabecera.append(texto);
    contenedor.append(cabecera);
  }
  const pre = document.createElement("pre");
  pre.className = "bloque__codigo-cuerpo";
  const code = document.createElement("code");
  code.textContent = codigo;
  pre.append(code);
  contenedor.append(pre);
  return contenedor;
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
      return renderBloqueCodigo(bloque.codigo, bloque.lenguaje || "");
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
 */ export function renderTarjeta(item) {
  const articulo = document.createElement("article");
  articulo.className = "ficha";

  const enlace = document.createElement("a");
  enlace.className = "ficha__enlace";
  enlace.href = `#/ficha/${item.coleccion}/${item.numero}`;
  enlace.setAttribute(
    "aria-label",
    `Ver ficha ${String(item.numero).padStart(3, "0")}: ${item.titulo}`
  );

  // Eyebrow: tipo de ficha + número (mono minúscula, acento).
  const eyebrow = document.createElement("p");
  eyebrow.className = "ficha__eyebrow";
  eyebrow.textContent = `${item.coleccion === "ejercicios" ? "ejercicio" : "problema"} ${String(item.numero).padStart(3, "0")}`;
  enlace.append(eyebrow);

  const titulo = document.createElement("h2");
  titulo.className = "ficha__titulo";
  titulo.textContent = item.titulo;
  enlace.append(titulo);

  // Metadatos: badge de nivel (con color por nivel) + dificultad.
  const meta = document.createElement("div");
  meta.className = "ficha__meta";
  const nivel = document.createElement("span");
  nivel.className = `badge badge--nivel-${item.nivel}`;
  nivel.textContent = `Nivel ${item.nivel} · ${item.nombreNivel}`;
  meta.append(nivel, renderEstrellas(item.dificultad));
  enlace.append(meta);

  // Fila de chips: en los ejercicios son los temas; en los problemas de diseño,
  // la categoría. Así ambas fichas comparten exactamente la misma estructura.
  const temas = document.createElement("ul");
  temas.className = "ficha__temas";
  const chips = item.coleccion === "problemas" ? [item.categoria] : item.temas;
  for (const texto of chips) {
    if (!texto) {
      continue;
    }
    const chip = document.createElement("li");
    chip.className = "chip";
    chip.textContent = texto.replaceAll("`", "");
    temas.append(chip);
  }
  enlace.append(temas);

  const pie = document.createElement("p");
  pie.className = "ficha__pie";
  pie.append(document.createTextNode("ver ficha"), crearIcono("arrow_forward"));
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

  // Encabezado de la ficha: eyebrow + titular serif + especificación.
  const encabezado = document.createElement("header");
  encabezado.className = "detalle__encabezado";

  const eyebrow = document.createElement("p");
  eyebrow.className = "ficha__eyebrow";
  eyebrow.textContent = `${item.coleccion === "ejercicios" ? "ejercicio" : "problema"} ${String(item.numero).padStart(3, "0")}`;
  encabezado.append(eyebrow);

  const titulo = document.createElement("h1");
  titulo.className = "detalle__titulo";
  titulo.id = "titulo-ficha";
  titulo.tabIndex = -1;
  titulo.textContent = item.titulo;
  encabezado.append(titulo);

  // Especificación de la ficha: pares clave/valor en mono.
  const spec = document.createElement("dl");
  spec.className = "detalle__spec";

  const parNivel = document.createElement("div");
  parNivel.className = "detalle__spec-par";
  const dtNivel = document.createElement("dt");
  dtNivel.textContent = "Nivel";
  const ddNivel = document.createElement("dd");
  const badgeNivel = document.createElement("span");
  badgeNivel.className = `badge badge--nivel-${item.nivel}`;
  badgeNivel.textContent = `${item.nivel} · ${item.nombreNivel}`;
  ddNivel.append(badgeNivel);
  parNivel.append(dtNivel, ddNivel);
  spec.append(parNivel);

  const parDificultad = document.createElement("div");
  parDificultad.className = "detalle__spec-par";
  const dtDificultad = document.createElement("dt");
  dtDificultad.textContent = "Dificultad";
  const ddDificultad = document.createElement("dd");
  ddDificultad.append(renderEstrellas(item.dificultad));
  parDificultad.append(dtDificultad, ddDificultad);
  spec.append(parDificultad);

  if (item.categoria) {
    const parCategoria = document.createElement("div");
    parCategoria.className = "detalle__spec-par";
    const dtCategoria = document.createElement("dt");
    dtCategoria.textContent = "Categoría";
    const ddCategoria = document.createElement("dd");
    ddCategoria.textContent = item.categoria;
    parCategoria.append(dtCategoria, ddCategoria);
    spec.append(parCategoria);
  }

  if (item.enfoquePoo) {
    const parEnfoque = document.createElement("div");
    parEnfoque.className = "detalle__spec-par";
    const dtEnfoque = document.createElement("dt");
    dtEnfoque.textContent = "Enfoque POO";
    const ddEnfoque = document.createElement("dd");
    ddEnfoque.textContent = item.enfoquePoo;
    parEnfoque.append(dtEnfoque, ddEnfoque);
    spec.append(parEnfoque);
  }

  encabezado.append(spec);

  if (item.temas.length > 0) {
    const temas = document.createElement("ul");
    temas.className = "detalle__temas";
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
