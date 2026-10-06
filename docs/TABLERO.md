# Frogger - Tablero

14 columnas × 13 filas, `CELL = 16px` (un sprite) → tablero de 224×208. El canvas mide 224×256, como el arte original: `HUD_TOP` (2 filas) arriba y `HUD_BOTTOM` (1 fila) abajo. `frogger.js` lo amplía por CSS con el mayor factor entero que cabe en la ventana (`image-rendering: pixelated`).

`Game.draw()` dibuja el tablero dentro de `translate(0, HUD_TOP)`. Así **toda la lógica usa coordenadas del tablero** (`y = 0` es la fila `HOME`), y solo el HUD usa coordenadas del canvas. El arbusto de la meta mide 24 px y sobresale 8 px por encima de la fila 0.

La rana se mueve en una rejilla de 13 columnas desplazada media celda (`FROG_X_OFFSET = 8`), como en el arcade: así queda centrada y cae justo sobre las metas.

## Tabla de filas

| Fila | Tipo | Clase | Contenido |
|---|---|---|---|
| 0 | `HOME` | `HomeLane` | 5 metas (columnas 0, 3, 6, 9, 12 de la rana → x = 8, 56, 104, 152, 200) |
| 1–5 | `RIVER` | `RiverLane` | Troncos (`Log`) y tortugas (`Turtle`) |
| 6 | `SAFE` | `SafeLane` | Mediana |
| 7–11 | `ROAD` | `RoadLane` | Camiones, carros y bulldozers |
| 12 | `SAFE` | `SafeLane` | Inicio (rana en columna 6) |

## Filas en movimiento

Cada fila se define en la constante `LANES` (`game.js`) como `new RiverLane(direction, speed, loopCells, pattern, Platform = Log)` o `new RoadLane(direction, speed, loopCells, pattern, sprite)`:

| Parámetro | Significado |
|---|---|
| `direction` | −1 (←) o +1 (→). Común a toda la fila. |
| `speed` | Píxeles por frame. Común a toda la fila. |
| `loopCells` | Longitud de la **pista circular** de la fila, en celdas. Las celdas 0–13 son visibles; el resto queda fuera de pantalla. |
| `pattern` | `[{ x, w }]`: posición inicial y ancho de cada entidad, en celdas sobre la pista (`x ≥ 14` empieza fuera de pantalla). En el río, una entrada puede llevar su propio `Platform` (p. ej. `{ x: 4, w: 2, Platform: DivingTurtle }`). |
| `Platform` | Solo río: clase de lo que flota (`Log` o `Turtle`). |
| `sprite` | Solo carretera: nombre del sprite de los vehículos (`truck` mide 2 celdas). |

Cuando una entidad sale por un lado, recorre el tramo oculto de la pista antes de volver a entrar por el otro. Ese recorrido produce el retraso de reaparición del juego original. Las entidades se crean una vez por partida y nunca se borran.

`Lane.validatePattern()` hace fallar el juego al arrancar, con un mensaje que indica la fila, si:

- `loopCells < 14 + w` de la entidad más ancha, porque esa entidad aparecería de golpe dentro del tablero;
- dos entidades se solapan, también a través del *wrap*.

Valores actuales (la disposición copia la del arcade; las velocidades se ajustaron jugando):

| Fila | Tipo | Dir. | `speed` | `loopCells` | `pattern` (`x`/`w`) | Sprite |
|---|---|---|---|---|---|---|
| 1 | `RIVER` | → | 0.35 | 18 | 0/4 · 6/4 · 12/4 | `Log` |
| 2 | `RIVER` | ← | 0.45 | 17 | 0/2 · 4/2* · 9/2 · 13/2 | `Turtle` (*`DivingTurtle`) |
| 3 | `RIVER` | → | 0.6 | 20 | 0/6 · 9/6 | `Log` |
| 4 | `RIVER` | → | 0.4 | 17 | 0/3 · 5/3 · 10/3 | `Log` |
| 5 | `RIVER` | ← | 0.35 | 17 | 0/3 · 5/3 · 10/3* | `Turtle` (*`DivingTurtle`) |
| 7 | `ROAD` | ← | 0.45 | 16 | 0/2 · 7/2 | `truck` |
| 8 | `ROAD` | → | 0.9 | 16 | 3/1 | `car_white` |
| 9 | `ROAD` | ← | 0.6 | 15 | 0/1 · 5/1 · 9/1 | `car_pink` |
| 10 | `ROAD` | → | 0.45 | 15 | 0/1 · 4/1 · 8/1 | `bulldozer` |
| 11 | `ROAD` | ← | 0.5 | 15 | 0/1 · 4/1 · 8/1 | `car_yellow` |

Los sprites ya miran en la dirección de su fila; no se voltean.

---

Ver también:
- [REGLAS.md](REGLAS.md) (reglas que cada clase aplica)
- [DISEÑO.md](DISEÑO.md) (por qué se hizo así)
- [ARQUITECTURA.md](ARQUITECTURA.md) (cómo se materializan estas decisiones en el código)