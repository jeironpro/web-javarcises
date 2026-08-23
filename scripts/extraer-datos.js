// Extrae los ejercicios markdown (triviales/ y problemas-diseno/) a un módulo ES
// con datos estructurados (data/ejercicios.js). El navegador solo consume esta
// estructura; el parseo de markdown ocurre aquí, en tiempo de construcción.
//
// Uso: npm run generar  (equivale a: node scripts/extraer-datos.js)

import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const DIR_RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR_TRIVIALES = join(DIR_RAIZ, "triviales");
const DIR_PROBLEMAS = join(DIR_RAIZ, "problemas-diseno");
const ARCHIVO_SALIDA = join(DIR_RAIZ, "data", "ejercicios.js");

// --- Expresiones para el parseo (estructura fija definida en
// triviales/instrucciones-generador-ejercicios-triviales.md) -------------------

const EXPRESION_ENCABEZADO = /^# (?:Ejercicio|Problema) \d{3}\s*-\s*(.+)$/;
const EXPRESION_META = /^\*\*([^*]+):\*\*\s*(.*)$/;
const EXPRESION_EJEMPLO = /^\*\*(Ejemplo|Escenario)\b[^*]*\*\*:?\s*$/;
const EXPRESION_ITEM_LISTA = /^-\s+(.*)$/;
const EXPRESION_ITEM_NUMERADO = /^\d+\.\s+(.*)$/;
const EXPRESION_FENCE = /^```(\w*)\s*$/;
const EXPRESION_SUMMARY = /<summary>(.*?)<\/summary>/;
const EXPRESION_ESTRELLA = /⭐/g;

/** Cuenta las estrellas de dificultad de un valor como "⭐⭐☆☆☆". */
export function contarEstrellas(valor) {
  const coincidencias = String(valor ?? "").match(EXPRESION_ESTRELLA);
  return coincidencias ? coincidencias.length : 0;
}

/**
 * Convierte un conjunto de líneas de una sección en una lista de bloques
 * tipados: parrafo | lista | codigo | ejemplo | pista.
 */
export function construirBloques(lineas) {
  const bloques = [];
  let pila = null; // bloque abierto (codigo, ejemplo o pista)
  let parrafo = [];
  let lista = null;

  const cerrarParrafo = () => {
    if (parrafo.length > 0) {
      bloques.push({ tipo: "parrafo", texto: parrafo.join(" ").trim() });
      parrafo = [];
    }
  };
  const cerrarLista = () => {
    if (lista) {
      bloques.push(lista);
      lista = null;
    }
  };

  for (const linea of lineas) {
    if (pila) {
      if (pila.tipo === "codigo") {
        if (EXPRESION_FENCE.test(linea)) {
          bloques.push(pila);
          pila = null;
        } else {
          pila.codigo += (pila.codigo ? "\n" : "") + linea;
        }
      } else if (pila.tipo === "ejemplo") {
        // Un ejemplo es un título + una valla de código. La primera valla abre
        // la recolección y la segunda la cierra (las líneas de valla se ignoran).
        if (EXPRESION_FENCE.test(linea)) {
          if (pila.dentroFence) {
            pila.codigo = pila.codigo.trim();
            bloques.push(pila);
            pila = null;
          } else {
            pila.dentroFence = true;
          }
        } else {
          pila.codigo += (pila.codigo ? "\n" : "") + linea;
        }
      } else if (pila.tipo === "pista") {
        const mSummary = linea.match(EXPRESION_SUMMARY);
        if (mSummary) {
          pila.resumen = mSummary[1].trim();
        } else if (linea.trim() === "</details>") {
          bloques.push(pila);
          pila = null;
        } else {
          pila.contenido.push(linea);
        }
      }
      continue;
    }

    if (linea.trim() === "") {
      cerrarParrafo();
      cerrarLista();
      continue;
    }

    const mEjemplo = linea.match(EXPRESION_EJEMPLO);
    if (mEjemplo) {
      cerrarParrafo();
      cerrarLista();
      pila = {
        tipo: "ejemplo",
        titulo: linea
          .replace(/^\*\*/, "")
          .replace(/\*\*:?\s*$/, "")
          .trim(),
        codigo: "",
        dentroFence: false,
      };
      continue;
    }

    const mFence = linea.match(EXPRESION_FENCE);
    if (mFence) {
      cerrarParrafo();
      cerrarLista();
      pila = { tipo: "codigo", lenguaje: mFence[1], codigo: "" };
      continue;
    }

    if (linea.trim() === "<details>") {
      cerrarParrafo();
      cerrarLista();
      pila = { tipo: "pista", resumen: "", contenido: [] };
      continue;
    }

    const mLista = linea.match(EXPRESION_ITEM_LISTA);
    if (mLista) {
      cerrarParrafo();
      if (!lista || lista.ordenada) {
        lista = { tipo: "lista", ordenada: false, items: [] };
      }
      lista.items.push(mLista[1].trim());
      continue;
    }

    const mNumerado = linea.match(EXPRESION_ITEM_NUMERADO);
    if (mNumerado) {
      cerrarParrafo();
      if (!lista || !lista.ordenada) {
        lista = { tipo: "lista", ordenada: true, items: [] };
      }
      lista.items.push(mNumerado[1].trim());
      continue;
    }

    // Texto normal: se acumula en el párrafo actual.
    cerrarLista();
    parrafo.push(linea.trim());
  }

  // Cierre pendiente al final de la sección.
  if (pila && (pila.tipo === "codigo" || pila.tipo === "ejemplo")) {
    pila.codigo = pila.codigo.trim();
    bloques.push(pila);
  }
  cerrarParrafo();
  cerrarLista();

  // El contenido de una pista se parsea de forma recursiva (puede tener listas).
  return bloques.map((bloque) =>
    bloque.tipo === "pista" ? { ...bloque, contenido: construirBloques(bloque.contenido) } : bloque
  );
}

/** Clasifica una sección según sus bloques para que el renderer elija el layout. */
export function clasificarSeccion(bloques) {
  if (bloques.length === 0) {
    return "vacia";
  }
  if (bloques.some((b) => b.tipo === "pista")) {
    return "pistas";
  }
  if (bloques.some((b) => b.tipo === "ejemplo")) {
    return "ejemplos";
  }
  if (bloques.length === 1 && bloques[0].tipo === "codigo") {
    return "codigo";
  }
  if (bloques.every((b) => b.tipo === "lista")) {
    return "lista";
  }
  return "texto";
}

/**
 * Parsea un archivo markdown de ejercicio y devuelve el objeto estructurado.
 * Se exporta para poder testearlo con node --test.
 */
export function parsearArchivo(nombreArchivo, contenido) {
  const base = nombreArchivo.toLowerCase();
  const esProblema = base.startsWith("problema-");
  const numero = Number.parseInt(base.match(/\d{3}/)?.[0] ?? "0", 10);

  const lineas = contenido.split(/\r?\n/);
  const meta = {};
  let titulo = null;
  const secciones = [];
  let seccionActual = null;

  for (const linea of lineas) {
    const mEncabezado = linea.match(EXPRESION_ENCABEZADO);
    if (mEncabezado) {
      titulo = mEncabezado[1].trim();
      continue;
    }
    const mMeta = linea.match(EXPRESION_META);
    if (mMeta && !seccionActual) {
      meta[mMeta[1].trim()] = mMeta[2].trim();
      continue;
    }
    if (linea.startsWith("## ")) {
      seccionActual = { titulo: linea.slice(3).trim(), bloques: [] };
      secciones.push(seccionActual);
      continue;
    }
    if (seccionActual) {
      seccionActual.bloques.push(linea);
    }
  }

  const coleccion = esProblema ? "problemas" : "ejercicios";
  const valorNivel = meta["Nivel"] ?? "";
  const separadorNivel = valorNivel.indexOf(" - ");

  return {
    numero,
    coleccion,
    titulo: titulo ?? base.replace(/\.[^.]+$/, ""),
    nivel: separadorNivel >= 0 ? Number.parseInt(valorNivel.slice(0, separadorNivel), 10) : 0,
    nombreNivel: separadorNivel >= 0 ? valorNivel.slice(separadorNivel + 3).trim() : "",
    temas: (meta["Tema(s)"] ?? "")
      .split(",")
      .map((tema) => tema.trim())
      .filter(Boolean),
    dificultad: contarEstrellas(meta["Dificultad estimada"]),
    categoria: meta["Categoría"] ?? null,
    enfoquePoo: meta["Enfoque POO"] ?? null,
    secciones: secciones
      .map((seccion) => {
        const bloques = construirBloques(seccion.bloques);
        const tipo = clasificarSeccion(bloques);
        if (tipo === "vacia") {
          return null;
        }
        return { titulo: seccion.titulo, tipo, bloques };
      })
      .filter(Boolean),
  };
}

/** Lee un directorio de ejercicios y devuelve los ítems ordenados por número. */
async function parsearDirectorio(directorio, esProblema) {
  // Se excluyen los archivos de soporte (índice e instrucciones del generador).
  const archivos = (await readdir(directorio))
    .filter(
      (archivo) =>
        archivo.endsWith(".md") &&
        !archivo.toUpperCase().startsWith("INDICE") &&
        !archivo.startsWith("instrucciones-")
    )
    .sort();
  const items = [];
  for (const archivo of archivos) {
    const contenido = await readFile(join(directorio, archivo), "utf8");
    const item = parsearArchivo(archivo, contenido);
    if (esProblema) {
      item.coleccion = "problemas";
    }
    items.push(item);
  }
  items.sort((a, b) => a.numero - b.numero);
  return items;
}

async function main() {
  const ejercicios = await parsearDirectorio(DIR_TRIVIALES, false);
  const problemas = await parsearDirectorio(DIR_PROBLEMAS, true);

  const datos = {
    generado: new Date().toISOString(),
    colecciones: [
      {
        clave: "ejercicios",
        nombre: "Ejercicios",
        descripcion: "Ejercicios de programación en Java, de Básico I a Experto I.",
        items: ejercicios,
      },
      {
        clave: "problemas",
        nombre: "Problemas de diseño",
        descripcion: "Problemas de diseño POO, de Modelado simple a Sistemas completos.",
        items: problemas,
      },
    ],
  };

  await mkdir(dirname(ARCHIVO_SALIDA), { recursive: true });
  const contenidoJS = `/* eslint-disable */\n// Generado automáticamente por scripts/extraer-datos.js — NO editar a mano.\n// Regenerar con: npm run generar\n\nexport const JAVARCISES = ${JSON.stringify(datos, null, 2)};\n`;
  await writeFile(ARCHIVO_SALIDA, contenidoJS);

  const total = ejercicios.length + problemas.length;
  const nivelesEjercicios = new Set(ejercicios.map((e) => e.nivel)).size;
  const nivelesProblemas = new Set(problemas.map((p) => p.nivel)).size;
  console.log(
    `Generados ${total} ítems → ${ARCHIVO_SALIDA}\n` +
      `  ejercicios: ${ejercicios.length} (${nivelesEjercicios} niveles)\n` +
      `  problemas: ${problemas.length} (${nivelesProblemas} niveles)`
  );
}

// Solo se ejecuta al correrlo directamente (no al importarlo desde los tests).
const esEjecutadoDirectamente =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (esEjecutadoDirectamente) {
  main().catch((error) => {
    console.error("Error al generar los datos:", error);
    process.exitCode = 1;
  });
}
