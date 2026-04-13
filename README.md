# Cancionero SJJ

Cancionero digital con lectura de letras diseñado para personas ciegas o con discapacidad visual. Se maneja íntegramente con un mando GamePad, sin necesidad de tocar la pantalla.

## Características

- **163 canciones** organizadas en 16 categorías temáticas
- **Lectura automática por voz** (Text-to-Speech en español latinoamericano)
- **Navegación total por mando** GamePad
- **Búsqueda por voz**: diga el número o el título de la canción
- **Etiquetas NFC**: guarde y abra canciones acercando una etiqueta
- **Retroalimentación háptica**: vibración al navegar y al llegar al final
- **Sonidos de guía** (earcons): clic, entrada y retroceso
- **Compatible con lectores de pantalla** (región ARIA live)
- **Funciona sin conexión** (PWA instalable)

## Requisitos

| Elemento | Requisito |
|---|---|
| Navegador | Chrome / Edge / Chromium (se recomienda la versión más reciente) |
| Mando | Cualquier mando compatible con la Gamepad API (Xbox, PlayStation, genérico USB/BT) |
| Voz (opcional) | Micrófono + permisos de reconocimiento de voz |
| NFC (opcional) | Dispositivo Android con NFC y Chrome |

> La app **no funciona correctamente en Safari** porque ese navegador no implementa la Gamepad API ni el reconocimiento de voz de forma completa.

## Instalación como app (PWA)

1. Abra la aplicación en Chrome o Edge.
2. Haga clic en el icono de instalación que aparece en la barra de direcciones (o en el menú → "Instalar aplicación").
3. Acepte la instalación. La app quedará disponible sin conexión.

## Controles del mando

La asignación sigue el **estándar de la Gamepad API** (botones en orden: A, B, X, Y, LB, RB, …).

### Pantalla de menú

| Botón | Acción |
|---|---|
| **LB / L1** | Categoría anterior |
| **RB / R1** | Categoría siguiente |
| **D-pad Arriba** | Canción anterior en la lista |
| **D-pad Abajo** | Canción siguiente en la lista |
| **A** | Abrir la canción seleccionada |
| **Y** | Buscar canción por voz |

### Pantalla de canción

| Botón | Acción |
|---|---|
| **LB / L1** | Línea anterior |
| **RB / R1** | Línea siguiente |
| **X** | Volver al menú |
| **Y** | Guardar la canción en una etiqueta NFC |

> Mientras la lectura por voz o la escritura NFC están activas, el botón **X** las cancela.

## Cómo funciona la lectura

Al abrir una canción, la aplicación:
1. Anuncia el número y el título de la canción.
2. Lee automáticamente la primera línea.
3. Muestra la línea actual resaltada en el centro, con la línea anterior y la siguiente en tono apagado.

Navegue línea a línea con **LB / RB**. Al llegar a la última línea y avanzar, se anuncia "Fin de la canción".

## Búsqueda por voz

1. Pulse **Y** en el menú.
2. Cuando escuche el tono y vea el icono del micrófono, diga:
   - El **número** de la canción (ej.: "cuarenta y dos" o "42")
   - El **título** o parte de él (ej.: "las cualidades de Jehová")
3. La app navega directamente a la canción encontrada.

## Etiquetas NFC

### Guardar una canción en una etiqueta

1. Abra la canción que desea guardar.
2. Pulse **Y**.
3. Acerque una etiqueta NFC escribible al dispositivo.
4. Escuchará la confirmación cuando la escritura sea correcta.

### Abrir una canción desde una etiqueta

- Acerque la etiqueta al dispositivo mientras la aplicación está abierta. La canción se abrirá automáticamente.

> NFC solo está disponible en Android con Chrome. En otros sistemas el botón Y no tendrá efecto en la vista de canción.

## Acceso directo por URL

Puede abrir cualquier canción directamente añadiendo el parámetro `?c=NNN` a la URL:

```
index.html?c=042
```

Esto es útil para crear marcadores o enlaces en sistemas externos.

## Categorías de canciones

| # | Categoría | Canciones |
|---|---|---|
| 1 | Jehová | 1–12 |
| 2 | Jesús y el rescate | 13–20 |
| 3 | El Reino | 21–24 |
| 4 | Los ungidos y las otras ovejas | 25–27 |
| 5 | Nuestra amistad con Jehová | 28–40 |
| 6 | La oración | 41–47 |
| 7 | La dedicación | 48–52 |
| 8 | La predicación | 53–84 |
| 9 | Las reuniones | 85–93 |
| 10 | La Biblia | 94–98 |
| 11 | Nuestros hermanos | 99–103 |
| 12 | Cualidades cristianas | 104–130 |
| 13 | La familia y los amigos | 131–138 |
| 14 | Nuestra esperanza | 139–147 |
| 15 | La salvación y la resurrección | 148–151 |
| 16 | Canciones originales | 152–163 |

## Estructura de archivos

```
sjj_desc/
├── index.html          # Aplicación principal
├── manifest.json       # Manifiesto PWA
├── sw.js               # Service Worker (modo offline)
├── process_songs.py    # Script para generar los archivos de datos
├── data/
│   ├── categories.json # Lista de categorías
│   ├── songs.json      # Índice de canciones (número + título)
│   └── 001.txt … 163.txt  # Letras de cada canción
├── sounds/
│   ├── click.mp3       # Sonido de navegación
│   ├── enter.mp3       # Sonido al abrir canción
│   └── back.mp3        # Sonido al volver al menú
└── icon/               # Iconos de la app (PWA)
```

## Agregar o editar canciones

Cada archivo `data/NNN.txt` contiene la letra de la canción. El formato es:

```
CANCIÓN N. Título de la canción. Referencia bíblica
Línea 1 de la letra
Línea 2 de la letra
…
```

La primera línea (cabecera) se omite en la lectura; solo se usan las líneas de la letra. Después de editar los archivos `.txt`, regenere `songs.json` ejecutando:

```bash
python process_songs.py
```
