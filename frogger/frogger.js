// Bootstrap de p5.js: único punto del proyecto que conoce los globals de p5 (key,
// keyCode); traduce cada tecla a un INPUT neutro (game.js) para Game. Sin reglas del juego.

let game
let canvas

function preload() {
  loadSprites()
  loadSounds()
}

function setup() {
  frameRate(FPS)
  pixelDensity(1)
  canvas = createCanvas(CANVAS_W, CANVAS_H)
  noSmooth()
  fitCanvas()
  game = new Game()
}

function draw() {
  game.update()
  game.draw()
}

function windowResized() {
  fitCanvas()
}

// El canvas mide lo mismo que el arte (224×256); se amplía por CSS con un factor entero
// para que cada píxel del sprite siga siendo un cuadrado nítido.
function fitCanvas() {
  const scale = Math.max(1, Math.floor(Math.min(windowWidth / CANVAS_W, windowHeight / CANVAS_H)))
  canvas.style('width', `${CANVAS_W * scale}px`)
  canvas.style('height', `${CANVAS_H * scale}px`)
}

function keyPressed() {
  // La música del menú no puede sonar antes de la primera tecla (política de autoplay).
  resumeMusic()
  game.handleInput(inputFromKey(key, keyCode))
}

function inputFromKey(key, keyCode) {
  if (keyCode == UP_ARROW || key == "w" || key == "W")
    return INPUT.UP
  if (keyCode == DOWN_ARROW || key == "s" || key == "S")
    return INPUT.DOWN
  if (keyCode == LEFT_ARROW || key == "a" || key == "A")
    return INPUT.LEFT
  if (keyCode == RIGHT_ARROW || key == "d" || key == "D")
    return INPUT.RIGHT
  if (keyCode == ENTER)
    return INPUT.SELECT
  return INPUT.OTHER
}
