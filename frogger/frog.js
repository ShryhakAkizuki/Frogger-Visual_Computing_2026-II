const FROG_DEATH = { ROAD: 'ROAD', WATER: 'WATER', TIME: 'TIME' }

// Todas las muertes terminan en la calavera (DEATH_WAIT_FRAMES) antes de reaparecer.
const DEATH_SPRITES = {
  [FROG_DEATH.ROAD]: ['death_road_1', 'death_road_2', 'death_road_3'],
  [FROG_DEATH.WATER]: ['death_water_1', 'death_water_2', 'death_water_3'],
  [FROG_DEATH.TIME]: [],
}

class Frog {
  constructor(position, size) {
    this.position = position
    this.size = size
    this.alive = true
    this.ridingLog = null   // tronco sobre el que va; único escritor: Game.checkCollisions() (vía Lane.rideFor())
    this.facing = 'up'
    this.jump = { x: 0, y: 0 }
    this.jumpFrames = 0     // > 0 mientras se ve el salto
    this.deathCause = null
    this.deathFrames = 0
  }

  // La posición lógica cambia de golpe (las reglas no cambian); el salto es solo visual
  // y bloquea la entrada mientras dura, como en el arcade.
  // Devuelve si saltó, para que Game decida el sonido.
  move(direction) {
    if (!this.alive || this.isJumping())
      return false

    const next_x = this.position.x + direction.x * this.size
    const next_y = this.position.y + direction.y * this.size

    if (next_x > BOARD_W - this.size || next_x < 0 ||
      next_y > BOARD_H - this.size || next_y < 0)
      return false

    this.facing = facingOf(direction)
    this.jump = { x: direction.x, y: direction.y }
    this.jumpFrames = JUMP_FRAMES
    this.position.x = next_x
    this.position.y = next_y
    return true
  }

  // Suma la velocidad del tronco directamente (move() se bloquea en los bordes); si sale
  // del tablero, checkCollisions() la mata.
  update() {
    if (!this.alive) {
      this.deathFrames++
      return
    }

    if (this.jumpFrames > 0)
      this.jumpFrames--
    if (this.ridingLog != null)
      this.position.add(p5.Vector.mult(this.ridingLog.direction, this.ridingLog.speed))
  }

  isJumping() {
    return this.jumpFrames > 0
  }

  die(cause) {
    this.alive = false
    this.deathCause = cause
    this.deathFrames = 0
    this.jumpFrames = 0
  }

  deathFinished() {
    return this.deathFrames >= DEATH_SPRITES[this.deathCause].length * DEATH_FRAME_TIME + DEATH_WAIT_FRAMES
  }

  centerX() {
    return this.position.x + this.size / 2
  }

  row() {
    return floor((this.position.y + this.size / 2) / CELL)
  }

  // Caja reducida: rozar un carro con el borde no mata.
  hitbox(margin = 2) {
    return {
      x: this.position.x + margin,
      y: this.position.y + margin,
      w: this.size - 2 * margin,
      h: this.size - 2 * margin,
    }
  }

  sprite() {
    if (!this.alive) {
      const frames = DEATH_SPRITES[this.deathCause]
      const index = Math.floor(this.deathFrames / DEATH_FRAME_TIME)
      return index < frames.length ? frames[index] : 'death_skull'
    }
    return this.isJumping() ? `frog_${this.facing}_jump` : `frog_${this.facing}`
  }

  draw() {
    // Durante el salto se dibuja entre la celda de origen y la de destino.
    const lag = this.size * this.jumpFrames / JUMP_FRAMES
    drawSprite(this.sprite(),
      this.position.x - this.jump.x * lag,
      this.position.y - this.jump.y * lag,
      this.size, this.size)
  }
}

function facingOf(direction) {
  if (direction.y < 0) return 'up'
  if (direction.y > 0) return 'down'
  return direction.x < 0 ? 'left' : 'right'
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
}
