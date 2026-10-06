// Pista circular de longitud `loopLength` (píxeles): la parte visible es [0, BOARD_W), el resto
// queda fuera de pantalla; de ahí el retraso antes de que una entidad "vuelva" a entrar.
class MovingEntity {
  constructor(position, entity_width, entity_height, speed, direction, loopLength) {
    this.position = position
    this.entity_width = entity_width
    this.entity_height = entity_height
    this.direction = direction
    this.speed = speed
    this.loopLength = loopLength
    this.age = 0   // frames vividos: reloj de las animaciones, se para si el juego no avanza
  }

  update() {
    let velocity = p5.Vector.mult(this.direction, this.speed)
    this.position.add(velocity)
    this.keepInBounds()
    this.age++
  }

  // Wrap: la x de la entidad vive en [BOARD_W - loopLength, BOARD_W); ambos extremos
  // están fuera de pantalla, así que nunca aparece de golpe en el tablero.
  keepInBounds() {
    if (this.direction.x > 0 && this.position.x >= BOARD_W) {
      this.position.x -= this.loopLength
    } else if (this.direction.x < 0 && this.position.x < BOARD_W - this.loopLength) {
      this.position.x += this.loopLength
    }
  }

  bounds() {
    return { x: this.position.x, y: this.position.y, w: this.entity_width, h: this.entity_height }
  }

  cells() {
    return this.entity_width / CELL
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
  constructor(position, vehicle_width, vehicle_height, speed, direction, loopLength, sprite) {
    super(position, vehicle_width, vehicle_height, speed, direction, loopLength)
    this.sprite = sprite
  }

  draw() {
    drawSprite(this.sprite, this.position.x, this.position.y, this.entity_width, this.entity_height)
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
    const last = this.cells() - 1
    for (let i = 0; i <= last; i++) {
      const part = i == 0 ? 'log_left' : i == last ? 'log_right' : 'log_middle'
      drawSprite(part, this.position.x + i * CELL, this.position.y)
    }
  }
}

const TURTLE_FRAMES = ['turtle_1', 'turtle_2', 'turtle_3']

// Se comporta como un tronco (lleva a la rana); solo cambia el dibujo: una tortuga por celda.
class Turtle extends Log {
  draw() {
    const frame = TURTLE_FRAMES[Math.floor(this.age / TURTLE_FRAME_TIME) % TURTLE_FRAMES.length]
    for (let i = 0; i < this.cells(); i++)
      drawSprite(frame, this.position.x + i * CELL, this.position.y)
  }
}

// De menos a más hundida.
const TURTLE_DIVE_SPRITES = ['turtle_dive_1', 'turtle_dive_2']
const TURTLE_UNDER = TURTLE_DIVE_SPRITES.length + 1

class DivingTurtle extends Turtle {
  // 0 = a flote, 1..2 = sprite de inmersión, TURTLE_UNDER = bajo el agua.
  // Usa `age`, así el ciclo se congela con el juego igual que la animación.
  diveLevel() {
    const steps = TURTLE_DIVE_SPRITES.length
    const cycle = TURTLE_SURFACE_FRAMES + 2 * TURTLE_DIVE_FRAMES + TURTLE_UNDER_FRAMES
    let t = this.age % cycle

    if (t < TURTLE_SURFACE_FRAMES) return 0
    t -= TURTLE_SURFACE_FRAMES
    if (t < TURTLE_DIVE_FRAMES) return 1 + Math.floor(t * steps / TURTLE_DIVE_FRAMES)
    t -= TURTLE_DIVE_FRAMES
    if (t < TURTLE_UNDER_FRAMES) return TURTLE_UNDER
    t -= TURTLE_UNDER_FRAMES
    return steps - Math.floor(t * steps / TURTLE_DIVE_FRAMES)
  }

  isUnder() {
    return this.diveLevel() == TURTLE_UNDER
  }

  carries(frog) {
    return !this.isUnder() && super.carries(frog)
  }

  draw() {
    const level = this.diveLevel()
    if (level == 0) {
      super.draw()
    } else if (level != TURTLE_UNDER) {
      for (let i = 0; i < this.cells(); i++)
        drawSprite(TURTLE_DIVE_SPRITES[level - 1], this.position.x + i * CELL, this.position.y)
    }
  }
}
