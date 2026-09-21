const vel = 1;
let obstacle; // Declaración de la variable global

function setup() {
  createCanvas(1280, 720);
  obstacle = new Obstacle();
}

function draw() {
  background(0);
  obstacle.draw();
  obstacle.update();
  //rect(50, 50, 75, 100);
}

class Obstacle {
  constructor() {
    this.xpos = 0;
    this.vivo = true;
  }

  draw() {
    push();
      noStroke();
      fill(255, 0, 0);
      rect(this.xpos, 0, 100, 100);
    pop();
  }

  update() {
    this.xpos = this.xpos + vel; 
  }
  
  alive(){
    this.vivo = false;
  }
}
