# Documento técnico — `accessible.html`

Interfaz accesible del Cancionero SJJ. Archivo único (HTML + CSS + JS embebidos), sin dependencias externas. Diseñada para operar con TalkBack (Android), VoiceOver (iOS), mando GamePad y pantalla táctil.

---

## Regla fundamental de accesibilidad

**Todos los elementos interactivos son `<button>`**, incluyendo las líneas de la letra de las canciones. Esto es deliberado: TalkBack trata los botones como elementos atómicos y lee únicamente su texto. Si se usan `<div>` o `<p>` con `tabindex`, TalkBack anuncia el formato CSS del contenedor padre al entrar y salir ("Iniciar 20px color de fuente verde; fuente mono"), lo cual interrumpe la experiencia. Con botones ese comportamiento desaparece.

---

## Estructura de vistas

La app tiene dos vistas que se alternan con `display: flex / none`. Solo una está visible a la vez.

```
body
├── #aria-live          ← anuncios ARIA (sr-only, aria-live="polite")
├── #menu-view          ← vista de cuadrícula
│   ├── header.top-row  ← botón Buscar
│   ├── #page-info      ← "Página X de Y · Canciones N–M"
│   ├── #song-grid      ← cuadrícula de botones numéricos (role="grid")
│   └── #menu-footer    ← botones Anterior / Siguiente + estado del mando
└── #song-view          ← vista de canción
    ├── header.top-row  ← botones Regresar / Buscar / Guardar NFC
    ├── h1#song-heading ← título (sr-only, usado por aria-labelledby)
    └── #song-lines     ← botones de letra, uno por línea
```

---

## Estado global (`S`)

Objeto único que concentra todo el estado de la app:

| Campo | Tipo | Descripción |
|---|---|---|
| `mode` | `"MENU"` \| `"SONG"` | Vista activa |
| `songs` | array | Catálogo cargado de `data/songs.json` |
| `page` | number | Página actual de la cuadrícula |
| `pageSize` | number | Canciones por página (recalculado por columnas × 8 filas) |
| `songNum` | number \| null | Número de la canción abierta |
| `lines` | array | Líneas de texto de la canción activa |
| `nfcBusy` | boolean | Operación NFC en curso |

---

## Datos

- **`data/songs.json`** — array de objetos `{ song: number, title: string }` para las 163 canciones.
- **`data/NNN.txt`** — letra de cada canción. Nombre con cero a la izquierda (`001.txt`). Cada línea no vacía se convierte en un botón. La primera línea es el título completo (ej. `CANCIÓN 1. Las cualidades principales de Jehová...`).

---

## Cuadrícula (`#menu-view`)

- Usa CSS Grid con `grid-template-columns: repeat(auto-fit, minmax(52px, 1fr))`.
- `computePageSize()` lee el número de columnas renderizadas y multiplica por 8 filas.
- Se re-renderiza con `ResizeObserver` cuando cambia el ancho de pantalla.
- Cada celda es un `<button class="song-cell">` con `aria-label="Canción N. Título completo"`.
- Las celdas vacías al final de la última página tienen `aria-hidden="true"`.

---

## Vista de canción (`#song-view`)

- `openSong(num)` carga el `.txt`, llama a `renderSong()`, cambia a `showSong()` y enfoca el primer botón.
- `renderSong()` crea un `<button class="song-line">` por cada línea. El botón no tiene acción de click; el foco es suficiente para que TalkBack lo lea.
- La navegación línea a línea (`lineUp` / `lineDown`) mueve el foco programáticamente con `.focus()` y llama a `scrollIntoView`.
- Al llegar a la última línea, `lineDown` dispara vibración larga y anuncia "Fin de la canción" vía `ariaAnn`.

---

## Mando GamePad

Loop de `requestAnimationFrame` (`gpLoop`) que lee `navigator.getGamepads()` cada frame. Los botones se detectan por flanco de subida (`isJustPressed`) para evitar repetición.

