// FILAS DEL TABLERO: cada tipo de fila es una clase que sabe dibujarse y crear sus entidades.
// Game solo recorre la lista `lanes` y llama a los mismos métodos en todas (polimorfismo);
// las diferencias (velocidad, dirección, cantidad, agujeros) viven en cada objeto.
// Usa Vehicle y Log de entities.js y las constantes de frogger.js (CELL, BOARD).

const LANE_TYPES = { SAFE: 0, ROAD: 1, RIVER: 2, HOME: 3 }

// Interfaz base: lo que Game espera de cualquier fila.
class Lane {
  constructor(type) {
    this.type = type
  }

  // Dibuja la fila `row` (0 = arriba). Obligatorio en cada subclase.
  // filledHoles: estado de los agujeros; solo lo usa HomeLane.
  draw(row, filledHoles) {
    throw new Error("Lane.draw() debe implementarse en la subclase")
  }

  // Crea los carros / troncos de la fila `row`. Por defecto no hay entidades.
  createEntities(row) {
    return []
  }

  // Auxiliar: pinta el fondo de la fila de un solo color.
  fillRow(row, c) {
    noStroke()
    fill(c)
    rect(0, row * CELL, BOARD, CELL)
  }

  // Auxiliar: crea `count` entidades repartidas a lo largo del ancho, en la y de la fila.
  // `make(position)` construye cada una a partir de su posición.
  spawnEvenly(row, count, make) {
    const entities = []
    const spacing = BOARD / count
    for (let i = 0; i < count; i++)
      entities.push(make(createVector(i * spacing, row * CELL)))
    return entities
  }
}

// Zona segura: solo fondo
class SafeLane extends Lane {
  constructor() {
    super(LANE_TYPES.SAFE)
  }

  draw(row) {
    this.fillRow(row, "purple")
  }
}

// Meta: fondo y agujeros en las columnas indicadas
class HomeLane extends Lane {
  // holes: columnas de los agujeros, p. ej. [1, 4, 7, 10]
  constructor(holes) {
    super(LANE_TYPES.HOME)
    this.holes = holes
  }

  draw(row, filledHoles) {
    this.fillRow(row, "green")
    for (let i = 0; i < this.holes.length; i++) {
      fill(filledHoles[i] ? "yellow" : "blue")
      rect(this.holes[i] * CELL, row * CELL, CELL, CELL)
    }
  }

  // Índice del agujero bajo la coordenada x (en píxeles), o -1 si no hay ninguno.
  holeAt(x) {
    return this.holes.indexOf(floor(x / CELL))
  }
}

// Carretera: carros con la velocidad y dirección de la fila
class RoadLane extends Lane {
  // direction: -1 (←) o 1 (→) · speed: píxeles por frame · count: cantidad de carros
  constructor(direction, speed, count, vehicleWidth = CELL * 2, vehicleColor = "#FF0000") {
    super(LANE_TYPES.ROAD)
    this.direction = direction
    this.speed = speed
    this.count = count
    this.vehicleWidth = vehicleWidth
    this.vehicleColor = vehicleColor
  }

  draw(row) {
    this.fillRow(row, "black")
  }

  createEntities(row) {
    return this.spawnEvenly(row, this.count, position =>
      new Vehicle(position, this.vehicleWidth, CELL, this.speed,
                  createVector(this.direction, 0), this.vehicleColor))
  }
}

// Río: troncos con la velocidad y dirección de la fila
class RiverLane extends Lane {
  // direction: -1 (←) o 1 (→) · speed: píxeles por frame · count: cantidad de troncos
  constructor(direction, speed, count, logWidth = CELL * 3) {
    super(LANE_TYPES.RIVER)
    this.direction = direction
    this.speed = speed
    this.count = count
    this.logWidth = logWidth
  }

  draw(row) {
    this.fillRow(row, "blue")
  }

  createEntities(row) {
    return this.spawnEvenly(row, this.count, position =>
      new Log(position, this.logWidth, CELL, this.speed,
              createVector(this.direction, 0)))
  }
}
