class BehaviorManager {
  constructor() {
    this.employees = [];
    this.fires = [];
    this.behaviors = {
      idle: new IdleBehavior(),
      wander: new WanderBehavior(),
      pathFollowing: new PathFollowingBehavior(),
      followLeader: new FollowLeaderBehavior(),
      obstacleAvoidance: new ObstacleAvoidanceBehavior(),
      fireAvoidance: new FireAvoidanceBehavior(),
      stayInBounds: new StayInBoundsBehavior(),
      separation: new SeparationBehavior(),
      followMouse: new FollowMouseBehavior(),
    };
  }

  addEmployee(employee) {
    this.employees.push(employee);
  }

  updateBehaviors(maxSpeed, maxForce) {
    for (let employee of this.employees) {
      employee.maxSpeed = maxSpeed;
      employee.maxForce = maxForce;

      // Reset acceleration
      employee.acc.mult(0);

      // Apply main behavior
      let mainBehavior = this.behaviors[employee.behavior];
      if (mainBehavior) {
        mainBehavior.apply(employee, this);
      }

      // Apply additional behaviors
      for (let behaviorName of employee.enabledBehaviors) {
        let behavior = this.behaviors[behaviorName];
        if (behavior) {
          behavior.apply(employee, this);
        }
      }

      employee.updatePosition();
    }
  }

  setBehaviorForAll(behaviorName, target = null) {
    for (let employee of this.employees) {
      employee.behavior = behaviorName;
      if (target) {
        employee.target = target.copy();
      }
    }
  }

  enableBehaviorForAll(behaviorName) {
    for (let employee of this.employees) {
      if (!employee.enabledBehaviors.includes(behaviorName)) {
        employee.enabledBehaviors.push(behaviorName);
      }
    }
  }

  disableBehaviorForAll(behaviorName) {
    for (let employee of this.employees) {
      let index = employee.enabledBehaviors.indexOf(behaviorName);
      if (index !== -1) {
        employee.enabledBehaviors.splice(index, 1);
      }
    }
  }

  enableBehaviorForEmployee(employee, behaviorName) {
    if (!employee.enabledBehaviors.includes(behaviorName)) {
      employee.enabledBehaviors.push(behaviorName);
    }
  }

  disableBehaviorForEmployee(employee, behaviorName) {
    let index = employee.enabledBehaviors.indexOf(behaviorName);
    if (index !== -1) {
      employee.enabledBehaviors.splice(index, 1);
    }
  }

}

// Base Behavior Class
class Behavior {
  apply(employee, behaviorManager) {
    // To be overridden by subclasses
  }
}

// Idle Behavior
class IdleBehavior extends Behavior {
  apply(employee, behaviorManager) {
    // Do nothing
    employee.vel.mult(0);
    employee.acc.mult(0);
  }
}

// Wander Behavior
class WanderBehavior extends Behavior {
  constructor() {
    super();
    this.wanderRadius = 25;
    this.wanderDistance = 50;
    this.wanderChange = 0.3;
    this.weight = 1;
  }

  apply(employee, behaviorManager) {
    let wanderForce = this.wander(employee);

    wanderForce.mult(this.weight);
    employee.applyForce(wanderForce);
  }

  wander(employee) {
    employee.wanderTheta += random(-this.wanderChange, this.wanderChange);

    let circlePos = employee.vel.copy();
    circlePos.setMag(this.wanderDistance);
    circlePos.add(employee.pos);

    let h = employee.vel.heading();

    let circleOffset = createVector(
      this.wanderRadius * cos(employee.wanderTheta + h),
      this.wanderRadius * sin(employee.wanderTheta + h)
    );

    let target = p5.Vector.add(circlePos, circleOffset);

    return this.seek(employee, target);
  }

  seek(employee, target) {
    let desired = p5.Vector.sub(target, employee.pos);
    desired.setMag(employee.maxSpeed);

    let steer = p5.Vector.sub(desired, employee.vel);
    steer.limit(employee.maxForce);
    return steer;
  }
}

// Path Following Behavior
class PathFollowingBehavior extends Behavior {
  constructor() {
    super();
    this.weight = 1;
  }

  apply(employee, behaviorManager) {
    let followForce = this.followPath(employee);

    if (followForce.mag() > 0) {
      followForce.normalize();
      followForce.mult(this.weight);
      employee.applyForce(followForce);
    }
  }

  followPath(employee) {
    if (!employee.path || employee.path.length === 0) {
      employee.behavior = 'idle';
      return createVector(0, 0);
    }

    let target = employee.path[0];
    let desired = p5.Vector.sub(target, employee.pos);
    let d = desired.mag();

    if (d < 10) {
      // Remove the reached waypoint
      employee.path.shift();
      if (employee.path.length === 0) {
        // Arrived at destination
        employee.behavior = 'idle';
      }
    }

    desired.setMag(employee.maxSpeed);
    let steer = p5.Vector.sub(desired, employee.vel);
    steer.limit(employee.maxForce);
    return steer;
  }
}







class FollowLeaderBehavior extends Behavior {
  constructor() {
    super();
    this.weight = 1;
  }

