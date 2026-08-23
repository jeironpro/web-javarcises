// Tests del parser de markdown (scripts/extraer-datos.js) con node --test.
// Se ejecutan con: npm test

import assert from "node:assert/strict";
import test from "node:test";
import {
  clasificarSeccion,
  construirBloques,
  contarEstrellas,
  parsearArchivo,
} from "./extraer-datos.js";

const EJERCICIO_001 = `# Ejercicio 001 - Convertidor de tiempo de carrera

**Nivel:** 1 - Básico I
**Tema(s):** variables, operadores aritméticos
**Dificultad estimada:** ⭐⭐☆☆☆

## Enunciado

El entrenador cronometra a sus corredores en **segundos** con un cronómetro digital.

## Instrucciones

- Usa la clase \`Scanner\` para leer el valor.
- No uses \`if\` ni \`else\`.

## Firma sugerida

\`\`\`java
public class ConvertidorDeTiempo {
    public static void main(String[] args) {
        // Tu código aquí
    }
}
\`\`\`

## Ejemplos de ejecución

**Ejemplo 1:**
\`\`\`
Entrada: 8130
Salida: Tiempo: 2h 15min 30s
\`\`\`

**Ejemplo 2 (caso borde):**
\`\`\`
Entrada: 0
Salida: Tiempo: 0h 0min 0s
\`\`\`

## Casos límite a considerar

- Valores menores a 60.
- Múltiplos exactos de 3600.

## Pistas (opcional, ocultables)

<details>
<summary>Ver pista</summary>

Las horas son el resultado de dividir el total entre 3600.

</details>
`;

const PROBLEMA_001 = `# Problema 001 - El termómetro del cuarto de servidores

**Nivel:** 1 - Modelado simple
**Categoría:** Procesamiento de datos
**Enfoque POO:** Ninguno (problema procedural: el diseño de clases no aporta valor aquí)
**Dificultad estimada:** ⭐⭐☆☆☆

## Contexto del problema

Un sensor toma una lectura de temperatura cada hora.

## Preguntas de análisis previo (responder antes de programar)

1. ¿Qué entidades del mundo real identificas?
2. ¿Cómo sabes cuándo "termina" una racha de riesgo?

## Criterios de una buena solución

- El umbral se maneja con la desigualdad correcta.
- Las rachas largas se reportan completas.
`;

test("contarEstrellas cuenta la dificultad", () => {
  assert.equal(contarEstrellas("⭐⭐☆☆☆"), 2);
  assert.equal(contarEstrellas("⭐☆☆☆☆"), 1);
  assert.equal(contarEstrellas(undefined), 0);
});

test("clasificarSeccion distingue los tipos de sección", () => {
  assert.equal(clasificarSeccion([{ tipo: "codigo", codigo: "x" }]), "codigo");
  assert.equal(clasificarSeccion([{ tipo: "lista", items: ["a"] }]), "lista");
  assert.equal(clasificarSeccion([{ tipo: "ejemplo", titulo: "E1", codigo: "x" }]), "ejemplos");
  assert.equal(clasificarSeccion([{ tipo: "pista", resumen: "v", contenido: [] }]), "pistas");
  assert.equal(
    clasificarSeccion([
      { tipo: "parrafo", texto: "hola" },
      { tipo: "lista", items: ["a"] },
    ]),
    "texto"
  );
  assert.equal(clasificarSeccion([]), "vacia");
});

test("construirBloques agrupa listas numeradas y con viñetas", () => {
  const bloques = construirBloques([
    "1. Primer punto",
    "2. Segundo punto",
    "",
    "- Con viñeta",
    "- Otra viñeta",
  ]);
  assert.equal(bloques.length, 2);
  assert.equal(bloques[0].tipo, "lista");
  assert.equal(bloques[0].ordenada, true);
  assert.deepEqual(bloques[0].items, ["Primer punto", "Segundo punto"]);
  assert.equal(bloques[1].ordenada, false);
  assert.deepEqual(bloques[1].items, ["Con viñeta", "Otra viñeta"]);
});

