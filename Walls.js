class Wall {
  constructor(x, y, width, height) {
    this.pos = createVector(x, y);
    this.width = width;
    this.height = height;

    // For obstacle avoidance
    this.center = createVector(x + width / 2, y + height / 2);
  }

  getClosestPoint(point) {
    // Returns the closest point on the wall to the given point
    let x = constrain(point.x, this.pos.x, this.pos.x + this.width);
    let y = constrain(point.y, this.pos.y, this.pos.y + this.height);
    return createVector(x, y);
  }

  show() {
    fill(100);
    noStroke();
    rect(this.pos.x, this.pos.y, this.width, this.height);
  }
}
