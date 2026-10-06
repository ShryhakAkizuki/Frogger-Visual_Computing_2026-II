const GAME_STATES = { MENU: 'MENU', PLAYING: 'PLAYING', DYING: 'DYING', WON: 'WON', GAME_OVER: 'GAME_OVER' }

const INPUT = {
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  SELECT: 'SELECT',
  OTHER: 'OTHER',
}

const DIRECTIONS = {
  [INPUT.UP]: { x: 0, y: -1 },
  [INPUT.DOWN]: { x: 0, y: 1 },
  [INPUT.LEFT]: { x: -1, y: 0 },
  [INPUT.RIGHT]: { x: 1, y: 0 },
}

// Morir por tiempo suena como en carretera: el arcade no tiene un sonido propio para eso.
const DEATH_SOUNDS = {
  [FROG_DEATH.ROAD]: 'DieOnLand',
  [FROG_DEATH.WATER]: 'Drown',
  [FROG_DEATH.TIME]: 'DieOnLand',
}

// Disposición y sprites según Frogger_game.png. Velocidades en px/frame (CELL = 16).
const LANES = [
  new HomeLane([0, 3, 6, 9, 12]),                                                       // 0  5 metas (columnas de la rana)
  new RiverLane( 1, 0.35, 18, [{ x: 0, w: 4 }, { x: 6, w: 4 }, { x: 12, w: 4 }]),         // 1  troncos medianos
  new RiverLane(-1, 0.45, 17, [{ x: 0, w: 2 }, { x: 4, w: 2, Platform: DivingTurtle }, { x: 9, w: 2 }, { x: 13, w: 2 }], Turtle), // 2
  new RiverLane( 1, 0.6,  20, [{ x: 0, w: 6 }, { x: 9, w: 6 }]),                        // 3  troncos largos
  new RiverLane( 1, 0.4,  17, [{ x: 0, w: 3 }, { x: 5, w: 3 }, { x: 10, w: 3 }]),        // 4  troncos cortos
  new RiverLane(-1, 0.35, 17, [{ x: 0, w: 3 }, { x: 5, w: 3 }, { x: 10, w: 3, Platform: DivingTurtle }], Turtle), // 5
  new SafeLane(),                                                                       // 6
  new RoadLane(-1, 0.45, 16, [{ x: 0, w: 2 }, { x: 7, w: 2 }], 'truck'),                // 7
  new RoadLane( 1, 0.9,  16, [{ x: 3, w: 1 }], 'car_white'),                            // 8  un carro rápido
  new RoadLane(-1, 0.6,  15, [{ x: 0, w: 1 }, { x: 5, w: 1 }, { x: 9, w: 1 }], 'car_pink'),  // 9
  new RoadLane( 1, 0.45, 15, [{ x: 0, w: 1 }, { x: 4, w: 1 }, { x: 8, w: 1 }], 'bulldozer'), // 10
  new RoadLane(-1, 0.5,  15, [{ x: 0, w: 1 }, { x: 4, w: 1 }, { x: 8, w: 1 }], 'car_yellow'), // 11
  new SafeLane(),                                                                       // 12
]


class Game {
  constructor() {
    this.lives = START_LIVES
    this.score = 0
    this.highScore = 0
    this.frog = null
    this.lanes = LANES
    this.menu = new Menu()
    this.setState(GAME_STATES.MENU)
  }

  // Único punto donde cambia el estado de la partida.
  setState(next) {
    this.state = next
    this.stateFrames = 0
    this.playStateMusic()
  }

  // DYING no cambia la música; GameOver suena una vez, al ganar o al perder.
  playStateMusic() {
    if (this.state == GAME_STATES.MENU)
      playMusic('HomeScreen')
    else if (this.state == GAME_STATES.PLAYING)
      playMusic('MainSoundtrack')
    else if (this.isOver())
      playMusic('GameOver', false)
  }

