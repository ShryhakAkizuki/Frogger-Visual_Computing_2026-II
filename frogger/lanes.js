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

  // Consulta pura: no modifica a la rana; Game guarda la respuesta en frog.ridingLog (único escritor).
  rideFor(frog) {
    return null
  }

  fillRow(c) {
    noStroke()
    fill(c)
    rect(0, this.row * CELL, BOARD, CELL)
  }

  buildPattern(loopCells, pattern, make) {
    this.validatePattern(loopCells, pattern)

    const loopLength = loopCells * CELL
    for (const { x, w } of pattern) {
      // Las x más allá del tablero se pasan al tramo izquierdo de la pista (fuera de pantalla)
      let px = x * CELL
      if (px >= BOARD)
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
    this.fillRow("purple")
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

  drawBackground() {
    this.fillRow("green")
    for (let i = 0; i < this.holes.length; i++) {
      fill(this.filled[i] ? "yellow" : "blue")
      rect(this.holes[i] * CELL, this.row * CELL, CELL, CELL)
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

  holeAt(x) {
    return this.holes.indexOf(floor(x / CELL))
  }
}

class RoadLane extends Lane {
  constructor(direction, speed, loopCells, pattern, vehicleColor = "#FF0000") {
    super()
    this.direction = direction
    this.speed = speed
    this.loopCells = loopCells
    this.pattern = pattern
    this.vehicleColor = vehicleColor
  }

  build(row) {
    super.build(row)
    this.buildPattern(this.loopCells, this.pattern, (position, width, loopLength) =>
      new Vehicle(position, width, CELL, this.speed, createVector(this.direction, 0),
                  loopLength, this.vehicleColor))
  }

  drawBackground() {
    this.fillRow("black")
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
  constructor(direction, speed, loopCells, pattern) {
    super()
    this.direction = direction
    this.speed = speed
    this.loopCells = loopCells
    this.pattern = pattern
  }

  build(row) {
    super.build(row)
    this.buildPattern(this.loopCells, this.pattern, (position, width, loopLength) =>
      new Log(position, width, CELL, this.speed, createVector(this.direction, 0), loopLength))
  }

  drawBackground() {
    this.fillRow("blue")
  }

  rideFor(frog) {
    return this.entities.find(log => log.carries(frog)) || null
  }

  checkFrog(frog) {
    return this.rideFor(frog) ? FROG_RESULT.OK : FROG_RESULT.DIE
  }
}
