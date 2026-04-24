# Cancionero SJJ — Interfaz Accesible (`accessible.html`)

Esta es la versión accesible del Cancionero SJJ, diseñada específicamente para personas ciegas o con baja visión. Funciona con lectores de pantalla, mandos GamePad y control táctil.

## Diferencias con la app principal

| Característica | App principal (`index.html`) | Interfaz accesible (`accessible.html`) |
|---|---|---|
| Navegación | Por categorías + lista | Cuadrícula numérica directa |
| Búsqueda | Por voz | Por voz |
| Tema visual | Oscuro / neón | Oscuro / neón (alta legibilidad) |
| Tipografía | Monoespaciada | Monoespaciada |
| Botones fijos | No | Sí (flotantes, siempre visibles) |
| Lectores de pantalla | Parcial | Optimizado (ARIA completo) |

## Diseño

- **Fondo**: negro puro (`#000`)
- **Texto principal**: verde neón (`#00ff66`)
- **Tipografía**: `Courier New`, monoespaciada
- **Botones**: tipo neón con borde de color, sin relleno
- **Contraste**: alto, pensado para baja visión

## Accesibilidad

- Región `aria-live="polite"` anuncia cambios de página y navegación sin interrumpir
- Todos los botones tienen `aria-label` descriptivo
- Las celdas de canciones tienen `aria-label` con número y título completo
- La vista de canción usa `role="region"` con etiqueta visible
- Las líneas de la letra son `tabindex="0"` y navegables con teclado
- Los overlays (NFC, voz) tienen `role="dialog"`

## Controles táctiles

### Vista de menú (cuadrícula)

| Botón | Acción |
|---|---|
| **Buscar** (verde, arriba) | Activar búsqueda por voz |
| **Anterior / Siguiente** (azul, abajo) | Cambiar página de canciones |
| Tocar una celda numerada | Abrir esa canción |

### Vista de canción

| Botón | Acción |
|---|---|
| **Regresar** (rosa, arriba izquierda) | Volver al menú |
| **Buscar** (verde, arriba derecha) | Buscar canción por voz |
| **Guardar NFC** (rosa, arriba derecha) | Guardar en etiqueta NFC |
| **Subir / Bajar** (naranja, lateral derecho) | Navegar línea a línea |

## Controles de mando GamePad

### Vista de menú

| Botón | Acción |
|---|---|
| **A** | Abrir la canción seleccionada |
| **Y** | Buscar canción por voz |
| **LB / L1** | Página anterior |
| **RB / R1** | Página siguiente |
| **D-pad** | Mover selección en la cuadrícula |

### Vista de canción

| Botón | Acción |
|---|---|
| **X** | Volver al menú |
| **Y** | Buscar canción por voz |
| **LB / L1** | Línea anterior |
| **RB / R1** | Línea siguiente |
| **D-pad Arriba/Abajo** | Línea anterior / siguiente |
| **SELECT** | Guardar en etiqueta NFC |

> Mientras NFC o búsqueda por voz están activos, **X** cancela la operación.

## Cuadrícula de canciones

- Muestra todas las canciones (1–163) paginadas
- El número de columnas y filas se adapta automáticamente al tamaño de la pantalla
- Cada celda muestra el número de la canción
- Al recibir foco, el lector de pantalla anuncia número y título

## Búsqueda por voz

1. Pulse **Buscar** o el botón **Y** del mando
2. Cuando vea el indicador "Escuchando…", diga:
   - El **número** de la canción: "cuarenta y dos" o "42"
   - El **título** o parte de él: "las cualidades de Jehová"
3. La app navega directamente a la canción

## Etiquetas NFC

- **Guardar**: en la vista de canción, pulse **Guardar NFC** y acerque una etiqueta escribible
- **Abrir**: acerque una etiqueta guardada con la app abierta
- Solo disponible en Android con Chrome

## Acceso directo por URL

```
accessible.html?c=042
```

Reemplaza `042` con el número de la canción (3 dígitos con ceros a la izquierda).

## Retroalimentación

- **Sonidos** (earcons): clic al navegar, entrada al abrir canción, retroceso al volver
- **Vibración**: distintos patrones para navegación, error, entrada, fin de canción y NFC
- **Anuncios ARIA**: cambios de página y fin de canción anunciados al lector de pantalla

## Requisitos

| Elemento | Requisito |
|---|---|
| Navegador | Chrome / Edge / Chromium |
| Mando (opcional) | Compatible con Gamepad API |
| Voz (opcional) | Micrófono + permisos |
| NFC (opcional) | Android con NFC y Chrome |
