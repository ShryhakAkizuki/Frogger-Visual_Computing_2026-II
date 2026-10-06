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
  'home_bush', 'home_bush_edge', 'home_frog',
  'sidewalk', 'life',
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
