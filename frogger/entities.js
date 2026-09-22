class MovingEntity {
    constructor (position, entity_width, entity_height, speed, direction) {
        this.position = position
        this.entity_width = entity_width
        this.entity_height = entity_height
        this.direction = direction
        this.speed = speed
    }

    update () {
        let velocity = p5.Vector.mult(this.direction, this.speed)
        this.position.add(velocity)
        this.keepInBounds()
    }

    keepInBounds() {
        if (this.direction.x > 0 && this.position.x > width) {
            this.position.x = -this.entity_width
        } else if (this.direction.x < 0 && this.position.x + this.entity_width < 0) {
            this.position.x  = width
        }
    }

    draw () {
        push()
        noStroke()
        fill(128, 128, 128)
        rect(this.position.x, this.position.y, this.entity_width, this.entity_height)
        pop()
    }
}

class Vehicle extends MovingEntity {
    constructor(position, vehicle_width, vehicle_height, speed, direction, color) {
        super(position, vehicle_width, vehicle_height, speed, direction)
        this.color = color
    }

    draw() {
        push()
        noStroke()
        fill(this.color)
        rect(this.position.x, this.position.y, this.entity_width, this.entity_height, 8)
        pop()
    }
}

class Log extends MovingEntity {
    constructor(position, log_width, log_height, speed, direction) {
        super(position, log_width, log_height, speed, direction)
    }

    draw() {
        push()
        noStroke()
        fill(139, 90, 43)
        rect(this.position.x, this.position.y, this.entity_width, this.entity_height, 6)
        pop()
    }
}