| Contexto | Botón | Acción |
|---|---|---|
| Menú | A (0) | Abrir canción seleccionada |
| Menú | Y (3) | Búsqueda por voz |
| Menú | LB (4) / RB (5) | Página anterior / siguiente |
| Menú | D-pad | Mover selección en cuadrícula |
| Canción | X (2) | Volver al menú |
| Canción | Y (3) | Búsqueda por voz |
| Canción | LB (4) / RB (5) | Línea anterior / siguiente |
| Canción | D-pad ↑↓ | Línea anterior / siguiente |
| Canción | SELECT (8) | Guardar en etiqueta NFC |
| NFC o Voz activos | X (2) | Cancelar operación |

---

## Búsqueda por voz

Usa `SpeechRecognition` (`webkitSpeechRecognition`), idioma `es-419`, hasta 5 alternativas. El parser `_parseSongCommand` intenta dos estrategias en orden:

1. **Número**: convierte palabras en español a entero (tablas `_UNITS`, `_TENS`, `_TWENTIES`, manejo de "ciento...").
2. **Título**: tokeniza el transcript y compara contra los títulos del catálogo. Requiere ≥ 50% de palabras coincidentes.

Resultado: llama a `navigateToSong(num)` que posiciona la página correcta y abre la canción.

---

## NFC

Solo disponible en Android con Chrome y hardware NFC.

- **Lectura** (`nfcRead`): escanea continuamente con `NDEFReader`. Si encuentra un registro URL con `?c=NNN`, navega a esa canción.
- **Escritura** (`nfcWrite`): escribe la URL completa de la canción activa en una etiqueta NDEF tipo `url`.
- Ambas operaciones usan `AbortController` para cancelar desde el botón X o tocando el overlay.

---

## Retroalimentación no visual

| Mecanismo | Cuándo |
|---|---|
| **Sonido** `click.mp3` | Navegación entre páginas y líneas |
| **Sonido** `enter.mp3` | Abrir canción |
| **Sonido** `back.mp3` | Volver al menú |
| **Vibración** corta `[30]` | Navegación |
| **Vibración** doble `[60,30,60]` | Entrar a canción |
| **Vibración** larga `[60,40,60,40,120]` | Fin de canción |
| **Vibración** error `[100,50,100,50,100]` | Límite alcanzado, voz no reconocida |
| **`ariaAnn`** | Cambio de página, fin de canción, volver al menú |
| **Toast** | Errores NFC, voz no disponible |

---

## Service Worker y caché

El SW (`sw.js`) gestiona el caché offline. Cuando descarga o actualiza canciones, envía mensajes `PRECACHE_PROGRESS` / `PRECACHE_DONE` / `UPDATE_PROGRESS` / `UPDATE_DONE` que la app muestra en una barra de progreso (`#precache-bar`). Al reconectar online, la app pide al SW que compruebe actualizaciones.

---

## URL directa

```
accessible.html?c=042
```

Al cargar, `init()` lee el parámetro `c`, lo convierte a número y llama a `navigateToSong()` directamente, saltándose el menú. Útil para etiquetas NFC y accesos directos externos.

---

## Decisiones de diseño a mantener

- **Solo botones** para elementos navegables. No usar `div`/`p` con `tabindex` — provoca anuncios de formato en TalkBack.
- **Sin `role` personalizado** en los elementos de letra. `role="text"`, `role="region"` y similares causan que TalkBack describa los estilos CSS del contenedor.
- **`ariaAnn` con retardo de 40 ms** para que el cambio de `textContent` dispare el `aria-live` correctamente (si se hace sin retardo, algunos lectores ignoran el cambio).
- **`--focus` CSS variable** definida en `:root` pero sin usar — los `:focus` de todos los elementos tienen `outline: none` para que TalkBack/VoiceOver sean los únicos proveedores de highlight visual.
