# Libro de estilo — Javarcises

> Documento de referencia para toda la interfaz web del proyecto **web-javarcises**.
> Aprobado como parte del plan de implementación (dirección de diseño elegida por el usuario: **Ficha de laboratorio**).

## 1. Proyecto y audiencia

- **Producto**: web estática que muestra los ejercicios de programación en Java del repo (`triviales/` y `problemas-diseno/`), con listado paginado, filtros y vista de detalle.
- **Audiencia**: estudiantes de programación (hispanohablantes) que practican Java; el sitio es un portafolio personal.
- **Personalidad de marca**: técnica, sobria, ordenada. Evoca la ficha técnica de un laboratorio o una especificación de ingeniería: datos precisos, etiquetas monoespaciadas, rejilla estricta. Sin adornos superfluos, sin estética "terminal retro", sin gradientes llamativos.

## 2. Dirección de diseño

**Ficha de laboratorio** — estructura tabular y tipográfica:

- Tarjetas tipo **ficha** con una fila de metadatos superior (número `001`, badge de nivel, dificultad), título y temas.
- Líneas finas (hairline) como separadores; la elevación se comunica con bordes, no con sombras.
- Números, etiquetas y código en monoespaciada: el "dato" manda.
- Contraste alto, foco visible, un único color de acento (azul acero).

## 3. Paleta

Colores definidos como custom properties en `:root` (formato **OKLCH**). Neutros con un tinte sutil hacia el azul acero para dar cohesión; nunca se usan negro (`#000`) ni blanco (`#fff`) puros.

| Token                        | Valor OKLCH              | Uso                                   |
| ---------------------------- | ------------------------ | ------------------------------------- |
| `--color-fondo`              | `oklch(0.973 0.006 245)` | Fondo de página (papel azulado claro) |
| `--color-superficie`         | `oklch(0.995 0.003 245)` | Tarjetas/fichas                       |
| `--color-superficie-elevada` | `oklch(0.985 0.006 245)` | Hover de tarjetas                     |
| `--color-superficie-acento`  | `oklch(0.93 0.025 250)`  | Paneles/badges con tinte de acento    |
| `--color-tinta`              | `oklch(0.24 0.028 255)`  | Texto principal                       |
| `--color-tinta-suave`        | `oklch(0.42 0.022 252)`  | Texto secundario                      |
| `--color-tinta-sutil`        | `oklch(0.56 0.015 250)`  | Metadatos de baja prioridad           |
| `--color-acento`             | `oklch(0.53 0.105 250)`  | Azul acero: enlaces, bordes activos   |
| `--color-acento-fuerte`      | `oklch(0.44 0.115 250)`  | Botones sólidos, texto sobre acento   |
| `--color-acento-claro`       | `oklch(0.91 0.03 250)`   | Fondos de badges de nivel             |
| `--color-borde`              | `oklch(0.87 0.014 245)`  | Líneas hairline                       |
| `--color-borde-fuerte`       | `oklch(0.80 0.02 248)`   | Líneas en hover/foco                  |
| `--color-codigo-fondo`       | `oklch(0.27 0.03 255)`   | Panel oscuro de bloques de código     |
| `--color-codigo-tinta`       | `oklch(0.93 0.008 245)`  | Texto sobre panel de código           |
| `--color-foco`               | `oklch(0.53 0.105 250)`  | Anillo de `:focus-visible`            |

### Contraste

- Texto principal sobre fondo/superficie: **≥ 7:1**.
- Texto secundario (`--color-tinta-suave`): **≥ 4.5:1**.
- Texto blanco (`oklch(0.98 …)`) sobre `--color-acento-fuerte`: **≥ 4.5:1**.
- El color nunca es el único canal de información (siempre se acompaña de texto o icono + texto).

## 4. Tipografía

Fuentes de Google Fonts:

