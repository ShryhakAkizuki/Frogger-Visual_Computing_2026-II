
class MovingEntity {
    constructor (position, entity_width, entity_height, x_speed, x_direction) {
        this.position = position;
        this.entity_width = entity_width;
        this.entity_height = entity_height;
        this.x_speed = x_speed;
        this.x_direction = x_direction;
    }

    update () {
        this.position.x = this.position.x + this.x_direction * this.x_speed;
        this.reset();
    }

    reset () {
        if (this.x_direction > 0 && this.position.x > width) {
            this.position.x = -this.entity_width;
        } else if (this.x_direction < 0 && this.position.x + this.entity_width < 0) {
            this..position.x  = width;
        }
    }

    draw () {
        push();
        noStroke();
        fill(128, 128, 128);
        rect(this.xpos, this.ypos, this.w, this.h);
        pop();
    }
}

class Vehicle extends MovingEntity {
    constructor(pos, vehicle_width, vehicle_height, x_speed, x_direction, color) {
        super(pos, vehicle_width, vehicle_height, x_speed, x_direction);
        this.color = color;
    }

    draw() {
        push();
        noStroke();
        fill(this.color);
        rect(this.pos.x, this.pos.y, this.vehicle_width, this.vehicle_height, 8);
        pop();
    }
}

class Log extends MovingEntity {
    constructor(pos, log_width, log_height, x_speed, x_direction) {
        super(pos, log_width, log_height, x_speed, x_direction);
    }

    draw() {
        push();
        noStroke();
        fill(139, 90, 43);
        rect(this.pos.x, this.pos.y, this.log_width, this.log_height, 6);
        pop();
    }
}