  handleInput(input) {
    if (this.state == GAME_STATES.MENU) {
      if (this.menu.handleInput(input) == MENU_ACTION.PLAY)
        this.startGame()
    } else if (this.isOver()) {
      if (input == INPUT.SELECT)
        this.returnToMenu()
    } else if (this.state == GAME_STATES.PLAYING) {
      const direction = DIRECTIONS[input]
      if (direction != null && this.frog.move(direction))
        playSound('Hop')
    }
  }

  // El orden es exigido: frog.update() lee el ridingLog que acaba de fijar
  // checkCollisions(); así rana y tronco se desplazan lo mismo en el frame.
  update() {
    this.stateFrames++
    // El aviso de fin se ve un rato y la partida vuelve sola al menú (Enter lo adelanta).
    if (this.isOver() && this.stateFrames >= END_SCREEN_FRAMES) {
      this.returnToMenu()
      return
    }
    if (this.state == GAME_STATES.DYING) {
      this.updateDying()
      return
    }
    if (this.state != GAME_STATES.PLAYING)
      return

    this.tickTimer()
    if (this.state != GAME_STATES.PLAYING)
      return

    this.awardRowPoints()
    this.checkCollisions()
    if (this.state != GAME_STATES.PLAYING)
      return

    for (const lane of this.lanes)
      lane.update()

    this.frog.update()
  }

  // Sin reloj, puntos ni colisiones: solo corre la animación y el tráfico sigue moviéndose.
  updateDying() {
    for (const lane of this.lanes)
      lane.update()

    this.frog.update()
    if (this.frog.deathFinished())
      this.loseLife()
  }

  tickTimer() {
    const wasLow = this.isTimeLow()
    this.timeLeft -= 1
    if (!wasLow && this.isTimeLow())
      playSound('TimeWarning')
    if (this.timeLeft <= 0)
      this.killFrog(FROG_DEATH.TIME)
  }

  isTimeLow() {
    return this.timeLeft < TIME_WARNING_SECONDS * FPS
  }

  timeLeftSeconds() {
    return Math.ceil(this.timeLeft / FPS)
  }

  timeBonus() {
    return Math.floor(this.timeLeft / FPS) * HOLE_TIME_BONUS_PER_SECOND
  }

  awardRowPoints() {
    const row = this.frog.row()
    if (row < this.bestRow) {
      this.bestRow = row
      this.addScore(ROW_POINT)
    }
  }

  addScore(points) {
    this.score += points
    this.highScore = Math.max(this.highScore, this.score)
    if (!this.extraLifeAwarded && this.score >= EXTRA_LIFE_SCORE) {
      this.lives++
      this.extraLifeAwarded = true
    }
  }

  draw() {
    if (this.state == GAME_STATES.MENU) {
      this.menu.draw()
      return
    }

    background(COLORS.WATER)

    // El tablero se desplaza para dejar sitio a la barra superior del HUD; así la lógica
    // sigue usando coordenadas del tablero (y = 0 es la fila HOME).
    push()
    translate(0, HUD_TOP)
    this.drawBoard()
    // Al ganar, la rana ya se ve dentro de su meta (HomeLane).
    if (this.state != GAME_STATES.WON)
      this.frog.draw()
    pop()

    this.drawHUD()
  }

  drawBoard() {
    for (const lane of this.lanes)
      lane.draw()
  }

