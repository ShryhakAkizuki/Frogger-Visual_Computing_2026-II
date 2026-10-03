// Jugador. Posición en píxeles (esquina superior izquierda); salta CELL píxeles por tecla.
class Frog {
  constructor(position, size) {
    this.position = position
    this.size = size
    this.alive = true
    this.ridingLog = null   // tronco sobre el que va; lo fija Game.checkCollisions() con Lane.rideFor()
  }

  // Salto de `direction` celdas ({ x, y } con -1, 0 o 1); se ignora si saldría del
  // tablero o la rana está muerta
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

  // Arrastre por el tronco: suma directamente su velocidad (sin pasar por move(), que se
  // bloquea en los bordes). Si el tronco la saca del tablero, Game.checkCollisions() la mata.
  update() {
    if (this.ridingLog != null)
      this.position.add(p5.Vector.mult(this.ridingLog.direction, this.ridingLog.speed))
  }

  centerX() {
    return this.position.x + this.size / 2
  }

  // 0 = HOME
  row() {
    return floor((this.position.y + this.size / 2) / CELL)
  }

  // Caja de colisión reducida `margin` píxeles por lado, para que rozar un carro
  // con el borde no cuente como choque
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

// Colisión entre cajas alineadas a los ejes (AABB). `a` y `b` son cajas { x, y, w, h },
// p. ej. frog.hitbox() y entity.bounds().
function rectsOverlap(a, b) {
  return a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
}
