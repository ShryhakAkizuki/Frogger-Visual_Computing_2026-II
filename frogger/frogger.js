// BOOTSTRAP de p5.js: conecta p5 con Game. Ninguna regla del juego va aquí.
// Es el único punto del proyecto que conoce los globals de p5 (key, keyCode,
// UP_ARROW...): traduce cada tecla a un INPUT neutro (definido en game.js) y se lo
// pasa a Game.

let game

function setup() {
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

// Traduce los key/keyCode que p5 deja globales al pulsar una tecla a un INPUT neutro.
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
