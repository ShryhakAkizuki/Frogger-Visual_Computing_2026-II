# Frogger - Decisiones de diseño

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
| Timestep | Píxeles por frame, sin `deltaTime`, a `FPS` fijos (`frameRate(FPS)` en `setup()`). | Simple; el timer por vida se cuenta en frames enteros, exacto a esa frecuencia. |
| Puntuación | `Game.addScore()` es el único punto donde sube el score; los valores de filas, agujeros y victoria viven en `constants.js`. | La vida extra se audita en un solo sitio y las reglas de puntos se ajustan en un solo archivo. |
| Quién decide la victoria | `HomeLane`: devuelve `WIN` al llenar el último agujero; `Game` solo reacciona a `FROG_RESULT`. | `Game` no conoce los agujeros, y el enum `OK / DIE / HOME / WIN` cierra el contrato: ninguna otra fila puede devolver un resultado que `Game` no sepa manejar. |
| Entrada | `frogger.js` traduce `key`/`keyCode` de p5 a un `INPUT` neutro; `Game.handleInput()` es la máquina de estados y `setState()` el único cambio de estado. `Frog.move()` recibe la dirección en celdas, sin p5. | El núcleo del juego no conoce los globals de p5, y las transiciones `MENU` / `PLAYING` / `WON` / `GAME_OVER` se auditan en un solo sitio. |
| `ridingLog` | `Game.checkCollisions()` es el único escritor: pregunta `Lane.rideFor()` (consulta pura) y guarda el resultado; `Frog` solo lo lee. | Las filas no mutan a la rana y la corrección (arrastre) no depende del orden de las llamadas. |
| Constantes | `constants.js` se carga primero, tras `p5.min.js`. | Todos los scripts pueden usar `CELL` / `BOARD_W` / ... al cargar; no hay dependencia inversa con el último script. |
| Tamaño | `CELL` = tamaño del sprite (16 px) y canvas de 224×256; se amplía por CSS con un factor entero. | Los sprites se dibujan sin reescalar y el pixel art se ve nítido a cualquier tamaño de ventana. |
| Sprites | Se cargan en `preload()`; las filas guardan el nombre y `drawSprite()` redondea la posición. | `LANES` existe antes que las imágenes, y con velocidades fraccionarias el pixel art se deformaría entre píxeles. |
| Salto | La posición lógica cambia de golpe; el dibujo interpola durante `JUMP_FRAMES` y la entrada se bloquea. | Las reglas y colisiones no cambian; el salto es solo visual. |
| Muerte | Estado `DYING` con la vida descontada al final de la animación; `Lane.deathCause()` elige la animación. | La espera vive en la máquina de estados y `Game` sigue sin preguntar el tipo de fila. |
| Rejilla de la rana | Desplazada `CELL / 2` respecto a la del tablero. | Como en el arcade: 13 posiciones centradas en 14 columnas que caen exactas en las 5 metas del arte. |

---

Ver también:
- [TABLERO.md](TABLERO.md) (definición y patrones de las filas)
- [REGLAS.md](REGLAS.md) (reglas que cada clase aplica)
- [ARQUITECTURA.md](ARQUITECTURA.md) (cómo se materializan estas decisiones en el código)