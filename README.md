# Frogger - Visual Computing 2026-II

Recreación del juego [Frogger](https://en.wikipedia.org/wiki/Frogger) en el navegador, con JavaScript y la libreria p5.js. Proyecto forma parte del de curso Computación Visual (2026-II).

## Cómo jugar

| Tecla | Acción |
|---|---|
| Flechas / `W` `A` `S` `D` | Mover la rana (y el cursor del menú) |
| `Enter` | Elegir una opción |


## Ejecutar en local

No hay dependencias ni paso de compilación: p5.js ya está en `frogger/libraries/`. Solo hay que servir la carpeta del repositorio con cualquier servidor estático (abrir `index.html` con `file://` no sirve, porque el navegador bloquea la carga de sprites y sonidos):

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```

## Jugar en linea

TODO: 

## Estructura

```
frogger/    código del juego (index.html y los scripts)
images/     sprites
music/      música y efectos de sonido
docs/       documentación
```

Los scripts de `frogger/` estan organizados de la siguiente forma:

| Archivo | Qué contiene |
|---|---|
| `constants.js` | Medidas, tiempos, colores y puntos |
| `sprites.js`, `audio.js`, `storage.js` | Imágenes y texto, sonido y guardado del record |
| `entities.js` | Carros, troncos y tortugas |
| `frog.js` | La rana |
| `lanes.js` | Las filas del tablero y sus reglas |
| `menu.js` | Pantalla de título y créditos |
| `game.js` | La partida: estados, puntos, vidas y colisiones |
| `frogger.js` | Conexión con p5.js y teclado |

## Documentación

[docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) explica cómo está organizado el proyecto: tablero y filas, clases, diagramas (Mermaid), reglas del juego, entrada y decisiones de diseño.

## Estado

El juego implementa el primer nivel del juego. Queda faltando las entidades de los siguientes niveles. Por ejemplo; la rana hembra, los cocodrilos, la serpiente y la nutria.

## Créditos

- Oscar Leonardo Riveros Perez
- Camilo Ferney Londoño Moreno
- Omar Nicolás Guerrero Guerrero

