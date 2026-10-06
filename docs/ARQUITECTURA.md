`# Frogger — Arquitectura

> Guía para el equipo de desarrollo · Proyecto de curso: Visual Computing (2026-II).
> Stack: JavaScript (ES6+) + p5.js (local, sin CDN) · Despliegue: GitHub Pages.

## 1. Objetivo

Recrear el primer nivel de Frogger. La rana se mueve sobre un tablero de 14 columnas × 13 filas de 16 px (el tamaño de los sprites de `images/`): cruza la carretera esquivando carros y el río saltando sobre troncos y tortugas, hasta llenar las 5 metas. La referencia visual es `Frogger_game.png`.

## 2. Estado del proyecto

### ✅ Funciona

- Tablero de 13 filas con HUD arriba (`1-UP` y `HI-SCORE` de la sesión) y abajo (vidas, barra de tiempo), con avisos para `READY` / `WON` / `GAME_OVER` sobre la mediana.
- Todo se dibuja con los sprites de `images/` a su tamaño real (canvas de 224×256, ampliado por CSS con un factor entero).
- Salto animado (sprite de salto según la dirección) y animación de muerte en carretera / agua / tiempo, seguida de la calavera y una espera antes de reaparecer (estado `DYING`).
- Rana con saltos de una celda (flechas o WASD), que no puede salir del tablero por sus propios medios.
- Carros y troncos con velocidad y dirección por fila, anchos distintos y reaparición con retraso (pista circular).
- Patrón inicial de cada fila definido a mano y validado al arrancar.
- Reglas completas:
  - carros que matan;
  - río que hunde;
  - troncos que transportan;
  - tortugas que se hunden (una pareja en la fila 2 y un trío en la fila 5) y ahogan a la rana si está encima cuando quedan bajo el agua;
  - muerte al ser arrastrada fuera del tablero;
  - agujeros libres, ocupados y paredes de la meta.
- `frameRate(FPS)` fijo en `setup()`: las velocidades son píxeles por frame y p5 por defecto corre a la frecuencia del monitor.
- Tiempo por vida de 30 s contado en frames (exacto a `FPS`); al agotarse la rana muere. Se muestra en la barra inferior del HUD.
- Vidas, score del original (10 por cada fila nueva alcanzada, 50 por agujero + bonus de 10 por segundo restante, 1000 por llenar las 5) y estados `READY` → `PLAYING` → `WON` / `GAME_OVER`, con `R` para reiniciar.
- Vida extra a los 1 000 puntos, una sola vez por partida.

### ⏳ Falta para completar el primer nivel

En orden sugerido; los primeros son lógica pura y no dependen del aspecto visual.

| # | Tarea | Notas |
|---|---|---|
| 1 | Afinar velocidades | La disposición de `LANES` copia `Frogger_game.png`; las velocidades son estimadas. |

**Opcional / por decidir:**

- Peligros y bonus del original: serpiente, cocodrilos, mosca en un agujero, rana hembra.
- Pasar al siguiente nivel al llenar los agujeros. Hoy `WON` termina la partida.
- Sonido, pausa y récord persistente.

## 3. Tablero

14 columnas × 13 filas, `CELL = 16px` (un sprite) → tablero de 224×208. El canvas mide 224×256, como `Frogger_game.png`: `HUD_TOP` (2 filas) arriba y `HUD_BOTTOM` (1 fila) abajo. `frogger.js` lo amplía por CSS con el mayor factor entero que cabe en la ventana (`image-rendering: pixelated`).

`Game.draw()` dibuja el tablero dentro de `translate(0, HUD_TOP)`. Así **toda la lógica usa coordenadas del tablero** (`y = 0` es la fila `HOME`), y solo el HUD usa coordenadas del canvas. El arbusto de la meta mide 24 px y sobresale 8 px por encima de la fila 0.

La rana se mueve en una rejilla de 13 columnas desplazada media celda (`FROG_X_OFFSET = 8`), como en el arcade: así queda centrada y cae justo sobre las metas.

| Fila | Tipo | Clase | Contenido |
|---|---|---|---|
| 0 | `HOME` | `HomeLane` | 5 metas (columnas 0, 3, 6, 9, 12 de la rana → x = 8, 56, 104, 152, 200) |
| 1–5 | `RIVER` | `RiverLane` | Troncos (`Log`) y tortugas (`Turtle`) |
| 6 | `SAFE` | `SafeLane` | Mediana |
| 7–11 | `ROAD` | `RoadLane` | Camiones, carros y bulldozers |
| 12 | `SAFE` | `SafeLane` | Inicio (rana en columna 6) |

### 3.1 Filas en movimiento

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

Valores actuales (disposición de `Frogger_game.png`; velocidades estimadas, ver tarea 1):

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

## 4. Archivos y componentes

Sin bundler (compatible con GitHub Pages). Los scripts se cargan en este orden en [`frogger/index.html`](../frogger/index.html), y el orden es obligatorio:

`p5.min.js` → `constants.js` → `sprites.js` → `entities.js` → `frog.js` → `lanes.js` → `game.js` → `frogger.js`

```
frogger/
├── index.html        # carga los scripts en el orden anterior
├── constants.js      # constantes compartidas: dimensiones, FPS, animaciones, colores, reglas y puntuación
├── sprites.js        # SPRITES, loadSprites(), drawSprite()
├── entities.js       # MovingEntity (base), Vehicle, Log, Turtle, DivingTurtle
├── frog.js           # Frog, FROG_DEATH, rectsOverlap()
├── lanes.js          # Lane (interfaz base), SafeLane, HomeLane, RoadLane, RiverLane,
│                     #   FROG_RESULT
├── game.js           # Game, LANES (definición de las 13 filas), GAME_STATES, INPUT
├── frogger.js        # bootstrap de p5: preload(), setup(), draw(), keyPressed(), escala del canvas. Sin lógica.
└── libraries/p5.min.js
```

| Archivo | Responsabilidad |
|---|---|
| `constants.js` | Dimensiones (`CELL`, `COLS`, `ROWS`, `BOARD_W`, `BOARD_H`, `HUD_TOP`, `HUD_BOTTOM`, `FROG_X_OFFSET`), `FPS`, duración de animaciones, `COLORS` y reglas/puntuación de la partida. Sin lógica. |
| `sprites.js` | Carga las imágenes de `../images/` en `preload()` y las dibuja por nombre con la posición redondeada. |
| `entities.js` | Qué se mueve y cómo se pinta. No conoce las reglas. |
| `frog.js` | El jugador: salto, arrastre por tronco, caja de colisión, animaciones de salto y muerte. |
| `lanes.js` | Las reglas **de cada tipo de fila**: qué le pasa a la rana en carretera, río o meta. |
| `game.js` | El estado de la partida (vidas, score, estado), la máquina de estados de entrada y las reglas **comunes**. |
| `frogger.js` | Conecta p5.js con `Game`: carga sprites, escala el canvas y traduce cada tecla a un `INPUT` neutro. |

Las constantes de `constants.js` se cargan primero (tras `p5.min.js`), así que todos los scripts pueden usarlas al cargar y las filas se crean directamente al cargar `game.js` (constante `LANES`). Las imágenes aún no existen en ese momento: filas y entidades guardan el **nombre** del sprite y lo buscan en `SPRITES` al dibujar.

## 5. Diagramas

### 5.1 Clases

```mermaid
classDiagram
    direction LR

    class Game {
        +state
        +lives
        +score
        +highScore
        +frog: Frog
        +lanes: Lane[]
        +timeLeft: int
        +bestRow: int
        +extraLifeAwarded: bool
        +update()
        +draw()
        +updateDying()
        +checkCollisions()
        +killFrog(cause)
        +loseLife()
        +respawnFrog()
        +reset()
        +handleInput(input)
        +setState(next)
        +tickTimer()
        +awardRowPoints()
        +addScore(points)
        +timeBonus()
        +stateMessage()
    }

    class Lane {
        <<abstract>>
        +row
        +entities: MovingEntity[]
        +build(row)
        +update()
        +draw()
        +drawBackground()*
        +checkFrog(frog) FROG_RESULT
        +rideFor(frog) Log o null
        +deathCause() FROG_DEATH
        #buildPattern(loopCells, pattern, make)
        #validatePattern(loopCells, pattern)
    }
    class SafeLane
    class HomeLane {
        +holes: int[]
        +filled: bool[]
        +holeX(i)
        +holeAt(x)
        +allFilled()
    }
    class RoadLane {
        +direction
        +speed
        +loopCells
        +pattern
        +sprite
    }
    class RiverLane {
        +direction
        +speed
        +loopCells
        +pattern
        +Platform
    }

    class MovingEntity {
        +position: Vector
        +entity_width
        +entity_height
        +speed
        +direction: Vector
        +loopLength
        +age
        +update()
        +keepInBounds()
        +bounds()
        +draw()
    }
    class Vehicle {
        +sprite
    }
    class Log {
        +carries(frog)
    }
    class Turtle
    class DivingTurtle {
        +diveLevel()
        +isUnder()
        +carries(frog)
    }

    class Frog {
        +position: Vector
        +size
        +alive
        +ridingLog: Log
        +facing
        +jumpFrames
        +deathCause
        +deathFrames
        +move(direction)
        +update()
        +isJumping()
        +die(cause)
        +deathFinished()
        +centerX()
        +row()
        +hitbox(margin)
        +sprite()
    }

    Game *-- "13" Lane
    Game *-- "1" Frog
    Lane <|-- SafeLane
    Lane <|-- HomeLane
    Lane <|-- RoadLane
    Lane <|-- RiverLane
    Lane *-- "0..*" MovingEntity
    MovingEntity <|-- Vehicle
    MovingEntity <|-- Log
    Log <|-- Turtle
    Turtle <|-- DivingTurtle
    RoadLane ..> Vehicle : crea
    RiverLane ..> Log : crea (Log, Turtle o DivingTurtle)
    Frog --> "0..1" Log : ridingLog
