// Estado de la partida (vidas, score, estado), definición del tablero y reglas comunes.
// Las reglas de cada tipo de fila (carros, río, agujeros) están en lanes.js.

const GAME_STATES = { READY: 'READY', PLAYING: 'PLAYING', WON: 'WON', GAME_OVER: 'GAME_OVER' }

// Las 13 filas del tablero, de arriba (0) a abajo (12).
// RoadLane / RiverLane: (direction, speed, loopCells, pattern)
//   direction: -1 (←) o 1 (→) · speed: píxeles por frame
//   loopCells: longitud de la pista circular en celdas (13 visibles + el resto fuera de pantalla)
//   pattern:   [{ x, w }] posición inicial y ancho de cada carro / tronco, en celdas
// Es una función y no una constante porque las filas usan CELL / BOARD, que frogger.js
// define después de cargar este archivo.
const createLanes = () => [
  new HomeLane([1, 4, 7, 10]),                                                    // 0
  new RiverLane(-1, 1.25, 18, [{ x: 0, w: 3 }, { x: 6, w: 4 }, { x: 12, w: 3 }]), // 1
  new RiverLane( 1, 1.0,  17, [{ x: 0, w: 4 }, { x: 7, w: 4 }, { x: 13, w: 2 }]), // 2
  new RiverLane(-1, 1.5,  18, [{ x: 1, w: 5 }, { x: 9, w: 3 }, { x: 14, w: 2 }]), // 3
  new RiverLane( 1, 2.0,  17, [{ x: 0, w: 2 }, { x: 5, w: 3 }, { x: 11, w: 2 }]), // 4
  new RiverLane(-1, 1.25, 18, [{ x: 2, w: 4 }, { x: 9, w: 4 }]),                  // 5
  new SafeLane(),                                                                 // 6
  new RoadLane(-1, 1.5,  15, [{ x: 0, w: 1 }, { x: 4, w: 1 }, { x: 8, w: 1 }]),   // 7
  new RoadLane( 1, 2.5,  16, [{ x: 0, w: 2 }, { x: 7, w: 2 }]),                   // 8
  new RoadLane(-1, 2.0,  17, [{ x: 0, w: 3 }, { x: 8, w: 3 }]),                   // 9  camiones
  new RoadLane( 1, 3.0,  16, [{ x: 3, w: 1 }]),                                   // 10 un carro rápido
  new RoadLane(-1, 1.75, 16, [{ x: 0, w: 1 }, { x: 3, w: 1 }, { x: 9, w: 2 }]),   // 11
  new SafeLane(),                                                                 // 12
]

const HOME_POINTS = 100   // puntos por llenar un agujero


class Game {
  constructor() {
    this.state = GAME_STATES.READY
    this.lives = 3
    this.score = 0
    this.frog = null
    this.lanes = createLanes()
    this.reset()
  }

  // Primero las reglas (fijan frog.ridingLog) y luego el movimiento: así la rana y su
  // tronco se desplazan lo mismo en el frame y siguen alineados.
  update() {
    if (this.state != GAME_STATES.PLAYING)
      return

    this.checkCollisions()
    if (this.state != GAME_STATES.PLAYING)
      return

    for (const lane of this.lanes)
      lane.update()

    this.frog.update()
  }

  draw() {
    background(0)

    // El tablero se desplaza para dejar sitio a la barra superior del HUD; así la lógica
    // sigue usando coordenadas del tablero (y = 0 es la fila HOME).
    push()
    translate(0, HUD_H)
    this.drawBoard()
    this.frog.draw()
    pop()

    this.drawHUD()
  }

  drawBoard() {
    for (const lane of this.lanes)
      lane.draw()
  }

  // Barra superior: score. Barra inferior: vidas (y tiempo, pendiente).
  // TODO: tiempo en la barra inferior y mensajes para READY / WON / GAME_OVER.
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

  // Aplica las reglas comunes y pregunta a la fila de la rana (Lane.checkFrog) por las suyas.
  checkCollisions() {
    if (!this.frog.alive)
      return

    // Solo puede salir del tablero arrastrada por un tronco
    const centerX = this.frog.centerX()
    if (centerX < 0 || centerX > BOARD) {
      this.loseLife()
      return
    }

    // Fuera del río no va sobre ningún tronco; RiverLane lo vuelve a fijar si toca
    const lane = this.lanes[this.frog.row()]
    this.frog.ridingLog = null
    const result = lane.checkFrog(this.frog)

    if (result == FROG_RESULT.DIE) {
      this.loseLife()
    } else if (result == FROG_RESULT.HOME) {
      this.score += HOME_POINTS
      if (lane.allFilled())
        this.state = GAME_STATES.WON
      else
        this.respawnFrog()
    }
  }

  // Con 0 vidas termina la partida; si no, la rana vuelve al inicio.
  loseLife() {
    this.lives--
    if (this.lives <= 0) {
      this.frog.alive = false
      this.state = GAME_STATES.GAME_OVER
    } else {
      this.respawnFrog()
    }
  }

  // Rana nueva en el inicio (columna 6, fila 12)
  respawnFrog() {
    this.frog = new Frog(createVector(CELL * 6, CELL * 12), CELL)
  }

  // Partida nueva: cada fila recrea sus entidades en su posición inicial y vacía sus agujeros.
  reset() {
    this.state = GAME_STATES.READY
    this.lives = 3
    this.score = 0
    for (let row = 0; row < this.lanes.length; row++)
      this.lanes[row].build(row)
    this.respawnFrog()
  }

  // READY: cualquier tecla empieza. WON / GAME_OVER: 'R' reinicia. PLAYING: flechas o WASD.
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