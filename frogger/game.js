const LANE_TYPES = { SAFE: 0, ROAD: 1, RIVER: 2, HOME: 3 }
const GAME_STATES = { READY: 'READY', PLAYING: 'PLAYING', WON: 'WON', GAME_OVER: 'GAME_OVER' }

const lanes = [
  // TODO
];


class Game {
    constructor () {
        this.state = GAME_STATES.READY
        this.lives = 3
        this.score = 0
        this.frog = null
        this.vehicles = []
        this.logs = []
        this.lanes = lanes
    }

    update () {
        // TODO 
    }

    draw () {
        // TODO
    }

    checkCollisions () {
        // TODO
    }

    reset () {
        // TODO
    }
}

class Frog {
    constructor (position, size) {
    this.position = position
    this.size = size
    this.alive = true
    this.ridingLog = null
    }

    move (direction) {
        
        let next_position = p5.Vector.add(this.position, direction);

        if (next_position.x > width - this.size || next_position.x < 0 ||
            next_position.y > height - this.size || next_position.y < 0)
            return

        if (this.alive != true) 
            return
        
        this.position = next_position
    }

    update() {
        if (this.ridingLog != null)
            this.move(p5.Vector.mult(this.ridingLog.direction, this.ridingLog.speed))
    }

    draw() {
        rect(this.position.x, this.position.y, this.size, this.size)
    }
}

function rectsOverlap (a, b) {
    return  a.position.x < b.position.x + b.entity_width && 
            a.position.x + a.size > b.position.x &&
            a.position.y < b.position.y + b.entity_height && 
            a.position.y + a.size > b.position.y
}