```

- `Lane` es la interfaz que ve `Game`. Cada subclase **posee** sus entidades (`entities`), las crea en `build()` y decide qué le pasa a la rana en `checkFrog()`.
- `Game` no tiene listas de carros ni de troncos, y no pregunta de qué tipo es cada fila: recorre `lanes` y llama a los mismos métodos en todas.

### 5.2 Estados

```mermaid
stateDiagram-v2
    [*] --> READY
    READY --> PLAYING : cualquier tecla
    PLAYING --> PLAYING : llena un agujero
    PLAYING --> DYING : muere (carro, agua, arbusto, tiempo)
    DYING --> PLAYING : fin de la animación, quedan vidas
    DYING --> GAME_OVER : fin de la animación, lives == 0
    PLAYING --> WON : 5 agujeros llenos
    WON --> READY : R
    GAME_OVER --> READY : R
```

### 5.3 Un frame

```mermaid
sequenceDiagram
    participant P5 as p5 draw()
    participant G as Game
    participant L as Lane
    participant F as Frog

    P5->>G: update()
    Note over G: en DYING solo updateDying():<br/>lanes.update(), frog.update() y, al terminar la animación, loseLife()
    Note over G: resto, solo en PLAYING
    G->>G: tickTimer() (0 frames → killFrog(TIME))
    G->>G: awardRowPoints() (fila nueva → +ROW_POINT)
    G->>F: centerX() fuera del tablero? → killFrog(WATER)
    G->>L: lanes[frog.row()].rideFor(frog)
    Note over G: frog.ridingLog = resultado (único escritor)
    G->>L: lanes[frog.row()].checkFrog(frog)
    L-->>G: OK / DIE / HOME / WIN
    Note over G: DIE → killFrog(lane.deathCause())<br/>HOME → +HOLE_POINTS + timeBonus(), respawnFrog()<br/>WIN → +HOLE_POINTS + timeBonus() + WIN_POINTS, estado WON
    G->>L: update() en las 13 filas
    G->>F: update() (cuenta del salto, arrastre si ridingLog)

    P5->>G: draw()
    G->>L: draw() en las 13 filas (fondo + entidades)
    G->>F: draw() (salvo en WON)
    G->>G: drawHUD()
