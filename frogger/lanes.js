// FILAS DEL TABLERO: cada tipo de fila es una clase que posee sus entidades, las mueve, las
// dibuja y decide qué le pasa a la rana cuando está en ella.
// Game solo recorre la lista de filas y llama a los mismos métodos en todas (polimorfismo).
// Usa Vehicle y Log de entities.js y las constantes de frogger.js (CELL, COLS, BOARD).

const LANE_TYPES = { SAFE: 0, ROAD: 1, RIVER: 2, HOME: 3 }

// Resultado de Lane.checkFrog(): qué debe hacer Game con la rana
const FROG_RESULT = { OK: 'OK', DIE: 'DIE', HOME: 'HOME' }

// Interfaz base: lo que Game espera de cualquier fila.
class Lane {
  constructor(type) {
    this.type = type
    this.row = 0
    this.entities = []
  }

  // (Re)crea el contenido de la fila al empezar una partida. `row`: índice de la fila (0 = arriba).
  build(row) {
    this.row = row
    this.entities = []
  }

  // Mueve las entidades de la fila
  update() {
    for (const entity of this.entities)
      entity.update()
  }

  // Dibuja el fondo y luego las entidades
  draw() {
    this.drawBackground()
    for (const entity of this.entities)
      entity.draw()
  }

  // Fondo de la fila. Obligatorio en cada subclase.
  drawBackground() {
    throw new Error("Lane.drawBackground() debe implementarse en la subclase")
  }

  // Qué le pasa a la rana que está en esta fila. Por defecto nada.
  checkFrog(frog) {
    return FROG_RESULT.OK
  }

  // Auxiliar: pinta el fondo de la fila de un solo color.
  fillRow(c) {
    noStroke()
    fill(c)
    rect(0, this.row * CELL, BOARD, CELL)
  }

  // Auxiliar: crea las entidades de un patrón definido a mano sobre una pista circular.
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

  // Comprueba que el patrón quepa en la pista sin solaparse (también a través del wrap)
  // y que ninguna entidad aparezca de golpe dentro del tablero al dar la vuelta.
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

// Zona segura: solo fondo
class SafeLane extends Lane {
  constructor() {
    super(LANE_TYPES.SAFE)
  }

  drawBackground() {
    this.fillRow("purple")
  }
}

// Meta: fondo y agujeros en las columnas indicadas; guarda cuáles están ocupados
class HomeLane extends Lane {
  // holes: columnas de los agujeros, p. ej. [1, 4, 7, 10]
  constructor(holes) {
    super(LANE_TYPES.HOME)
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

  // Reglas 4 y 5: entra en un agujero libre -> HOME; pared o agujero ocupado -> DIE.
  // Se usa el centro de la rana, que puede llegar desalineada desde un tronco.
  checkFrog(frog) {
    const hole = this.holeAt(frog.centerX())
    if (hole == -1 || this.filled[hole])
      return FROG_RESULT.DIE

    this.filled[hole] = true
    return FROG_RESULT.HOME
  }

  allFilled() {
    return this.filled.every(filled => filled)
  }

  // Índice del agujero bajo la coordenada x (en píxeles), o -1 si no hay ninguno.
  holeAt(x) {
    return this.holes.indexOf(floor(x / CELL))
  }
}

// Carretera: carros con la velocidad y dirección de la fila
class RoadLane extends Lane {
  // direction: -1 (←) o 1 (→) · speed: píxeles por frame
  // loopCells y pattern: ver Lane.buildPattern()
  constructor(direction, speed, loopCells, pattern, vehicleColor = "#FF0000") {
    super(LANE_TYPES.ROAD)
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

  // Regla 1: tocar un carro mata (caja de la rana reducida, ver Frog.hitbox())
  checkFrog(frog) {
    for (const vehicle of this.entities) {
      if (rectsOverlap(frog.hitbox(), vehicle.bounds()))
        return FROG_RESULT.DIE
    }
    return FROG_RESULT.OK
  }
}

// Río: troncos con la velocidad y dirección de la fila
class RiverLane extends Lane {
  // direction: -1 (←) o 1 (→) · speed: píxeles por frame
  // loopCells y pattern: ver Lane.buildPattern()
  constructor(direction, speed, loopCells, pattern) {
    super(LANE_TYPES.RIVER)
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

  // Reglas 2 y 3: sobre un tronco viaja con él; en el agua sin tronco se hunde
  checkFrog(frog) {
    frog.ridingLog = this.entities.find(log => log.carries(frog)) || null
    return frog.ridingLog ? FROG_RESULT.OK : FROG_RESULT.DIE
  }
}
