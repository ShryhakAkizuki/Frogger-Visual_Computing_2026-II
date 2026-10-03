// Constantes del tablero, compartidas por todo el juego. Se carga justo después de
// p5.min.js (ver frogger/index.html), así los demás scripts pueden usarlas en cuanto
// se cargan, sin depender del orden en que se cargan los scripts.

const CELL = 55
const COLS = 13
const ROWS = 13
const BOARD = COLS * CELL
const HUD_H = CELL   // alto de cada barra del HUD (una arriba y otra abajo del tablero)
