// Servidor estático local (cero dependencias) para desarrollo.
// Uso: npm run dev  (equivale a: node scripts/servir.js)
//
// Los ES Modules no cargan con file://, por lo que el proyecto se sirve
// por HTTP. Puerto por defecto: 4173 (se puede cambiar con PORT).

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { dirname, extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const DIR_RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const RAIZ_SEGURA = DIR_RAIZ.endsWith(sep) ? DIR_RAIZ : `${DIR_RAIZ}${sep}`;
const PUERTO_INICIAL = Number(process.env.PORT) || 4173;

const TIPOS_CONTENIDO = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".md": "text/markdown; charset=utf-8",
};

async function manejarPeticion(req, res) {
  const url = new URL(req.url ?? "/", "http://localhost");
  let ruta = decodeURIComponent(url.pathname);
  if (ruta === "/") {
    ruta = "/index.html";
  }

  const archivo = normalize(join(DIR_RAIZ, ruta));
  if (!archivo.startsWith(RAIZ_SEGURA)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("403 — Prohibido");
    return;
  }

  try {
    const informacion = await stat(archivo);
    if (!informacion.isFile()) {
      throw new Error("No es un archivo");
    }
    const contenido = await readFile(archivo);
    res.writeHead(200, {
      "Content-Type": TIPOS_CONTENIDO[extname(archivo)] ?? "application/octet-stream",
    });
    res.end(contenido);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 — No encontrado");
  }
}

function iniciar(puerto) {
  const servidor = createServer(manejarPeticion);
  servidor.on("error", (error) => {
    if (error.code === "EADDRINUSE" && puerto < PUERTO_INICIAL + 10) {
      iniciar(puerto + 1);
    } else {
      console.error("Error al iniciar el servidor:", error.message);
      process.exitCode = 1;
    }
  });
  servidor.listen(puerto, () => {
    console.log(`Javarcises disponible en http://localhost:${puerto}`);
  });
}

iniciar(PUERTO_INICIAL);
