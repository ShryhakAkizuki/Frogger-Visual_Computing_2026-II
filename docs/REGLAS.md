# Frogger - Reglas y entrada

## 1. Reglas

| Dónde | Regla |
|---|---|
| `RoadLane.checkFrog` | La caja de la rana (`hitbox()`, 2 px más pequeña por lado) toca un carro → `DIE`. |
| `RiverLane.rideFor` | El centro de la rana está sobre un tronco → lo devuelve; si no, `null`. `Game` lo guarda en `frog.ridingLog` (único escritor) y el tronco la arrastra. |
| `RiverLane.checkFrog` | Hay tronco bajo la rana → `OK`; si no → `DIE`. |
| `DivingTurtle.carries` | Ciclo por `age`: `TURTLE_SURFACE_FRAMES` a flote, `TURTLE_DIVE_FRAMES` hundiéndose (`turtle_dive_1/2`), `TURTLE_UNDER_FRAMES` bajo el agua y otros `TURTLE_DIVE_FRAMES` saliendo. Solo bajo el agua deja de llevar a la rana, así que `RiverLane.checkFrog` devuelve `DIE` (ahogada). |
| `HomeLane.checkFrog` | El centro cae en una meta libre (rango de 16 px en x, `holeX(i)`) → el agujero queda lleno y devuelve `HOME`, o `WIN` si con ese se llena el último. Pared o agujero lleno → `DIE`. Si el agujero tenía la mosca, guarda `FLY_POINTS` de bonus. |
| `HomeLane.update` | Mosca: tras una espera aleatoria (`FLY_WAIT_*`) aparece en una meta libre al azar durante `FLY_STAY_FRAMES` y desaparece si nadie se la come. |
| `Lane.takeBonus` | `Game` lo llama al recibir `HOME`/`WIN` y suma los puntos extra (la mosca); en las demás filas es 0. |
| `Lane.deathCause` | Animación de cada muerte: `WATER` en el río (también al salir del tablero arrastrada), `ROAD` en carretera y contra el arbusto de la meta, `TIME` (solo calavera) al agotarse el tiempo. |
| `Game.checkCollisions` | El centro de la rana sale del tablero (arrastrada por un tronco) → muere. |
| `Game.checkCollisions` | `HOME` → +`HOLE_POINTS` + bonus de tiempo + `lane.takeBonus()` y la rana reaparece. `WIN` → +`HOLE_POINTS` + bonus + `WIN_POINTS` y estado `WON` (la rana no reaparece). |
| `Game.tickTimer` | `timeLeft` baja 1 frame por frame; al bajar de `TIME_WARNING_SECONDS` suena `TimeWarning` y la barra pasa a rojo; a 0 la rana muere. El reloj se para en `DYING`. Se reinicia a `TIME_PER_LIFE` en cada cruce. |
| `Game.awardRowPoints` | `ROW_POINT` por cada fila nueva alcanzada, una vez por cruce (`bestRow` se reinicia al reaparecer). |
| `Game.addScore` | Único punto donde sube el score; si supera el récord lo guarda (`saveHighScore()`) y al llegar a `EXTRA_LIFE_SCORE` otorga una vida extra, una sola vez por partida. |
| `Game.killFrog` | Toda muerte pasa a `DYING`: la rana muestra 3 frames de `DEATH_FRAME_TIME` (según la causa) y la calavera durante `DEATH_WAIT_FRAMES`, mientras el tráfico sigue. |
| `Game.loseLife` | Al terminar la animación resta una vida; con 0 → `GAME_OVER`, si no la rana reaparece en columna 6, fila 12, y vuelve a `PLAYING`. |

## 2. Entrada

`keyPressed()` (en `frogger.js`) traduce `key`/`keyCode` — los únicos globals de p5 que toca el proyecto — a un `INPUT` neutro y llama a `game.handleInput(input)`, que es la **máquina de estados de entrada**: cada estado decide qué hacer con el comando, y `Game.setState()` es el único punto donde cambia el estado de la partida.

| `INPUT` | Origen (tecla) |
|---|---|
| `UP` / `DOWN` / `LEFT` / `RIGHT` | flechas / WASD |
| `SELECT` | Enter |
| `OTHER` | cualquier otra tecla |

| Estado | INPUT | Efecto |
|---|---|---|
| `MENU` | `UP` / `DOWN` | Mueve el cursor (rana) por las opciones de la página, con vuelta al otro extremo. |
| `MENU` | `SELECT` | JUGAR → partida nueva en `PLAYING`; CREDITOS / VOLVER → cambia de página; DOCUMENTACION → abre el repositorio en otra pestaña. |
| `PLAYING` | `UP` / `DOWN` / `LEFT` / `RIGHT` | Salto de una celda; se ignora mientras dura el salto anterior (`JUMP_FRAMES`). |
| `DYING` | cualquiera | Se ignora. |
| `WON` / `GAME_OVER` | `SELECT` | Vuelve al menú sin esperar los 4 s. |

---

Ver también:
- [TABLERO.md](TABLERO.md) (definición y patrones de las filas)
- [DISEÑO.md](DISEÑO.md) (por qué se hizo así)
- [ARQUITECTURA.md](ARQUITECTURA.md) (cómo se materializan estas decisiones en el código)