const LANE_TYPES = { SAFE: 0, ROAD: 1, RIVER: 2, HOME: 3 };
const GAME_STATES = { READY: 'READY', PLAYING: 'PLAYING', WON: 'WON', GAME_OVER: 'GAME_OVER' };

const lanes = [
  // TODO
];


class Game {
    constructor () {
        this.state = GAME_STATES.READY;
        this.lives = 3;
        this.score = 0;
        this.frog = null;
        this.vehicles = [];
        this.logs = [];
        this.lanes = lanes;
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
    constructor(pos) {
    this.pos = pos;
    this.alive = true;
    this.ridingLog = null;
    }

    move (dir) {
        // TODO
    }

    update() {
        // TODO
    }

    draw() {
        // TODO
    }
}

function rectsOverlap (a, b) {
    return  a.x < b.x + b.w && a.x + a.w > b.x &&
            a.y < b.y + b.h && a.y + a.h > b.y;
}
