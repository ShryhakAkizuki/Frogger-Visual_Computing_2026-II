// Bootstrap de p5.js: único punto del proyecto que conoce los globals de p5 (key,
// keyCode); traduce cada tecla a un INPUT neutro (game.js) para Game. Sin reglas del juego.

let game

function setup() {
  frameRate(FPS)
  createCanvas(BOARD, BOARD + 2 * HUD_H)
  game = new Game()
}

function draw() {
  game.update()
  game.draw()
}

function keyPressed() {
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
  if (key == "r" || key == "R")
    return INPUT.RESTART
  return INPUT.OTHER
}
