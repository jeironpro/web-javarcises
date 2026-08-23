// Lógica pura de paginación: no depende del DOM, por lo que se puede
// testear con node --test (js/paginacion.test.js).

export const POR_PAGINA = 12;

/**
 * Corta una lista para la página indicada.
 * Devuelve los ítems de la página, el número de página seguro (dentro de
 * rango) y los contadores "desde–hasta de total".
 */
export function paginar(lista, pagina, porPagina = POR_PAGINA) {
  const totalPaginas = Math.max(1, Math.ceil(lista.length / porPagina));
  const paginaSegura = Math.min(Math.max(1, pagina), totalPaginas);
  const inicio = (paginaSegura - 1) * porPagina;
  const items = lista.slice(inicio, inicio + porPagina);
  return {
    items,
    pagina: paginaSegura,
    totalPaginas,
    desde: lista.length === 0 ? 0 : inicio + 1,
    hasta: lista.length === 0 ? 0 : inicio + items.length,
    total: lista.length,
  };
}

/**
 * Calcula la secuencia de páginas a mostrar en el paginador: primera y
 * última siempre visibles, la actual con una vecina a cada lado, y "…"
 * donde haya un salto.
 */
export function numerosDePagina(paginaActual, totalPaginas) {
  if (totalPaginas <= 7) {
    return rango(1, totalPaginas).map((numero) => ({ tipo: "pagina", numero }));
  }
  const resultado = [{ tipo: "pagina", numero: 1 }];
  const desde = Math.max(2, paginaActual - 1);
  const hasta = Math.min(totalPaginas - 1, paginaActual + 1);
  if (desde > 2) {
    resultado.push({ tipo: "elipsis" });
  }
  for (let numero = desde; numero <= hasta; numero += 1) {
    resultado.push({ tipo: "pagina", numero });
  }
  if (hasta < totalPaginas - 1) {
    resultado.push({ tipo: "elipsis" });
  }
  resultado.push({ tipo: "pagina", numero: totalPaginas });
  return resultado;
}

function rango(inicio, fin) {
  const valores = [];
  for (let i = inicio; i <= fin; i += 1) {
    valores.push(i);
  }
  return valores;
}