  drawHUD() {
    const bottomY = HUD_TOP + BOARD_H

    push()
    noStroke()
    textFont('monospace')
    textStyle(BOLD)
    textSize(CELL / 2)
    textAlign(LEFT, TOP)

    fill(COLORS.TEXT)
    text('1-UP', 2 * CELL, 1)
    text('HI-SCORE', 5 * CELL, 1)
    fill(COLORS.SCORE)
    text(nf(this.score, 5), 2 * CELL, CELL / 2)
    text(nf(this.highScore, 5), 6 * CELL, CELL / 2)

    fill(COLORS.ROAD)
    rect(0, bottomY, BOARD_W, HUD_BOTTOM)
    for (let i = 0; i < this.lives; i++)
      drawSprite('life', i * CELL / 2, bottomY)

    // La barra se encoge hacia la derecha, pegada a la etiqueta TIME.
    const barRight = BOARD_W - 2 * CELL
    const barWidth = 7 * CELL * this.timeLeft / (TIME_PER_LIFE * FPS)
    fill(this.isTimeLow() ? COLORS.TIME_BAR_LOW : COLORS.TIME_BAR)
    rect(barRight - barWidth, bottomY + CELL / 2, barWidth, CELL / 2)
    fill(COLORS.TIME_LABEL)
    textAlign(RIGHT, TOP)
    text('TIME', BOARD_W, bottomY + CELL / 2)

    const message = this.stateMessage()
    if (message != null) {
      // Sobre la mediana (fila 6), donde el arcade muestra sus avisos.
      const middleY = HUD_TOP + 6 * CELL
      textAlign(CENTER, CENTER)
      fill(COLORS.ROAD)
      rect(BOARD_W / 2 - textWidth(message) / 2 - 4, middleY, textWidth(message) + 8, CELL)
      fill(COLORS.SCORE)
      text(message, BOARD_W / 2, middleY + CELL / 2)
    }
    pop()
  }

  stateMessage() {
    if (this.state == GAME_STATES.WON) return 'GANASTE'
    if (this.state == GAME_STATES.GAME_OVER) return 'GAME OVER'
    return null
  }

  // Único escritor de frog.ridingLog: cada fila solo consulta con Lane.rideFor().
  checkCollisions() {
    if (!this.frog.alive)
      return

    // Solo puede salir del tablero arrastrada por un tronco
    const centerX = this.frog.centerX()
    if (centerX < 0 || centerX > BOARD_W) {
      this.killFrog(FROG_DEATH.WATER)
      return
    }

    const lane = this.lanes[this.frog.row()]
    this.frog.ridingLog = lane.rideFor(this.frog)
    const result = lane.checkFrog(this.frog)

    if (result == FROG_RESULT.DIE) {
      this.killFrog(lane.deathCause())
    } else if (result == FROG_RESULT.HOME) {
      this.addScore(HOLE_POINTS + this.timeBonus() + lane.takeBonus())
      playSound('Homed')
      this.respawnFrog()
    } else if (result == FROG_RESULT.WIN) {
      // Victoria: la decide HomeLane (conoce los agujeros); la rana no reaparece
      this.addScore(HOLE_POINTS + this.timeBonus() + lane.takeBonus() + WIN_POINTS)
      this.setState(GAME_STATES.WON)
    }
  }

  // La vida se descuenta al terminar la animación (updateDying()), no al morir.
  killFrog(cause) {
    this.frog.die(cause)
    playSound(DEATH_SOUNDS[cause])
    this.setState(GAME_STATES.DYING)
  }

  loseLife() {
    this.lives--
    if (this.lives <= 0) {
      this.setState(GAME_STATES.GAME_OVER)
    } else {
      this.respawnFrog()
      this.setState(GAME_STATES.PLAYING)
    }
  }

  respawnFrog() {
    this.frog = new Frog(createVector(FROG_X_OFFSET + CELL * START_COL, CELL * START_ROW), CELL)
    this.timeLeft = TIME_PER_LIFE * FPS
    this.bestRow = START_ROW
  }

  isOver() {
    return this.state == GAME_STATES.WON || this.state == GAME_STATES.GAME_OVER
  }

  returnToMenu() {
    this.menu.open(MENU_PAGES.MAIN)
    this.setState(GAME_STATES.MENU)
  }

  startGame() {
    this.setState(GAME_STATES.PLAYING)
    this.lives = START_LIVES
    this.score = 0
    this.extraLifeAwarded = false
    for (let row = 0; row < this.lanes.length; row++)
      this.lanes[row].build(row)
    this.respawnFrog()
  }
}
