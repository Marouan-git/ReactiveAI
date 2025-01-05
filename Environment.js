class Environment {
  constructor() {
    // Define office area
    this.officeArea = {
      x: 50,
      y: 50,
      width: 500,
      height: 400,
    };

    // Define door opening in the office right wall
    this.door = {
      x: this.officeArea.x + this.officeArea.width - 10, // Position of the door on the right wall
      y: this.officeArea.y + this.officeArea.height / 2 - 25,
      width: 10, // Door width
      height: 50, // Door height
    };

    // Evacuation state
    this.evacuationStarted = false;

    // Define walls as an array of Wall objects
    this.walls = [];

    // Add walls (office boundaries), leaving an opening for the door
    // Top wall
    this.walls.push(
      new Wall(this.officeArea.x, this.officeArea.y, this.officeArea.width, 10)
    );
    // Bottom wall
    this.walls.push(
      new Wall(
        this.officeArea.x,
        this.officeArea.y + this.officeArea.height - 10,
        this.officeArea.width,
        10
      )
    );
    // Left wall
    this.walls.push(
      new Wall(this.officeArea.x, this.officeArea.y, 10, this.officeArea.height)
    );
    // Right wall (above the door)
    this.walls.push(
      new Wall(
        this.officeArea.x + this.officeArea.width - 10,
        this.officeArea.y,
        10,
        this.door.y - this.officeArea.y
      )
    );
    // Right wall (below the door)
    this.walls.push(
      new Wall(
        this.officeArea.x + this.officeArea.width - 10,
        this.door.y + this.door.height,
        10,
        this.officeArea.y + this.officeArea.height - (this.door.y + this.door.height)
      )
    );

    // Define corridor dimensions
    this.corridorWidth = 100;
    this.corridorHeight = 100;

    // Corridor starting position (aligned with door)
    this.corridorX = this.officeArea.x + this.officeArea.width;
    this.corridorY = this.door.y - 25; // Adjusted to match the door

    // Add walls for the corridor
    // Corridor top wall
    this.walls.push(new Wall(this.corridorX, this.corridorY, this.corridorWidth, 10));
    // Corridor bottom wall
    this.walls.push(
      new Wall(
        this.corridorX,
        this.corridorY + this.corridorHeight - 10,
        this.corridorWidth,
        10
      )
    );

    // Define emergency exit (at the end of the corridor)
    this.emergencyExit = createVector(
      this.corridorX + this.corridorWidth + 20,
      this.corridorY + this.corridorHeight / 2
    );

    // Define gathering point
    this.gatheringPoint = createVector(width - 50, height - 50);
  }

  show() {
    // Draw office
    fill(220);
    stroke(0);
    rect(this.officeArea.x, this.officeArea.y, this.officeArea.width, this.officeArea.height);

    // Draw door opening
    fill(220); // Same color as the office
    noStroke();
    rect(this.door.x, this.door.y, this.door.width, this.door.height);

    // Draw corridor
    fill(220);
    stroke(0);
    rect(this.corridorX, this.corridorY, this.corridorWidth, this.corridorHeight);

    // Draw emergency exit
    fill(0, 255, 0);
    noStroke();
    ellipse(this.emergencyExit.x, this.emergencyExit.y, 20, 20);

    // Draw gathering point
    fill(0, 255, 0);
    noStroke();
    ellipse(this.gatheringPoint.x, this.gatheringPoint.y, 30, 30);
    fill(0);
    textAlign(CENTER, CENTER);
    text('Gathering Point', this.gatheringPoint.x, this.gatheringPoint.y - 20);

    // Draw walls
    for (let wall of this.walls) {
      wall.show();
    }
  }

  isInsideOffice(x, y) {
    // Base office boundaries
    let insideOffice =
      x > this.officeArea.x + 10 &&
      x < this.officeArea.x + this.officeArea.width - 10 &&
      y > this.officeArea.y + 10 &&
      y < this.officeArea.y + this.officeArea.height - 10;

    // During evacuation, include the door area
    if (this.evacuationStarted) {
      return insideOffice ;//|| this.isInDoorArea(x, y);
    } else {
      return insideOffice;
    }
  }

  isInDoorArea(x, y) {
    return (
      x > this.door.x &&
      x < this.door.x + this.door.width &&
      y > this.door.y &&
      y < this.door.y + this.door.height
    );
  }

  isInsideCorridor(x, y) {
    return (
      x > this.corridorX &&
      x < this.corridorX + this.corridorWidth &&
      y > this.corridorY &&
      y < this.corridorY + this.corridorHeight
    );
  }

  // getClosestPointOnPath(pos) {
  //   // For simplicity, returns the door position if in office, else emergency exit
  //   if (this.isInsideOffice(pos.x, pos.y)) {
  //     return createVector(this.door.x + this.door.width / 2, this.door.y + this.door.height / 2);
  //   } else if (this.isInsideCorridor(pos.x, pos.y)) {
  //     return createVector(this.emergencyExit.x, this.emergencyExit.y);
  //   } else {
  //     return this.gatheringPoint.copy();
  //   }
  // }

  getClosestPointOnPath(pos) {
    // If inside the office, return the door position
    if (this.isInsideOffice(pos.x, pos.y)) {
      return createVector(this.door.x + this.door.width / 2, this.door.y + this.door.height / 2);
    } else if (this.isInsideCorridor(pos.x, pos.y)) {
      // If inside the corridor, return the emergency exit
      return createVector(this.emergencyExit.x, this.emergencyExit.y);
    } else {
      // Outside both office and corridor: return a point inside the office.
      // For simplicity, return the center of the office area:
      let officeCenterX = this.officeArea.x + this.officeArea.width / 2;
      let officeCenterY = this.officeArea.y + this.officeArea.height / 2;
      return createVector(officeCenterX, officeCenterY);
    }
  }
  

  getLeaderPath() {
    // Path from the office door through the corridor to the emergency exit and then to the gathering point
    return [
      createVector(this.door.x + this.door.width / 2, this.door.y + this.door.height / 2), // Starting at the door
      createVector(this.emergencyExit.x, this.emergencyExit.y), // Emergency exit
      this.gatheringPoint, // Gathering point
    ];
  }

  getPathToGatheringPoint(pos) {
    let path = [];

    if (this.isInsideOffice(pos.x, pos.y)) {
      // Path to the door
      path.push(createVector(this.door.x + this.door.width / 2, this.door.y + this.door.height / 2));
    }

    if (this.isInsideOffice(pos.x, pos.y) || this.isInsideCorridor(pos.x, pos.y)) {
      // Path to the emergency exit
      path.push(createVector(this.emergencyExit.x, this.emergencyExit.y));
    }

    // Path to the gathering point
    path.push(this.gatheringPoint.copy());

    return path;
  }
}
