// LÓGICA DEL JUEGO: estados, filas, orquestador (Game), jugador (Frog) y colisiones.
// Usa las entidades de entities.js y las constantes de frogger.js (CELL, COLS, ROWS, BOARD).

const GAME_STATES = { READY: 'READY', PLAYING: 'PLAYING', WON: 'WON', GAME_OVER: 'GAME_OVER' }

// Una fila por entrada, de arriba a abajo (13 en total). Cada una es un objeto de lanes.js;
// la velocidad, dirección y cantidad de cada fila están en sus argumentos
// (valores de docs/ARQUITECTURA.md §3.1).
// Es una función porque las filas usan CELL / BOARD, que frogger.js define después de cargar
// este archivo: se instancian en el constructor de Game, ya con todo cargado.
const createLanes = () => [
  new HomeLane([1, 4, 7, 10]),   // 0
  new RiverLane(-1, 1.25, 3),    // 1
  new RiverLane( 1, 1.0,  3),    // 2
  new RiverLane(-1, 1.5,  3),    // 3
  new RiverLane( 1, 2.0,  2),    // 4
  new RiverLane(-1, 1.25, 3),    // 5
  new SafeLane(),                // 6
  new RoadLane(-1, 1.5,  3),     // 7
  new RoadLane( 1, 2.5,  2),     // 8
  new RoadLane(-1, 2.0,  3),     // 9
  new RoadLane( 1, 3.0,  2),     // 10
  new RoadLane(-1, 1.75, 3),     // 11
  new SafeLane(),                // 12
]


// Orquestador: es dueño del estado y coordina cada frame (lo llama frogger.js).
class Game {
  constructor() {
    this.state = GAME_STATES.READY
    this.lives = 3
    this.score = 0
    this.frog = null
    this.vehicles = []
    this.logs = []
    this.lanes = createLanes()
    this.filledHoles = []   // un booleano por agujero; true = ya ocupado
    this.reset()
  }

  // Un frame de lógica. Orden según docs/ARQUITECTURA.md §5.3:
  // primero se detectan colisiones (fija frog.ridingLog), luego se mueve todo.
  update() {
    if (this.state != GAME_STATES.PLAYING)
      return

    this.checkCollisions()

    for (const vehicle of this.vehicles)
      vehicle.update()
    for (const log of this.logs)
      log.update()

    this.frog.update()
  }

  // Un frame de dibujo: fondo, entidades, rana y HUD (en ese orden, de atrás hacia adelante).
  draw() {
    background(0)

    // El tablero se dibuja desplazado hacia abajo para dejar libre la barra superior del HUD.
    // Así toda la lógica sigue usando coordenadas del tablero (y = 0 es la fila HOME).
    push()
    translate(0, HUD_H)
    this.drawBoard()

    for (const log of this.logs)
      log.draw()

    for (const vehicle of this.vehicles)
      vehicle.draw()

    this.frog.draw()
    pop()

    // El HUD usa coordenadas del canvas (sin desplazamiento)
    this.drawHUD()
  }

  // Cada fila se dibuja a sí misma (polimorfismo: ver lanes.js)
  drawBoard() {
    for (let row = 0; row < this.lanes.length; row++)
      this.lanes[row].draw(row, this.filledHoles)
  }

  // Barra superior: score. Barra inferior: vidas y tiempo.
  // TODO: mostrar el tiempo en la barra inferior (a la derecha).
  // TODO: si el estado es READY / WON / GAME_OVER, mostrar además un mensaje
  //   ("pulsa una tecla", "ganaste", "pulsa R").
  drawHUD() {
    const topY = 0
    const bottomY = HUD_H + BOARD

    push()
    noStroke()
    fill("blue")
    rect(0, topY, BOARD, HUD_H)
    fill("black")
    rect(0, bottomY, BOARD, HUD_H)

    fill(255)
    textSize(24)
    textAlign(LEFT, CENTER)
    text("SCORE: " + this.score, 10, topY + HUD_H / 2)
    text("VIDAS: " + this.lives, 10, bottomY + HUD_H / 2)
    pop()
  }

