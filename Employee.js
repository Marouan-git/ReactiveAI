class Employee {
  constructor(x, y, environment) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 2;
    this.maxForce = 1;
    this.r = 8;

    this.environment = environment; // Reference to the environment

    this.selected = false;

    this.isLeader = false;
    this.behavior = 'wander'; // Start with 'wander' behavior

    // Enable 'stayInBounds' and 'obstacleAvoidance' behaviors from the start
    this.enabledBehaviors = ['stayInBounds', 'obstacleAvoidance'];

    this.path = null;
    this.inGatheringPoint = false;
    this.passedEmergencyExit = false;

    // For wander behavior
    this.wanderTheta = 0;
  }

  applyForce(force) {
    this.acc.add(force);
  }

  startEvacuation(leaderOrEnvironment) {
    if (this.isLeader) {
      this.behavior = 'pathFollowing';
      this.path = leaderOrEnvironment.getLeaderPath();
      this.isWaiting = false;
    } else {
      // All non-leaders follow the leader, no path following
      this.behavior = 'followLeader';
      this.leader = leaderOrEnvironment;
      this.isWaiting = false;
    }
  
    // Enable additional behaviors
    const behaviorsToAdd = ['fireAvoidance', 'separation', 'followLeader'];
    for (let behavior of behaviorsToAdd) {
      if (!this.enabledBehaviors.includes(behavior)) {
        this.enabledBehaviors.push(behavior);
      }
    }
    // Remove 'stayInBounds' behavior
    console.log(this.enabledBehaviors);
    let index = this.enabledBehaviors.indexOf('stayInBounds');
    if (index !== -1) {
      this.enabledBehaviors.splice(index, 1);
    }

  }
  

  updatePosition() {
    if (this.inGatheringPoint) {
      // Stop moving
      this.vel.mult(0);
      this.acc.mult(0);
      return;
    }

    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);

    this.checkIfInGatheringPoint();
    this.checkIfPassedEmergencyExit();
  }

  checkIfInGatheringPoint() {
    if (this.inGatheringPoint) return;

    let d = p5.Vector.dist(this.pos, this.environment.gatheringPoint);
    if (d < 50) {
      this.inGatheringPoint = true;
      this.behavior = 'idle';
      this.vel.mult(0);
      this.acc.mult(0);
    }
  }



  show() {
    if (this.selected) {
      fill(255, 255, 0); // Yellow for selected employee
    } else if (this.isLeader) {
      fill(0, 0, 255); // Blue for leader
    } else {
      fill(255); // White for others
    }
    stroke(0);
    ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);
  }

  checkIfPassedEmergencyExit() {
    if (this.passedEmergencyExit) return;
  
    let d = p5.Vector.dist(this.pos, this.environment.emergencyExit);
    if (d < 20) {
      this.passedEmergencyExit = true;
      let index = this.enabledBehaviors.indexOf('stayInBounds');
      if (index !== -1) {
        this.enabledBehaviors.splice(index, 1);
      }
      if (this.selected) {
        updateBehaviorButtons();
      }
    }
  }
}