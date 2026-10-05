// Dimensiones: una celda mide lo mismo que un sprite (16 px), y el canvas, lo mismo que el
// arte original (224×256): 2 filas de HUD arriba, 13 de tablero y 1 de HUD abajo.
const CELL = 16
const COLS = 14
const ROWS = 13
const BOARD_W = COLS * CELL
const BOARD_H = ROWS * CELL
const HUD_TOP = 2 * CELL
const HUD_BOTTOM = CELL
const CANVAS_W = BOARD_W
const CANVAS_H = HUD_TOP + BOARD_H + HUD_BOTTOM

// Como en el arcade, la rejilla de la rana (13 columnas) va desplazada media celda: queda
// centrada en las 14 columnas del tablero y cae justo sobre las metas.
const FROG_X_OFFSET = CELL / 2
const START_COL = 6

//Frames per Second
const FPS = 60

// Animaciones (frames)
const JUMP_FRAMES = 6
const DEATH_FRAME_TIME = 10
const DEATH_WAIT_FRAMES = 60
const TURTLE_FRAME_TIME = 15

// Colores tomados de Frogger_game.png
const COLORS = {
  WATER: '#000047',
  ROAD: '#000000',
  TEXT: '#C3C3D9',
  SCORE: '#E00000',
  TIME_BAR: '#1DC300',
  TIME_LABEL: '#DFDF00',
}

// Reglas
const START_LIVES = 3
const START_ROW = ROWS - 1
const TIME_PER_LIFE = 30
const EXTRA_LIFE_SCORE = 1000

// Puntuación:
const ROW_POINT = 10
const HOLE_POINTS = 50
const HOLE_TIME_BONUS_PER_SECOND = 10
const WIN_POINTS = 1000
