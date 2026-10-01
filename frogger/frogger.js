// BOOTSTRAP de p5.js: solo conecta p5 con Game. Ninguna regla del juego va aquí.

const CELL = 55
const COLS = 13
const ROWS = 13
const BOARD = COLS * CELL
const HUD_H = CELL   // alto de cada barra del HUD (una arriba y otra abajo del tablero)

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
  game.handleKey(key, keyCode)
}
