class Frog {
  constructor(position, size) {
    this.position = position
    this.size = size
    this.alive = true
    this.ridingLog = null   // tronco sobre el que va; único escritor: Game.checkCollisions() (vía Lane.rideFor())
  }

  move(direction) {
    const next_x = this.position.x + direction.x * this.size
    const next_y = this.position.y + direction.y * this.size

    if (next_x > BOARD - this.size || next_x < 0 ||
      next_y > BOARD - this.size || next_y < 0)
      return

    if (this.alive != true)
      return

    this.position.x = next_x
    this.position.y = next_y
  }

  // Suma la velocidad del tronco directamente (move() se bloquea en los bordes); si sale
  // del tablero, checkCollisions() la mata.
  update() {
    if (this.ridingLog != null)
      this.position.add(p5.Vector.mult(this.ridingLog.direction, this.ridingLog.speed))
  }

  centerX() {
    return this.position.x + this.size / 2
  }

  row() {
    return floor((this.position.y + this.size / 2) / CELL)
  }

  // Caja reducida: rozar un carro con el borde no mata.
  hitbox(margin = 4) {
    return {
      x: this.position.x + margin,
      y: this.position.y + margin,
      w: this.size - 2 * margin,
      h: this.size - 2 * margin,
    }
  }

  draw() {
    push()
    noStroke()
    fill(255)
    rect(this.position.x, this.position.y, this.size, this.size)
    pop()
  }
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
}
