const CELL = 55
const COLS = 13
const ROWS = 13
const BOARD = COLS * CELL

let frog
let logxdd
let car

function setup() {
  frameRate(1)
  createCanvas(BOARD, BOARD)

  let position = createVector(CELL * 3,CELL * 3)
  let car_position = createVector(CELL * 10,CELL * 5)
  let frog_position = createVector(CELL * 1,CELL * 5)
  frog = new Frog(frog_position.copy(), CELL)
  logxdd = new Log(position.copy(), CELL *3 , CELL, CELL, createVector(1, 0))
  frog.ridingLog = logxdd

  car = new Vehicle(car_position.copy(), CELL * 3, CELL, CELL * 3, createVector(-1, 0), '#FF0000')

  // TODO
}

function draw() {
  background(0)

  if (frog.alive == true) {
    logxdd.update()
    car.update()
    frog.update()
  }


  if (!rectsOverlap(frog, logxdd))
    frog.ridingLog = null
  else
    frog.ridingLog = logxdd

  if (rectsOverlap(frog, car))
    frog.alive = false
  


  
  logxdd.draw()
  frog.draw()
  car.draw()


  // TODO
}

// function keyPressed() {
//   // TODO
// }



