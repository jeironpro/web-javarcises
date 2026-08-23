// Tests de la lógica pura de paginación (js/paginacion.js) con node --test.
// Se ejecutan con: npm test

import assert from "node:assert/strict";
import test from "node:test";
import { numerosDePagina, paginar, POR_PAGINA } from "./paginacion.js";

test("paginar corta la lista por página", () => {
  const lista = Array.from({ length: 81 }, (_, i) => i + 1);
  const primera = paginar(lista, 1);
  assert.equal(primera.items.length, POR_PAGINA);
  assert.equal(primera.pagina, 1);
  assert.equal(primera.totalPaginas, 7);
  assert.equal(primera.desde, 1);
  assert.equal(primera.hasta, 12);
  assert.equal(primera.total, 81);

  const ultima = paginar(lista, 7);
  assert.equal(ultima.items.length, 9);
  assert.equal(ultima.desde, 73);
  assert.equal(ultima.hasta, 81);
});

test("paginar acota la página fuera de rango", () => {
  const lista = Array.from({ length: 10 }, (_, i) => i + 1);
  assert.equal(paginar(lista, 0).pagina, 1);
  assert.equal(paginar(lista, 99).pagina, 1);
});

test("paginar con lista vacía no rompe", () => {
  const resultado = paginar([], 1);
  assert.equal(resultado.items.length, 0);
  assert.equal(resultado.totalPaginas, 1);
  assert.equal(resultado.desde, 0);
  assert.equal(resultado.hasta, 0);
});

test("numerosDePagina muestra todas las páginas si hay pocas", () => {
  const secuencia = numerosDePagina(4, 7);
  assert.deepEqual(
    secuencia.map((entrada) => (entrada.tipo === "elipsis" ? "…" : entrada.numero)),
    [1, 2, 3, 4, 5, 6, 7]
  );
});

test("numerosDePagina usa elipsis para rangos largos", () => {
  const secuencia = numerosDePagina(10, 20);
  assert.deepEqual(
    secuencia.map((entrada) => (entrada.tipo === "elipsis" ? "…" : entrada.numero)),
    [1, "…", 9, 10, 11, "…", 20]
  );
});

test("numerosDePagina siempre incluye primera y última página", () => {
  const secuencia = numerosDePagina(1, 20);
  const numeros = secuencia.filter((entrada) => entrada.tipo === "pagina").map((e) => e.numero);
  assert.equal(numeros[0], 1);
  assert.equal(numeros[numeros.length - 1], 20);
});
