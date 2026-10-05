const FROG_RESULT = { OK: 'OK', DIE: 'DIE', HOME: 'HOME', WIN: 'WIN' }

class Lane {
  constructor() {
    this.row = 0
    this.entities = []
  }

  build(row) {
    this.row = row
    this.entities = []
  }

  update() {
    for (const entity of this.entities)
      entity.update()
  }

  draw() {
    this.drawBackground()
    for (const entity of this.entities)
      entity.draw()
  }

  drawBackground() {
    throw new Error("Lane.drawBackground() debe implementarse en la subclase")
  }

  checkFrog(frog) {
    return FROG_RESULT.OK
  }

  // Elige la animación de muerte cuando checkFrog() devuelve DIE.
  deathCause() {
    return FROG_DEATH.ROAD
  }

  // Consulta pura: no modifica a la rana; Game guarda la respuesta en frog.ridingLog (único escritor).
  rideFor(frog) {
    return null
  }

  fillRow(c) {
    noStroke()
    fill(c)
    rect(0, this.row * CELL, BOARD_W, CELL)
  }

  buildPattern(loopCells, pattern, make) {
    this.validatePattern(loopCells, pattern)

    const loopLength = loopCells * CELL
    for (const { x, w } of pattern) {
      // Las x más allá del tablero se pasan al tramo izquierdo de la pista (fuera de pantalla)
      let px = x * CELL
      if (px >= BOARD_W)
        px -= loopLength
      this.entities.push(make(createVector(px, this.row * CELL), w * CELL, loopLength))
    }
  }

  // Falla si las entidades se solapan (también a través del wrap) o si la pista es tan
  // corta que una entidad aparecería de golpe dentro del tablero al dar la vuelta.
  validatePattern(loopCells, pattern) {
    const widest = Math.max(...pattern.map(e => e.w))
    if (loopCells < COLS + widest)
      throw new Error(`Fila ${this.row}: loopCells (${loopCells}) debe ser >= ${COLS + widest} (COLS + entidad más ancha)`)

    const sorted = [...pattern].sort((a, b) => a.x - b.x)
    for (let i = 0; i < sorted.length; i++) {
      const current = sorted[i]
      const next = sorted[(i + 1) % sorted.length]
      const nextX = i + 1 < sorted.length ? next.x : next.x + loopCells
      if (current.x < 0 || current.x >= loopCells || current.x + current.w > nextX)
        throw new Error(`Fila ${this.row}: la entidad en x=${current.x} se sale de la pista o se solapa con la siguiente`)
    }
  }
}

class SafeLane extends Lane {
  constructor() {
    super()
  }

  drawBackground() {
    for (let x = 0; x < BOARD_W; x += CELL)
      drawSprite('sidewalk', x, this.row * CELL)
  }
}

class HomeLane extends Lane {
  constructor(holes) {
    super()
    this.holes = holes
    this.filled = holes.map(() => false)
  }

  build(row) {
    super.build(row)
    this.filled = this.holes.map(() => false)
  }

  // El arbusto mide 24 px de alto: sobresale 8 px por encima de la fila, hacia el HUD.
  // Su hueco interior (gris en el sprite) se pinta del color del agua.
  drawBackground() {
    const top = this.row * CELL - CELL / 2
    for (let x = 0; x < BOARD_W; x += CELL / 2)
      drawSprite('home_bush_edge', x, top)

    noStroke()
    fill(COLORS.WATER)
    for (let i = 0; i < this.holes.length; i++) {
      const x = this.holeX(i)
      drawSprite('home_bush', x - CELL / 2, top)
      rect(x, this.row * CELL, CELL, CELL)
      if (this.filled[i])
        drawSprite('home_frog', x, this.row * CELL)
    }
  }

  // Usa el centro de la rana: puede llegar desalineada desde un tronco.
  checkFrog(frog) {
    const hole = this.holeAt(frog.centerX())
    if (hole == -1 || this.filled[hole])
      return FROG_RESULT.DIE

    this.filled[hole] = true
    return this.allFilled() ? FROG_RESULT.WIN : FROG_RESULT.HOME
  }

  allFilled() {
    return this.filled.every(filled => filled)
  }

  // `holes` son columnas de la rejilla de la rana, no del tablero.
  holeX(i) {
    return FROG_X_OFFSET + this.holes[i] * CELL
  }

  holeAt(x) {
    return this.holes.findIndex((_, i) => x >= this.holeX(i) && x <= this.holeX(i) + CELL)
  }
}

class RoadLane extends Lane {
  constructor(direction, speed, loopCells, pattern, sprite) {
    super()
    this.direction = direction
    this.speed = speed
    this.loopCells = loopCells
    this.pattern = pattern
    this.sprite = sprite
  }

  build(row) {
    super.build(row)
    this.buildPattern(this.loopCells, this.pattern, (position, width, loopLength) =>
      new Vehicle(position, width, CELL, this.speed, createVector(this.direction, 0),
                  loopLength, this.sprite))
  }

  drawBackground() {
    this.fillRow(COLORS.ROAD)
  }

  checkFrog(frog) {
    for (const vehicle of this.entities) {
      if (rectsOverlap(frog.hitbox(), vehicle.bounds()))
        return FROG_RESULT.DIE
    }
    return FROG_RESULT.OK
  }
}

class RiverLane extends Lane {
  // `Platform` es la clase de lo que flota (Log o Turtle): ambas llevan a la rana igual.
  constructor(direction, speed, loopCells, pattern, Platform = Log) {
    super()
    this.direction = direction
    this.speed = speed
    this.loopCells = loopCells
    this.pattern = pattern
    this.Platform = Platform
  }

  build(row) {
    super.build(row)
    this.buildPattern(this.loopCells, this.pattern, (position, width, loopLength) =>
      new this.Platform(position, width, CELL, this.speed, createVector(this.direction, 0), loopLength))
  }

  drawBackground() {
    this.fillRow(COLORS.WATER)
  }

  rideFor(frog) {
    return this.entities.find(log => log.carries(frog)) || null
  }

  checkFrog(frog) {
    return this.rideFor(frog) ? FROG_RESULT.OK : FROG_RESULT.DIE
  }

  deathCause() {
    return FROG_DEATH.WATER
  }
}
