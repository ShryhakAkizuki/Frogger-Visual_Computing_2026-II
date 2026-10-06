// LANES se construye al cargar game.js, antes de que existan las imágenes: por eso filas y
// entidades guardan el nombre del sprite y lo buscan en SPRITES al dibujar.
const SPRITE_NAMES = [
  'frog_up', 'frog_up_jump', 'frog_down', 'frog_down_jump',
  'frog_left', 'frog_left_jump', 'frog_right', 'frog_right_jump',
  'death_road_1', 'death_road_2', 'death_road_3',
  'death_water_1', 'death_water_2', 'death_water_3', 'death_skull',
  'car_pink', 'car_white', 'car_yellow', 'bulldozer', 'truck',
  'log_left', 'log_middle', 'log_right',
  'turtle_1', 'turtle_2', 'turtle_3', 'turtle_dive_1', 'turtle_dive_2',
  'home_bush', 'home_bush_edge', 'home_frog', 'home_fly',
  'sidewalk', 'life',
  'font', 'title_logo',
]

const SPRITES = {}

// Se llama desde preload() para que setup() arranque con todas las imágenes cargadas.
function loadSprites() {
  for (const name of SPRITE_NAMES)
    SPRITES[name] = loadImage(`../images/${name}.png`)
}

// Redondea la posición: las velocidades son fraccionarias y el pixel art se deforma entre píxeles.
function drawSprite(name, x, y, w, h) {
  const img = SPRITES[name]
  image(img, Math.round(x), Math.round(y), w ?? img.width, h ?? img.height)
}

// font.png sale de FroggerAssets.png: una fila de glifos de 8×8 por color, en el orden de
// FONT_CHARS. No tiene minúsculas, tildes ni Ñ.
const FONT_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-©'
const FONT_SIZE = 8
const FONT_COLORS = { WHITE: 0, YELLOW: 1, RED: 2, MAGENTA: 3, CYAN: 4 }

// NFD separa la tilde de su letra (Ñ → N + ~) y el resto se descarta: así los nombres en
// español se escriben con los glifos del arcade. Un carácter sin glifo deja un hueco.
function drawText(str, x, y, color) {
  const chars = str.toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  for (let i = 0; i < chars.length; i++) {
    const glyph = FONT_CHARS.indexOf(chars[i])
    if (glyph >= 0)
      image(SPRITES.font, Math.round(x) + i * FONT_SIZE, Math.round(y), FONT_SIZE, FONT_SIZE,
        glyph * FONT_SIZE, color * FONT_SIZE, FONT_SIZE, FONT_SIZE)
  }
}

function drawTextCentered(str, y, color) {
  drawText(str, (CANVAS_W - str.length * FONT_SIZE) / 2, y, color)
}
