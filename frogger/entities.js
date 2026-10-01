// ENTIDADES: cosas que se mueven solas por el tablero (carros y troncos).
// No conocen las reglas del juego; las filas de lanes.js las crean, las poseen y las mueven.

// Base: se desplaza en línea recta sobre una pista circular de longitud `loopLength` (píxeles).
// La parte visible de la pista es [0, BOARD); el resto queda fuera de pantalla, y es lo que
// produce el retraso antes de que una entidad "vuelva" a entrar.
class MovingEntity {
  // position: p5.Vector en píxeles (esquina superior izquierda)
  // direction: vector unitario, p. ej. createVector(1, 0) o createVector(-1, 0)
  // speed: píxeles por frame (ver tabla de velocidades por fila, docs/ARQUITECTURA.md §3.1)
  // loopLength: longitud total de la pista; debe ser >= BOARD + entity_width
  constructor(position, entity_width, entity_height, speed, direction, loopLength) {
    this.position = position
    this.entity_width = entity_width
    this.entity_height = entity_height
    this.direction = direction
    this.speed = speed
    this.loopLength = loopLength
  }

  update() {
    let velocity = p5.Vector.mult(this.direction, this.speed)
    this.position.add(velocity)
    this.keepInBounds()
  }

  // Wrap sobre la pista: la x de la entidad vive en [BOARD - loopLength, BOARD).
  // Ambos extremos están fuera de pantalla, así que la entidad nunca aparece de golpe.
  keepInBounds() {
    if (this.direction.x > 0 && this.position.x >= BOARD) {
      this.position.x -= this.loopLength
    } else if (this.direction.x < 0 && this.position.x < BOARD - this.loopLength) {
      this.position.x += this.loopLength
    }
  }

  // Caja de colisión en coordenadas del tablero
  bounds() {
    return { x: this.position.x, y: this.position.y, w: this.entity_width, h: this.entity_height }
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

// Carro: si la rana lo toca, muere (regla en RoadLane.checkFrog)
class Vehicle extends MovingEntity {
  constructor(position, vehicle_width, vehicle_height, speed, direction, loopLength, color) {
    super(position, vehicle_width, vehicle_height, speed, direction, loopLength)
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
  constructor(position, log_width, log_height, speed, direction, loopLength) {
    super(position, log_width, log_height, speed, direction, loopLength)
  }

  // La rana está sobre el tronco si su centro horizontal cae dentro de él
  // (más justo que tocar solo una esquina, sobre todo con troncos cortos)
  carries(frog) {
    const centerX = frog.centerX()
    return centerX >= this.position.x && centerX <= this.position.x + this.entity_width
  }

  draw() {
    push()
    noStroke()
    fill(139, 90, 43)
    rect(this.position.x, this.position.y, this.entity_width, this.entity_height, 6)
    pop()
  }
}