  apply(employee, behaviorManager) {
    // If this is the leader, do nothing
    if (employee.isLeader) return;

    // If we haven't assigned queueIndex or the array isn't sorted, do a safety check
    let allEmps = behaviorManager.employees;
    // The "leader" is queueIndex = 0 by design. Non-leaders are 1..N in queueIndex
    let targetEmp = null;

    if (employee.queueIndex > 0) {
      // Follow the employee with queueIndex = employee.queueIndex - 1
      targetEmp = allEmps.find(e => e.queueIndex === (employee.queueIndex - 1));
    } else {
      // If for some reason queueIndex is 0 but employee is not leader,
      // fallback to a leader pointer
      targetEmp = employee.leader;
    }

    if (!targetEmp) {
      // If no valid target, do nothing
      return;
    }

    // Standard "seek" approach behind the target
    let desired = p5.Vector.sub(targetEmp.pos, employee.pos);
    
    // create an offset behind the target based on target's velocity
    let offset = targetEmp.vel.copy();
    offset.setMag(-employee.r * 3); // distance behind
    let behindTarget = p5.Vector.add(targetEmp.pos, offset);
    
    desired = p5.Vector.sub(behindTarget, employee.pos);
    desired.setMag(employee.maxSpeed * 3);
    
    let steer = p5.Vector.sub(desired, employee.vel);
    steer.limit(employee.maxForce);
    steer.mult(this.weight);

    employee.applyForce(steer);
  }
}


// Obstacle Avoidance Behavior
class ObstacleAvoidanceBehavior extends Behavior {
  constructor() {
    super();
    this.weight = 1;
  }

  apply(employee, behaviorManager) {
    let obstacles = employee.environment.walls;
    let avoidForce = this.avoidObstacles(employee, obstacles);

    if (avoidForce.mag() > 0) {
      avoidForce.normalize();
      avoidForce.mult(this.weight);
      employee.applyForce(avoidForce);
    }
  }

  avoidObstacles(employee, obstacles) {
    let steer = createVector(0, 0);

    for (let obstacle of obstacles) {
      if (this.isNearWall(employee, obstacle)) {
        let closestPoint = obstacle.getClosestPoint(employee.pos);
        let diff = p5.Vector.sub(employee.pos, closestPoint);
        if (diff.mag() === 0) continue;
        diff.normalize();
        diff.div(diff.mag());
        steer.add(diff);
      }
    }

    steer.limit(employee.maxForce);
    return steer;
  }

  isNearWall(employee, wall) {
    let closestPoint = wall.getClosestPoint(employee.pos);
    let d = p5.Vector.dist(employee.pos, closestPoint);
    return d < employee.r + 5;
  }
}

// Fire Avoidance Behavior
class FireAvoidanceBehavior extends Behavior {
  constructor() {
    super();
    this.weight = 1.5;
  }

  apply(employee, behaviorManager) {
    let fires = behaviorManager.fires;
    if (!fires || fires.length === 0) return;

    let avoidForce = this.avoidFires(employee, fires);

    if (avoidForce.mag() > 0) {
      avoidForce.normalize();
      avoidForce.mult(this.weight);
      employee.applyForce(avoidForce);
    }
  }

  avoidFires(employee, fires) {
    let steer = createVector(0, 0);
    let total = createVector(0, 0);
    let count = 0;

    for (let fire of fires) {
      let d = p5.Vector.dist(employee.pos, fire.pos);
      if (d < fire.radius + employee.r + 10) {
        let diff = p5.Vector.sub(employee.pos, fire.pos);
        diff.normalize();
        diff.div(d); // Weight by distance
        total.add(diff);
        count++;
      }
    }

    if (count > 0) {
      total.div(count);
      total.setMag(employee.maxSpeed);
      steer = p5.Vector.sub(total, employee.vel);
      steer.limit(employee.maxForce);
    }

    return steer;
  }
}

// Stay In Bounds Behavior
class StayInBoundsBehavior extends Behavior {
  constructor() {
    super();
    this.weight = 3;
  }

  apply(employee, behaviorManager) {
    let steer = this.stayInBounds(employee);

    if (steer.mag() > 0) {
      steer.normalize();
      steer.mult(this.weight);
      employee.applyForce(steer);
    }
  }

  stayInBounds(employee) {
    let steer = createVector(0, 0);

    if (!employee.environment.isInsideOffice(employee.pos.x, employee.pos.y) &&
        !employee.environment.isInsideCorridor(employee.pos.x, employee.pos.y)) {
      // Steer back towards the closest point inside
      let closestPoint = employee.environment.getClosestPointOnPath(employee.pos);
      steer = p5.Vector.sub(closestPoint, employee.pos);
    }

    return steer;
  }
}


// Separation Behavior
class SeparationBehavior extends Behavior {
  constructor() {
    super();
    this.weight = 1;
  }

  apply(employee, behaviorManager) {
    let employees = behaviorManager.employees;
    let separateForce = this.separate(employee, employees);

    if (separateForce.mag() > 0) {
      separateForce.normalize();
      separateForce.mult(this.weight);
      employee.applyForce(separateForce);
    }
  }

  separate(employee, employees) {
    let desiredSeparation = employee.r * 2;
    let steer = createVector(0, 0);
    let count = 0;

    for (let other of employees) {
      if (other === employee) continue;

      let d = p5.Vector.dist(employee.pos, other.pos);
      if (d > 0 && d < desiredSeparation) {
        let diff = p5.Vector.sub(employee.pos, other.pos);
        diff.normalize();
        diff.div(d);
        steer.add(diff);
        count++;
      }
    }

    if (count > 0) {
      steer.div(count);
    }

    if (steer.mag() > 0) {
      steer.setMag(employee.maxSpeed);
      steer.sub(employee.vel);
      steer.limit(employee.maxForce);
    }
    return steer;
  }
}

class FollowMouseBehavior extends Behavior {
  apply(employee, manager) {
    let mousePos = createVector(mouseX, mouseY);
    let desired = p5.Vector.sub(mousePos, employee.pos);
    desired.setMag(employee.maxSpeed);
    let steer = p5.Vector.sub(desired, employee.vel);
    steer.limit(employee.maxForce);
    employee.applyForce(steer);
  }
}
