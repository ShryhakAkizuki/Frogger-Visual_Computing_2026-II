const CELL = 55;
const COLS = 13;
const ROWS = 13;
const BOARD = COLS * CELL;

let frog;

function setup() {
  createCanvas(BOARD, BOARD);
  frog = new Frog();
  // TODO
}

function draw() {
  background(0);
  Frog.update();
  Frog.draw();
}

// let game;

// function setup() {
//   createCanvas(BOARD, BOARD);
//   game = new Game();
//   // TODO
// }

// function draw() {
//   background(0);
//   game.update();
//   game.draw();
// }

// function keyPressed() {
//   // TODO
// }



