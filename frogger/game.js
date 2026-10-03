const GAME_STATES = { READY: 'READY', PLAYING: 'PLAYING', WON: 'WON', GAME_OVER: 'GAME_OVER' }

const INPUT = {
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  RESTART: 'RESTART',
  OTHER: 'OTHER',
}

const DIRECTIONS = {
  [INPUT.UP]: { x: 0, y: -1 },
  [INPUT.DOWN]: { x: 0, y: 1 },
  [INPUT.LEFT]: { x: -1, y: 0 },
  [INPUT.RIGHT]: { x: 1, y: 0 },
}

const LANES = [
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

const HOME_POINTS = 100


class Game {
  constructor() {
    this.state = GAME_STATES.READY
    this.lives = 3
    this.score = 0
    this.frog = null
    this.lanes = LANES
    this.reset()
  }

  // Único punto donde cambia el estado de la partida.
  setState(next) {
    this.state = next
  }

  handleInput(input) {
    if (this.state == GAME_STATES.READY) {
      this.setState(GAME_STATES.PLAYING)
    } else if (this.state == GAME_STATES.WON || this.state == GAME_STATES.GAME_OVER) {
      if (input == INPUT.RESTART)
        this.reset()
    } else if (this.state == GAME_STATES.PLAYING) {
      const direction = DIRECTIONS[input]
      if (direction != null)
        this.frog.move(direction)
    }
  }

  // El orden es exigido: frog.update() lee el ridingLog que acaba de fijar
  // checkCollisions(); así rana y tronco se desplazan lo mismo en el frame.
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

  // Único escritor de frog.ridingLog: cada fila solo consulta con Lane.rideFor().
  checkCollisions() {
    if (!this.frog.alive)
      return

    // Solo puede salir del tablero arrastrada por un tronco
    const centerX = this.frog.centerX()
    if (centerX < 0 || centerX > BOARD) {
      this.loseLife()
      return
    }

    const lane = this.lanes[this.frog.row()]
    this.frog.ridingLog = lane.rideFor(this.frog)
    const result = lane.checkFrog(this.frog)

    if (result == FROG_RESULT.DIE) {
      this.loseLife()
    } else if (result == FROG_RESULT.HOME) {
      this.score += HOME_POINTS
      this.respawnFrog()
    } else if (result == FROG_RESULT.WIN) {
      // Victoria: la decide HomeLane (conoce los agujeros); la rana no reaparece
      this.score += HOME_POINTS
      this.setState(GAME_STATES.WON)
    }
  }

  loseLife() {
    this.lives--
    if (this.lives <= 0) {
      this.frog.alive = false
      this.setState(GAME_STATES.GAME_OVER)
    } else {
      this.respawnFrog()
    }
  }

  respawnFrog() {
    this.frog = new Frog(createVector(CELL * 6, CELL * 12), CELL)
  }

  reset() {
    this.setState(GAME_STATES.READY)
    this.lives = 3
    this.score = 0
    for (let row = 0; row < this.lanes.length; row++)
      this.lanes[row].build(row)
    this.respawnFrog()
  }
}
