// Jugador. Posición en píxeles (esquina superior izquierda); salta CELL píxeles por tecla.
class Frog {
  constructor(position, size) {
    this.position = position
    this.size = size
    this.alive = true
    this.ridingLog = null   // tronco sobre el que va; lo fija Game.checkCollisions()
  }

  // Salto: `direction` es el desplazamiento en píxeles. No se mueve si se saldría del canvas
  // o si la rana está muerta.
  move(direction) {
    let next_position = p5.Vector.add(this.position, direction);

    if (next_position.x > width - this.size || next_position.x < 0 ||
      next_position.y > BOARD - this.size || next_position.y < 0)
      return

    if (this.alive != true)
      return

    this.position = next_position
  }

  // Arrastre por el tronco.
  // TODO (bug conocido): no usar move(), porque bloquea en los bordes y deja la rana
  // desincronizada del tronco. Sumar directamente la velocidad a this.position y dejar
  // que Game.checkCollisions() decida si salió del canvas (docs/ARQUITECTURA.md §9).
  update() {
    if (this.ridingLog != null)
      this.move(p5.Vector.mult(this.ridingLog.direction, this.ridingLog.speed))
  }

  // TODO (bug conocido): envolver en push()/pop() y fijar fill() para no heredar
  // el estado de dibujo del elemento anterior.
  draw() {
    fill(255);
    rect(this.position.x, this.position.y, this.size, this.size)
  }
}

// Colisión entre cajas alineadas a los ejes (AABB).
// `a` es la rana (usa `size`); `b` es una entidad (usa `entity_width` / `entity_height`).
// TODO: unificar la forma de las cajas para que sirva con cualquier par de objetos.
function rectsOverlap(a, b) {
  return a.position.x < b.position.x + b.entity_width &&
    a.position.x + a.size > b.position.x &&
    a.position.y < b.position.y + b.entity_height &&
    a.position.y + a.size > b.position.y
}
