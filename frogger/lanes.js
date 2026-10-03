// Filas del tablero. Cada tipo de fila posee sus entidades, las mueve, las dibuja y decide
// qué le pasa a la rana cuando está en ella. Game trata a todas por igual a través de Lane.

// Lo que devuelve Lane.checkFrog() para que Game reaccione
const FROG_RESULT = { OK: 'OK', DIE: 'DIE', HOME: 'HOME', WIN: 'WIN' }

// Interfaz base de todas las filas
class Lane {
  constructor() {
    this.row = 0
    this.entities = []
  }

  // Se llama al empezar cada partida; `row` es el índice de la fila (0 = arriba)
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

  // Obligatorio en cada subclase
  drawBackground() {
    throw new Error("Lane.drawBackground() debe implementarse en la subclase")
  }

  // Por defecto la fila es segura
  checkFrog(frog) {
    return FROG_RESULT.OK
  }

  // Entidad de esta fila sobre la que va la rana, o null si ninguna. Consulta pura:
  // no modifica a la rana; Game guarda la respuesta en frog.ridingLog (único escritor).
  rideFor(frog) {
    return null
  }

  fillRow(c) {
    noStroke()
    fill(c)
    rect(0, this.row * CELL, BOARD, CELL)
  }

  // Crea las entidades de un patrón definido a mano sobre una pista circular.
  //   loopCells: longitud de la pista en celdas; las celdas >= COLS quedan fuera de pantalla
  //   pattern:   [{ x, w }, ...] posición inicial y ancho de cada entidad, en celdas
  //   make(position, width, loopLength): construye cada entidad
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

  // Falla al arrancar si dos entidades se solapan (también a través del wrap) o si la pista
  // es tan corta que una entidad aparecería de golpe dentro del tablero al dar la vuelta.
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

// Meta: agujeros en las columnas indicadas; guarda cuáles están ocupados
class HomeLane extends Lane {
  // holes: columnas de los agujeros, p. ej. [1, 4, 7, 10]
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

  // Agujero libre -> HOME, o WIN si con este se llena el último. Pared o agujero
  // ocupado -> DIE. Se usa el centro de la rana porque puede llegar desalineada desde un tronco.
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

  // Índice del agujero bajo la x en píxeles, o -1
  holeAt(x) {
    return this.holes.indexOf(floor(x / CELL))
  }
}

// Todos los carros de una fila comparten velocidad y dirección
class RoadLane extends Lane {
  // loopCells y pattern: ver Lane.buildPattern()
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

  // Usa la caja reducida de la rana: rozar un carro con el borde no mata
  checkFrog(frog) {
    for (const vehicle of this.entities) {
      if (rectsOverlap(frog.hitbox(), vehicle.bounds()))
        return FROG_RESULT.DIE
    }
    return FROG_RESULT.OK
  }
}

// Todos los troncos de una fila comparten velocidad y dirección
class RiverLane extends Lane {
  // loopCells y pattern: ver Lane.buildPattern()
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

  // El tronco bajo la rana, o null
  rideFor(frog) {
    return this.entities.find(log => log.carries(frog)) || null
  }

  // Sobre un tronco viaja con él; en el agua se hunde
  checkFrog(frog) {
    return this.rideFor(frog) ? FROG_RESULT.OK : FROG_RESULT.DIE
  }
}
