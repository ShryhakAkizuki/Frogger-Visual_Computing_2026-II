// ENTIDADES: cosas que se mueven solas por el tablero (carros y troncos).
// No conocen las reglas del juego; eso vive en game.js.

// Base: se desplaza en línea recta y reaparece por el lado contrario al salir del canvas.
class MovingEntity {
  // position: p5.Vector en píxeles (esquina superior izquierda)
  // direction: vector unitario, p. ej. createVector(1, 0) o createVector(-1, 0)
  // speed: píxeles por frame (ver tabla de velocidades por fila, docs/ARQUITECTURA.md §3.1)
  constructor(position, entity_width, entity_height, speed, direction) {
    this.position = position
    this.entity_width = entity_width
    this.entity_height = entity_height
    this.direction = direction
    this.speed = speed
  }

  update() {
    let velocity = p5.Vector.mult(this.direction, this.speed)
    this.position.add(velocity)
    this.keepInBounds()
  }

  // Wrap horizontal: al salir por un lado, reaparece por el otro
  keepInBounds() {
    if (this.direction.x > 0 && this.position.x > width) {
      this.position.x = -this.entity_width
    } else if (this.direction.x < 0 && this.position.x + this.entity_width < 0) {
      this.position.x = width
    }
  }

  // Dibujo por defecto (gris); las subclases lo sobrescriben
  draw() {
    push()
    noStroke()
    fill(128, 128, 128)
    rect(this.position.x, this.position.y, this.entity_width, this.entity_height)
    pop()
  }
}

// Carro: si la rana lo toca, muere (regla en Game.checkCollisions)
class Vehicle extends MovingEntity {
  constructor(position, vehicle_width, vehicle_height, speed, direction, color) {
    super(position, vehicle_width, vehicle_height, speed, direction)
    this.color = color
  }

  draw() {
    push()
    noStroke()
    fill(this.color)
    rect(this.position.x, this.position.y, this.entity_width, this.entity_height, 8)
    pop()
  }
}

// Tronco: la rana puede subirse y es arrastrada con su velocidad (Frog.ridingLog)
class Log extends MovingEntity {
  constructor(position, log_width, log_height, speed, direction) {
    super(position, log_width, log_height, speed, direction)
  }

  draw() {
    push()
    noStroke()
    fill(139, 90, 43)
    rect(this.position.x, this.position.y, this.entity_width, this.entity_height, 6)
    pop()
  }
}
