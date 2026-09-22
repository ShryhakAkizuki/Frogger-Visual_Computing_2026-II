const vel = 1;
const lines = 10


let obstacle; // Declaración de la variable global

function setup() {
  createCanvas(800, 900);
  obstacle = new Obstacle(height/lines,0);
  
}

function draw() {
  background(0);
  if (obstacle.vivo){
    obstacle.draw();
    obstacle.update();
  }
  //rect(50, 50, 75, 100);
}

//
class Obstacle {
  constructor(obstacleSize,x) {
    this.xpos = x;
    this.vivo = true;
    this.propirtionWith = random(1,1.5);
    this.obstacleSize = obstacleSize
  }

  draw() {
    push();
      noStroke();
      fill(255, 0, 0);
      rect(this.xpos, 0, this.obstacleSize*this.propirtionWith, this.obstacleSize);
    pop();
  }

  update() {
    this.xpos = this.xpos + vel; 
    if (this.xpos > width){
      this.alive();
    }
  }
  
  alive(){
    this.vivo = false;
  }
}

class obstacleLine {
  constructor(position, dificulty){
    this.position = position;
    this.dificulty =dificulty;
    this.obstacles = [];
    //this.appeared = falce;
  }

  update(){
    
  }
  
}
