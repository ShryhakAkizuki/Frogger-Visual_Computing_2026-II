// LÓGICA DEL JUEGO: estados, filas, orquestador (Game), jugador (Frog) y colisiones.
// Usa las filas de lanes.js, la rana de frog.js y las constantes de frogger.js (CELL, BOARD, HUD_H).

const GAME_STATES = { READY: 'READY', PLAYING: 'PLAYING', WON: 'WON', GAME_OVER: 'GAME_OVER' }

// Una fila por entrada, de arriba a abajo (13 en total). Cada una es un objeto de lanes.js.
// RoadLane / RiverLane: (direction, speed, loopCells, pattern)
//   direction: -1 (←) o 1 (→) · speed: píxeles por frame (docs/ARQUITECTURA.md §3.1)
//   loopCells: longitud de la pista circular en celdas (13 visibles + el resto fuera de pantalla)
//   pattern:   [{ x, w }] posición inicial y ancho de cada carro / tronco, en celdas
// Es una función porque las filas usan CELL / BOARD, que frogger.js define después de cargar
// este archivo: se instancian en el constructor de Game, ya con todo cargado.
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


// Orquestador: es dueño del estado y coordina cada frame (lo llama frogger.js).
class Game {
  constructor() {
    this.state = GAME_STATES.READY
    this.lives = 3
    this.score = 0
    this.frog = null
    this.lanes = createLanes()
    this.reset()
  }

  // Un frame de lógica. Orden según docs/ARQUITECTURA.md §5.3:
  // primero se aplican las reglas (fija frog.ridingLog), luego se mueve todo. La rana y su
  // tronco se desplazan lo mismo en este frame, así que siguen alineados.
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

  // Un frame de dibujo: fondo, entidades, rana y HUD (en ese orden, de atrás hacia adelante).
  draw() {
    background(0)

    // El tablero se dibuja desplazado hacia abajo para dejar libre la barra superior del HUD.
    // Así toda la lógica sigue usando coordenadas del tablero (y = 0 es la fila HOME).
    push()
    translate(0, HUD_H)
    this.drawBoard()
    this.frog.draw()
    pop()

    // El HUD usa coordenadas del canvas (sin desplazamiento)
    this.drawHUD()
  }

  // Cada fila dibuja su fondo y sus entidades (polimorfismo: ver lanes.js)
  drawBoard() {
    for (const lane of this.lanes)
      lane.draw()
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
  // Las reglas de cada tipo de fila (carros, río, agujeros) viven en Lane.checkFrog();
  // aquí solo se aplican las comunes y se reacciona al resultado.
  checkCollisions() {
    if (!this.frog.alive)
      return

    // Fuera del tablero (solo puede pasar arrastrada por un tronco) -> muere
    const centerX = this.frog.centerX()
    if (centerX < 0 || centerX > BOARD) {
      this.loseLife()
      return
    }

    // Solo la fila en la que está la rana decide; fuera del río no va sobre ningún tronco
    const lane = this.lanes[this.frog.row()]
    this.frog.ridingLog = null
    const result = lane.checkFrog(this.frog)

    if (result == FROG_RESULT.DIE) {
      this.loseLife()
    } else if (result == FROG_RESULT.HOME) {
      this.score += HOME_POINTS
      if (lane.allFilled())
        this.state = GAME_STATES.WON   // regla 7
      else
        this.respawnFrog()
    }
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

  // Reinicia toda la partida (también se usa al construir el juego): cada fila recrea
  // sus entidades en su posición inicial y vacía sus agujeros.
  reset() {
    this.state = GAME_STATES.READY
    this.lives = 3
    this.score = 0
    for (let row = 0; row < this.lanes.length; row++)
      this.lanes[row].build(row)
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