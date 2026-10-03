// Pista circular de longitud `loopLength` (píxeles): la parte visible es [0, BOARD), el resto
// queda fuera de pantalla; de ahí el retraso antes de que una entidad "vuelva" a entrar.
class MovingEntity {
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

  // Wrap: la x de la entidad vive en [BOARD - loopLength, BOARD); ambos extremos
  // están fuera de pantalla, así que nunca aparece de golpe en el tablero.
  keepInBounds() {
    if (this.direction.x > 0 && this.position.x >= BOARD) {
      this.position.x -= this.loopLength
    } else if (this.direction.x < 0 && this.position.x < BOARD - this.loopLength) {
      this.position.x += this.loopLength
    }
  }

  bounds() {
    return { x: this.position.x, y: this.position.y, w: this.entity_width, h: this.entity_height }
  }

  draw() {
    push()
    noStroke()
    fill(128, 128, 128)
    rect(this.position.x, this.position.y, this.entity_width, this.entity_height)
    pop()
  }
}

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

class Log extends MovingEntity {
  constructor(position, log_width, log_height, speed, direction, loopLength) {
    super(position, log_width, log_height, speed, direction, loopLength)
  }

  // Por el centro: está sobre el tronco si el centro horizontal de la rana cae dentro (más justo con troncos cortos).
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