test("parsearArchivo estructura un ejercicio trivial", () => {
  const item = parsearArchivo(
    "ejercicio-001-nivel-1-convertidor-de-tiempo-de-carrera.md",
    EJERCICIO_001
  );

  assert.equal(item.numero, 1);
  assert.equal(item.coleccion, "ejercicios");
  assert.equal(item.titulo, "Convertidor de tiempo de carrera");
  assert.equal(item.nivel, 1);
  assert.equal(item.nombreNivel, "Básico I");
  assert.deepEqual(item.temas, ["variables", "operadores aritméticos"]);
  assert.equal(item.dificultad, 2);
  assert.equal(item.categoria, null);

  assert.deepEqual(
    item.secciones.map((seccion) => seccion.titulo),
    [
      "Enunciado",
      "Instrucciones",
      "Firma sugerida",
      "Ejemplos de ejecución",
      "Casos límite a considerar",
      "Pistas (opcional, ocultables)",
    ]
  );

  const firma = item.secciones.find((seccion) => seccion.titulo === "Firma sugerida");
  assert.equal(firma.tipo, "codigo");
  assert.match(firma.bloques[0].codigo, /public class ConvertidorDeTiempo/);

  const ejemplos = item.secciones.find((seccion) => seccion.titulo === "Ejemplos de ejecución");
  assert.equal(ejemplos.tipo, "ejemplos");
  assert.equal(ejemplos.bloques.length, 2);
  assert.equal(ejemplos.bloques[0].titulo, "Ejemplo 1:");
  assert.match(ejemplos.bloques[0].codigo, /Salida: Tiempo: 2h 15min 30s/);

  const pistas = item.secciones.find((seccion) => seccion.tipo === "pistas");
  assert.equal(pistas.bloques[0].resumen, "Ver pista");
  assert.equal(pistas.bloques[0].contenido[0].tipo, "parrafo");
});

test("parsearArchivo estructura un problema de diseño", () => {
  const item = parsearArchivo(
    "problema-001-nivel-1-monitoreo-de-temperatura-del-servidor.md",
    PROBLEMA_001
  );

  assert.equal(item.numero, 1);
  assert.equal(item.coleccion, "problemas");
  assert.equal(item.titulo, "El termómetro del cuarto de servidores");
  assert.equal(item.nombreNivel, "Modelado simple");
  assert.equal(item.categoria, "Procesamiento de datos");
  assert.equal(
    item.enfoquePoo,
    "Ninguno (problema procedural: el diseño de clases no aporta valor aquí)"
  );

  const preguntas = item.secciones.find((seccion) =>
    seccion.titulo.startsWith("Preguntas de análisis")
  );
  assert.equal(preguntas.tipo, "lista");
  assert.equal(preguntas.bloques[0].ordenada, true);
  assert.equal(preguntas.bloques[0].items.length, 2);
});

// Integración: los datos generados deben coincidir con el catálogo real.
test("data/ejercicios.js contiene las colecciones esperadas", async () => {
  const { JAVARCISES } = await import("../data/ejercicios.js");
  const colecciones = JAVARCISES.colecciones;
  assert.equal(colecciones.length, 2);

  const ejercicios = colecciones.find((coleccion) => coleccion.clave === "ejercicios");
  const problemas = colecciones.find((coleccion) => coleccion.clave === "problemas");
  assert.equal(ejercicios.items.length, 81);
  assert.equal(problemas.items.length, 30);

  for (const item of [...ejercicios.items, ...problemas.items]) {
    assert.ok(item.titulo.length > 0, "todo ítem tiene título");
    assert.ok(item.nivel >= 1, "todo ítem tiene nivel");
    assert.ok(item.secciones.length > 0, "todo ítem tiene al menos una sección");
  }
});
