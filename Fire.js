class Fire {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.radius = 20; // Fire radius
  }

  show() {
    fill(255, 0, 0);
    noStroke();
    ellipse(this.pos.x, this.pos.y, this.radius * 2, this.radius * 2);
  }
}