  // Reglas de docs/ARQUITECTURA.md §6. Se llama una vez por frame desde update().
  checkCollisions() {
    if (!this.frog.alive)
      return

    // Regla 1 (ya implementada): tocar un carro mata
    for (const vehicle of this.vehicles) {
      if (rectsOverlap(this.frog, vehicle)) {
        this.loseLife()
        return
      }
    }

    // Regla 3 (ya implementada): si toca un tronco, se sube; si no, ridingLog queda en null
    this.frog.ridingLog = null
    for (const log of this.logs) {
      if (rectsOverlap(this.frog, log)) {
        this.frog.ridingLog = log
        break
      }
    }

    // TODO regla 2: si la rana está en una fila RIVER y ridingLog es null, loseLife().
    //   La fila se obtiene con floor(this.frog.position.y / CELL) y se consulta en this.lanes.
    // TODO: si el tronco la saca del canvas (x < 0 o x > width - size), loseLife().
    // TODO reglas 4 y 5: si está en la fila HOME, comprobar si cae en un agujero libre
    //   (marcar this.filledHoles, sumar score, respawnFrog(); si se llenan los 4 -> WON)
    //   o fuera de uno / en uno lleno (loseLife()).
  }

  // Regla 6: toda muerte resta una vida; con 0 vidas GAME_OVER, si no la rana reaparece.
  loseLife() {
    this.lives--
    if (this.lives <= 0) {
      this.frog.alive = false
      this.state = GAME_STATES.GAME_OVER
    } else {
      this.respawnFrog()
    }
  }

  // Coloca una rana nueva en el inicio (columna 6, fila 12), viva y sin tronco.
  respawnFrog() {
    this.frog = new Frog(createVector(CELL * 6, CELL * 12), CELL)
  }

  // Pide a cada fila sus entidades (las filas SAFE / HOME devuelven []) y las reparte
  // en vehicles[] y logs[] según su clase.
  buildEntities() {
    this.vehicles = []
    this.logs = []

    for (let row = 0; row < this.lanes.length; row++) {
      for (const entity of this.lanes[row].createEntities(row)) {
        if (entity instanceof Vehicle)
          this.vehicles.push(entity)
        else
          this.logs.push(entity)
      }
    }
  }

  // Reinicia toda la partida (también se usa al construir el juego).
  reset() {
    this.state = GAME_STATES.READY
    this.lives = 3
    this.score = 0
    this.filledHoles = [false, false, false, false]
    this.buildEntities()
    this.respawnFrog()
  }

  // Entrada de teclado; la llama keyPressed() de frogger.js.
  // READY -> PLAYING con cualquier tecla; WON / GAME_OVER -> reset con 'R'.
  handleKey(key, keyCode) {
    if (this.state == GAME_STATES.READY) {
      this.state = GAME_STATES.PLAYING
      return
    }

    if (this.state == GAME_STATES.WON || this.state == GAME_STATES.GAME_OVER) {
      if (key == 'r' || key == 'R')
        this.reset()
      return
    }

    // Playing
    if (this.state == GAME_STATES.PLAYING) {
      let direction = createVector(0, 0)

      if (keyCode == UP_ARROW || key == "w" || key == "W") {
        direction = createVector(0, -CELL)
      } else if (keyCode == DOWN_ARROW || key == "s" || key == "S") {
        direction = createVector(0, CELL)
      } else if (keyCode == LEFT_ARROW || key == "a" || key == "A") {
        direction = createVector(-CELL, 0)
      } else if (keyCode == RIGHT_ARROW || key == "d" || key == "D") {
        direction = createVector(CELL, 0)
      }

      this.frog.move(direction)
    }
  }
}