- **Display y cuerpo**: [Archivo](https://fonts.google.com/specimen/Archivo) (variable, pesos 400–700). Grotesca sobria con carácter técnico.
- **Mono**: [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) (pesos 400, 500, 600) para etiquetas en mayúsculas, números de ficha, niveles y código.

| Jerarquía                   | Familia       | Tamaño                     | Peso | Caso                                 |
| --------------------------- | ------------- | -------------------------- | ---- | ------------------------------------ |
| Título de página (masthead) | Archivo       | `clamp(2rem, 4.5vw, 3rem)` | 700  | Normal, sin itálica                  |
| Título de ficha             | Archivo       | `1.125–1.25rem`            | 600  | Normal                               |
| Cuerpo                      | Archivo       | `1rem`                     | 400  | Normal                               |
| Etiqueta de sección         | IBM Plex Mono | `0.75rem`                  | 600  | Mayúsculas, `letter-spacing: 0.08em` |
| Metadatos (números, nivel)  | IBM Plex Mono | `0.8125rem`                | 500  | Normal                               |
| Código                      | IBM Plex Mono | `0.875rem`                 | 400  | —                                    |

Reglas: titulares siempre en **romana** (nunca itálica); el énfasis se lleva con peso, color o subrayado. Sin `Inter`, `Roboto` ni fuentes de sistema como elección principal.

## 5. Espaciados, grilla y radios

- **Escala de espaciado** de 4 pt: `--esp-1: 0.25rem` … `--esp-8: 4rem` (0.25 / 0.5 / 0.75 / 1 / 1.5 / 2 / 3 / 4 rem).
- **Grilla**: ancho máximo `--ancho-max: 72rem`; rejilla de fichas con `grid-template-columns: minmax(0, 1fr)` y `gap: 1rem`.
  - Base (móvil): 1 columna.
  - `≥ 640px`: 2 columnas.
  - `≥ 960px`: 3 columnas.
- **Breakpoints** (mobile-first, `min-width`): `640px`, `768px`, `960px`, `1200px`.
- **Radios**: `--radio-1: 4px` (fichas, inputs), `--radio-2: 8px` (badges, botones), `--radio-3: 12px` (paneles de código).
- **Elevación**: hairline (`1px` `--color-borde`) por defecto; sombra sutil solo en hover de tarjetas y elementos elevados (`0 2px 10px oklch(0.3 0.05 250 / 0.10)`). Nada de "glassmorphism".

## 6. Iconografía

- **Material Symbols** (Google), estilo _outlined_, tamaño `1.25rem` (`--tam-icono`).
- Cada icono es un `<span class="material-symbols-outlined" aria-hidden="true">` con el nombre del glifo como texto.
- **Prohibido incrustar emojis** en la UI o el código. Las estrellas de dificultad de los ejercicios (⭐ en markdown) se convierten en números 1–5 y se dibujan con el glifo `star`.

## 7. Componentes base y estados

### Botones

- **Primario** (`--color-acento-fuerte`, texto claro): estado default, `:hover` (oscurecer 5 %), `:active` (trasladar 1 px), `:focus-visible` (anillo `--color-foco`), `:disabled`.
- **Secundario** (transparente, borde `--color-borde-fuerte`, texto tinta): mismos estados.
- Tamaño mínimo de área táctil 44 px; el texto del botón nunca ocupa dos líneas.

### Badge de nivel / colección

- Fondo `--color-acento-claro`, texto `--color-acento-fuerte`, mono 0.75rem, radio 8 px, padding `0.25rem 0.5rem`.

### Ficha (tarjeta de ejercicio)

- Superficie con borde hairline y radio 4 px; padding `--esp-4`.
- Fila superior: número (`001`) en mono sutil + badge de nivel + dificultad (iconos `star`, rellenas = dificultad, vacías = resto).
- Título Archivo 600; temas como chips mono; enlace "Ver ficha" al final.

### Paginación

- Botones nativos (`button`): flechas anterior/siguiente + números con elipsis (`…`).
- Página activa: `aria-current="page"`, fondo `--color-acento-fuerte`, texto claro.
- Texto auxiliar: "Mostrando X–Y de N".

### Inputs

- `label` asociado (`for`/`id`), borde hairline, radio 4 px, foco visible con anillo; el placeholder nunca es la única indicación.

### Bloques de código

- Panel oscuro (`--color-codigo-fondo`), texto `--color-codigo-tinta`, mono 0.875rem, radio 12 px, padding `--esp-4`, scroll horizontal interno si excede. **Sin** barra de ventana ni puntos decorativos (sin chrome falso).

### Pistas (detalle)

- `<details>`/`<summary>` nativos estilizados; el summary usa mono 0.8125rem con icono de bombilla.

## 8. Accesibilidad y responsive

- Landmarks semánticos (`header`, `nav`, `main`, `footer`), enlace "Saltar al contenido", `lang="es"`.
- Foco visible en todos los elementos interactivos (`:focus-visible`).
- `overflow-x: clip` en `html` y `body` (nunca `hidden`); sin scroll horizontal a 320 / 375 / 414 / 768 px.
- Rejillas de imágenes/código con `minmax(0, 1fr)`; los encabezados largos envuelven con `overflow-wrap: anywhere`.
- `prefers-reduced-motion: reduce` desactiva transiciones/animaciones.
- El orden del DOM respeta el orden de lectura/tabulación.

## 9. Tokens de referencia (CSS)

```css
:root {
  /* paleta (ver tabla §3) */
  /* tipografía */
  --font-display: "Archivo", "Helvetica Neue", Arial, sans-serif;
  --font-cuerpo: "Archivo", "Helvetica Neue", Arial, sans-serif;
  --font-mono: "IBM Plex Mono", "SFMono-Regular", Consolas, monospace;
  /* espaciado */
  --esp-1: 0.25rem;
  --esp-2: 0.5rem;
  --esp-3: 0.75rem;
  --esp-4: 1rem;
  --esp-5: 1.5rem;
  --esp-6: 2rem;
  --esp-7: 3rem;
  --esp-8: 4rem;
  /* otros */
  --radio-1: 4px;
  --radio-2: 8px;
  --radio-3: 12px;
  --ancho-max: 72rem;
  --tam-icono: 1.25rem;
}
```

Todos los colores y fuentes del CSS deben referenciar estos tokens; no se permiten valores hex/OKLCH sueltos fuera de `:root`.