```

Las reglas se aplican **antes** de mover. `Game.checkCollisions()` fija `frog.ridingLog` consultando `Lane.rideFor()` (único escritor: las filas no mutan a la rana), y después la rana y su tronco se desplazan lo mismo en ese frame, así que siguen alineados. El orden `tickTimer()` → `awardRowPoints()` → `checkCollisions()` → `lanes.update()` → `frog.update()` es exigido: el timer y las filas de puntos se resuelven sobre la posición de la rana del frame anterior, y `frog.update()` lee el `ridingLog` que acaba de fijar `checkCollisions()`.

## 6. Reglas

| Dónde | Regla |
|---|---|
| `RoadLane.checkFrog` | La caja de la rana (`hitbox()`, 2 px más pequeña por lado) toca un carro → `DIE`. |
| `RiverLane.rideFor` | El centro de la rana está sobre un tronco → lo devuelve; si no, `null`. `Game` lo guarda en `frog.ridingLog` (único escritor) y el tronco la arrastra. |
| `RiverLane.checkFrog` | Hay tronco bajo la rana → `OK`; si no → `DIE`. |
| `DivingTurtle.carries` | Ciclo por `age`: `TURTLE_SURFACE_FRAMES` a flote, `TURTLE_DIVE_FRAMES` hundiéndose (`turtle_dive_1/2`), `TURTLE_UNDER_FRAMES` bajo el agua y otros `TURTLE_DIVE_FRAMES` saliendo. Solo bajo el agua deja de llevar a la rana, así que `RiverLane.checkFrog` devuelve `DIE` (ahogada). |
| `HomeLane.checkFrog` | El centro cae en una meta libre (rango de 16 px en x, `holeX(i)`) → el agujero queda lleno y devuelve `HOME`, o `WIN` si con ese se llena el último. Pared o agujero lleno → `DIE`. |
| `Lane.deathCause` | Animación de cada muerte: `WATER` en el río (también al salir del tablero arrastrada), `ROAD` en carretera y contra el arbusto de la meta, `TIME` (solo calavera) al agotarse el tiempo. |
| `Game.checkCollisions` | El centro de la rana sale del tablero (arrastrada por un tronco) → muere. |
| `Game.checkCollisions` | `HOME` → +`HOLE_POINTS` + bonus de tiempo y la rana reaparece. `WIN` → +`HOLE_POINTS` + bonus + `WIN_POINTS` y estado `WON` (la rana no reaparece). |
| `Game.tickTimer` | `timeLeft` baja 1 frame por frame; a 0 la rana muere. El reloj se para en `DYING`. Se reinicia a `TIME_PER_LIFE` en cada cruce. |
| `Game.awardRowPoints` | `ROW_POINT` por cada fila nueva alcanzada, una vez por cruce (`bestRow` se reinicia al reaparecer). |
| `Game.addScore` | Único punto donde sube el score; al llegar a `EXTRA_LIFE_SCORE` otorga una vida extra, una sola vez por partida. |
| `Game.killFrog` | Toda muerte pasa a `DYING`: la rana muestra 3 frames de `DEATH_FRAME_TIME` (según la causa) y la calavera durante `DEATH_WAIT_FRAMES`, mientras el tráfico sigue. |
| `Game.loseLife` | Al terminar la animación resta una vida; con 0 → `GAME_OVER`, si no la rana reaparece en columna 6, fila 12, y vuelve a `PLAYING`. |

## 7. Entrada

`keyPressed()` (en `frogger.js`) traduce `key`/`keyCode` — los únicos globals de p5 que toca el proyecto — a un `INPUT` neutro y llama a `game.handleInput(input)`, que es la **máquina de estados de entrada**: cada estado decide qué hacer con el comando, y `Game.setState()` es el único punto donde cambia el estado de la partida.

| `INPUT` | Origen (tecla) |
|---|---|
| `UP` / `DOWN` / `LEFT` / `RIGHT` | flechas / WASD |
| `RESTART` | `R` |
| `OTHER` | cualquier otra tecla |

| Estado | INPUT | Efecto |
|---|---|---|
| `READY` | cualquiera | Empieza la partida (no mueve la rana). |
| `PLAYING` | `UP` / `DOWN` / `LEFT` / `RIGHT` | Salto de una celda; se ignora mientras dura el salto anterior (`JUMP_FRAMES`). |
| `DYING` | cualquiera | Se ignora. |
| `WON` / `GAME_OVER` | `RESTART` | Partida nueva. |

## 8. Decisiones de diseño

| Tema | Decisión | Por qué |
|---|---|---|
| Coordenadas | Todo en píxeles del tablero con `p5.Vector`; la rana salta `CELL` px. | Rana y entidades comparten sistema; no hay conversión grid ↔ píxel al ir sobre un tronco. |
| Quién posee las entidades | Cada fila. | Polimorfismo: `Game` no necesita `instanceof` ni saber qué tipo de fila es. |
| Reaparición de entidades | Pista circular por fila con tramo oculto. | Mismo efecto que crear/borrar en el borde, pero sin listas que crecen y con un patrón determinista. |
| Patrones | A mano, en celdas, validados al arrancar. | Fácil de leer y de afinar jugando; un error de patrón se detecta enseguida. |
| Velocidad y ancho | Velocidad y dirección por fila, ancho por entidad. | Como en el original: troncos largos y cortos en la misma fila del río. |
| Colisión con carros | AABB con la caja de la rana reducida 2 px. | Rozar un carro con el borde no se siente como un choque. |
| Colisión con troncos y agujeros | Por el centro de la rana. | Tocar con una esquina no basta, y la rana puede llegar desalineada desde un tronco. |
| Arrastre | Suma directa a `position`, sin `move()`. | `move()` bloquea en los bordes y dejaría la rana desincronizada del tronco. |
| Timestep | Píxeles por frame, sin `deltaTime`, a `FPS` fijos (`frameRate(FPS)` en `setup()`). | Simple para el MVP; el timer por vida se cuenta en frames enteros, exacto a esa frecuencia. |
| Puntuación | `Game.addScore()` es el único punto donde sube el score; los valores de filas, agujeros y victoria viven en `constants.js`. | La vida extra se audita en un solo sitio y las reglas de puntos se ajustan en un solo archivo. |
| Quién decide la victoria | `HomeLane`: devuelve `WIN` al llenar el último agujero; `Game` solo reacciona a `FROG_RESULT`. | `Game` no conoce los agujeros, y el enum `OK / DIE / HOME / WIN` cierra el contrato: ninguna otra fila puede devolver un resultado que `Game` no sepa manejar. |
| Entrada | `frogger.js` traduce `key`/`keyCode` de p5 a un `INPUT` neutro; `Game.handleInput()` es la máquina de estados y `setState()` el único cambio de estado. `Frog.move()` recibe la dirección en celdas, sin p5. | El núcleo del juego no conoce los globals de p5, y las transiciones `READY` / `PLAYING` / `WON` / `GAME_OVER` se auditan en un solo sitio. |
| `ridingLog` | `Game.checkCollisions()` es el único escritor: pregunta `Lane.rideFor()` (consulta pura) y guarda el resultado; `Frog` solo lo lee. | Las filas no mutan a la rana y la corrección (arrastre) no depende del orden de las llamadas. |
| Constantes | `constants.js` se carga primero, tras `p5.min.js`. | Todos los scripts pueden usar `CELL` / `BOARD_W` / ... al cargar; no hay dependencia inversa con el último script. |
| Tamaño | `CELL` = tamaño del sprite (16 px) y canvas de 224×256; se amplía por CSS con un factor entero. | Los sprites se dibujan sin reescalar y el pixel art se ve nítido a cualquier tamaño de ventana. |
| Sprites | Se cargan en `preload()`; las filas guardan el nombre y `drawSprite()` redondea la posición. | `LANES` existe antes que las imágenes, y con velocidades fraccionarias el pixel art se deformaría entre píxeles. |
| Salto | La posición lógica cambia de golpe; el dibujo interpola durante `JUMP_FRAMES` y la entrada se bloquea. | Las reglas y colisiones no cambian; el salto es solo visual. |
| Muerte | Estado `DYING` con la vida descontada al final de la animación; `Lane.deathCause()` elige la animación. | La espera vive en la máquina de estados y `Game` sigue sin preguntar el tipo de fila. |
| Rejilla de la rana | Desplazada `CELL / 2` respecto a la del tablero. | Como en el arcade: 13 posiciones centradas en 14 columnas que caen exactas en las 5 metas del arte. |
