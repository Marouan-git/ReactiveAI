let employees = [];
let leader;
let fires = [];
let environment;
let behaviorManager;

let speedSlider, forceSlider;
let speedLabel, forceLabel;

let wanderRadiusSlider, wanderDistanceSlider, wanderChangeSlider;
let wanderRadiusLabel, wanderDistanceLabel, wanderChangeLabel;

let obstacleAvoidanceWeightSlider, fireAvoidanceWeightSlider, stayInBoundsWeightSlider;
let obstacleAvoidanceWeightLabel, fireAvoidanceWeightLabel, stayInBoundsWeightLabel;

let separationStrengthSlider, separationStrengthLabel;
let leaderFollowWeightSlider, leaderFollowWeightLabel;

// Button for restarting simulation
let restartButton;

// Buttons for toggling behaviors globally (except leader)
let behaviorNames = ['stayInBounds', 'obstacleAvoidance', 'fireAvoidance', 'separation', 'followLeader'];
let behaviorButtons = [];

// Button for toggling leader follow-mouse
let leaderControlButton;
let leaderFollowMouse = false; // Flag to track leader follow mouse mode

function setup() {
  createCanvas(1300, 700);

  setupSimulation();

  // -----------------------------------
  // Initialize Sliders and Their Labels
  // -----------------------------------
  speedSlider = createSlider(0.5, 5, 2.5, 0.1);
  speedSlider.position(20, height - 220);
  speedLabel = createP('Employee Speed');
  speedLabel.position(20, height - 240);

  forceSlider = createSlider(0.05, 1, 0.7, 0.01);
  forceSlider.position(20, height - 190);
  forceLabel = createP('Employee Force');
  forceLabel.position(20, height - 210);

  wanderRadiusSlider = createSlider(5, 50, 25, 1);
  wanderRadiusSlider.position(20, height - 160);
  wanderRadiusLabel = createP('Wander Radius');
  wanderRadiusLabel.position(20, height - 180);

  wanderDistanceSlider = createSlider(10, 100, 50, 1);
  wanderDistanceSlider.position(20, height - 130);
  wanderDistanceLabel = createP('Wander Distance');
  wanderDistanceLabel.position(20, height - 150);

  wanderChangeSlider = createSlider(0.1, 1, 0.3, 0.01);
  wanderChangeSlider.position(20, height - 100);
  wanderChangeLabel = createP('Wander Change');
  wanderChangeLabel.position(20, height - 120);

  obstacleAvoidanceWeightSlider = createSlider(0, 5, 2, 0.1);
  obstacleAvoidanceWeightSlider.position(200, height - 220);
  obstacleAvoidanceWeightLabel = createP('Obstacle Avoidance Weight');
  obstacleAvoidanceWeightLabel.position(200, height - 240);

  fireAvoidanceWeightSlider = createSlider(0, 5, 1.5, 0.1);
  fireAvoidanceWeightSlider.position(200, height - 190);
  fireAvoidanceWeightLabel = createP('Fire Avoidance Weight');
  fireAvoidanceWeightLabel.position(200, height - 210);

  stayInBoundsWeightSlider = createSlider(0, 7, 5, 0.1);
  stayInBoundsWeightSlider.position(200, height - 160);
  stayInBoundsWeightLabel = createP('Stay In Bounds Weight');
  stayInBoundsWeightLabel.position(200, height - 180);

  separationStrengthSlider = createSlider(0, 5, 3, 0.1);
  separationStrengthSlider.position(200, height - 130);
  separationStrengthLabel = createP('Separation Strength');
  separationStrengthLabel.position(200, height - 150);

  leaderFollowWeightSlider = createSlider(0, 3, 1, 0.1);
  leaderFollowWeightSlider.position(200, height - 100);
  leaderFollowWeightLabel = createP('Leader Follow Weight');
  leaderFollowWeightLabel.position(200, height - 120);

  // -----------------------------------
  // Restart Simulation Button
  // -----------------------------------
  restartButton = createButton('Restart Simulation');
  restartButton.position(980, height - 400);
  restartButton.mousePressed(restartSimulation);

  // -----------------------------------
  // Behavior Toggle Buttons (Global)
  // -----------------------------------
  for (let i = 0; i < behaviorNames.length; i++) {
    let behaviorName = behaviorNames[i];
    let btn = createButton(behaviorName);
    btn.position(400, height - 240 + i * 30);
    btn.mousePressed(() => toggleBehaviorForAll(behaviorName));
    behaviorButtons.push(btn);
  }

  // -----------------------------------
  // Leader Control Button
  // -----------------------------------
  leaderControlButton = createButton('Toggle Leader Follow Mouse');
  leaderControlButton.position(980, height - 370);
  leaderControlButton.mousePressed(toggleLeaderControl);
  leaderControlButton.style('background-color', 'red');

  // -----------------------------------
  // Style the labels
  // -----------------------------------
  let labels = [
    speedLabel,
    forceLabel,
    wanderRadiusLabel,
    wanderDistanceLabel,
    wanderChangeLabel,
    obstacleAvoidanceWeightLabel,
    fireAvoidanceWeightLabel,
    stayInBoundsWeightLabel,
    separationStrengthLabel,
    leaderFollowWeightLabel,
  ];
  for (let label of labels) {
    label.style('color', '#000');
    label.style('font-size', '12px');
  }

  // -----------------------------------
  // Instructions
  // -----------------------------------
  let instructions = createDiv();
  instructions.html(`
    <h4>Instructions:</h4>
    <ul>
      <li><strong>Add Fires:</strong> Click inside the office area to place a fire (which triggers evacuation if not already started).</li>
      <li><strong>Global Behaviors:</strong> Click a behavior button to toggle it <em>for all employees but the leader</em>.</li>
      <li><strong>Leader Control:</strong> Use "Toggle Leader Follow Mouse" to let the leader chase your mouse, or revert to its original behavior.</li>
      <li><strong>Evacuation Logic (When Fire Appears):</strong> 
        <ul>
          <li>The leader uses path-following out of the building.</li>
          <li>All non-leaders follow the leader once evacuation starts.</li>
        </ul>
      </li>
    </ul>
  `);
  instructions.position(980, height - 700);
  instructions.style('background', '#FFF');
  instructions.style('padding', '10px');
  instructions.style('border', '1px solid #000');
  instructions.style('width', '300px');
  instructions.style('font-size', '12px');

  // Update button coloring initially
  updateBehaviorButtonsForAll();
}

function draw() {
  background(200);

  // Update sliders
  let maxSpeed = speedSlider.value();
  let maxForce = forceSlider.value();

  // Update behavior parameters
  behaviorManager.behaviors['wander'].wanderRadius = wanderRadiusSlider.value();
  behaviorManager.behaviors['wander'].wanderDistance = wanderDistanceSlider.value();
  behaviorManager.behaviors['wander'].wanderChange = wanderChangeSlider.value();

  behaviorManager.behaviors['followLeader'].weight = leaderFollowWeightSlider.value();

  behaviorManager.behaviors['obstacleAvoidance'].weight = obstacleAvoidanceWeightSlider.value();
  behaviorManager.behaviors['fireAvoidance'].weight = fireAvoidanceWeightSlider.value();
  behaviorManager.behaviors['stayInBounds'].weight = stayInBoundsWeightSlider.value();
  behaviorManager.behaviors['separation'].weight = separationStrengthSlider.value();

  // Draw environment
  environment.show();

  // Update & draw fires
  for (let fire of fires) {
    fire.show();
  }

  // Update employees via behavior manager
  behaviorManager.fires = fires; // pass fires to manager
  behaviorManager.updateBehaviors(maxSpeed, maxForce);

  // If the leader has arrived at the gathering point, disable separation for everyone
  if (leader.inGatheringPoint) {
    behaviorManager.disableBehaviorForAll('separation');
  }

  // Draw employees
  for (let employee of employees) {
    employee.show();
  }

  // Check if all employees have reached the gathering point
  if (employees.every((emp) => emp.inGatheringPoint)) {
    noLoop();
    fill(0, 255, 0);
    textSize(32);
    textAlign(CENTER, CENTER);
    text('All employees have evacuated!', width / 2, height / 2);
  }
}

// --------------------------------------------------------
// Mouse Pressed: Add a Fire if inside the Office
// --------------------------------------------------------
function mousePressed() {
  // Add a fire at the mouse position if inside the office area
  if (environment.isInsideOffice(mouseX, mouseY)) {
    let fire = new Fire(mouseX, mouseY);
    fires.push(fire);

    // Start evacuation
    environment.evacuationStarted = true;
    leader.startEvacuation(environment);
    for (let emp of employees) {
      if (!emp.isLeader) {
        emp.startEvacuation(leader);
      }
    }

    // Force an update to button colors in case some behaviors changed
    updateBehaviorButtonsForAll();
  }
}

// --------------------------------------------------------
// Restart Simulation
// --------------------------------------------------------
function restartSimulation() {
  fires = [];
  employees = [];
  behaviorManager = new BehaviorManager();

  // Reset the global toggles
  leaderFollowMouse = false;

  setupSimulation();
  loop(); // resume draw loop

  leaderControlButton.style('background-color', 'red');

  // Force button color update after restart
  updateBehaviorButtonsForAll();
}

// --------------------------------------------------------
// Setup Simulation (Office, Employees, Leader, etc.)
// --------------------------------------------------------
function setupSimulation() {
  environment = new Environment();
  behaviorManager = new BehaviorManager();

  // Create employees
  let numEmployees = 15;
  for (let i = 0; i < numEmployees; i++) {
    let x = random(
      environment.officeArea.x + 20,
      environment.officeArea.x + environment.officeArea.width - 20
    );
    let y = random(
      environment.officeArea.y + 20,
      environment.officeArea.y + environment.officeArea.height - 20
    );

    // Ensure the employee is inside the office
    while (!environment.isInsideOffice(x, y)) {
      x = random(
        environment.officeArea.x + 20,
        environment.officeArea.x + environment.officeArea.width - 20
      );
      y = random(
        environment.officeArea.y + 20,
        environment.officeArea.y + environment.officeArea.height - 20
      );
    }

    let employee = new Employee(x, y, environment);

    // Default main behavior is wander (pre-evacuation)
    employee.behavior = 'wander';

    // Enable 'wander', 'stayInBounds', 'obstacleAvoidance', 'separation' from the start
    employee.enabledBehaviors = ['wander','stayInBounds', 'obstacleAvoidance', 'separation'];

    behaviorManager.addEmployee(employee);
    employees.push(employee);
  }

  // Pick a random leader
  let leaderIndex = floor(random(employees.length));
  leader = employees[leaderIndex];
  leader.isLeader = true;
  leader.queueIndex = 0; // Leader is queueIndex=0

  // Assign queueIndex to others based on array order or something simple
  // e.g. everyone else from 1..N
  let qIdx = 1;
  for (let emp of employees) {
    if (!emp.isLeader) {
      emp.queueIndex = qIdx;
      qIdx++;
    }
  }
}

// --------------------------------------------------------
// Toggle Behavior for ALL employees except the leader
//   and set the button color accordingly
// --------------------------------------------------------
function toggleBehaviorForAll(behaviorName) {
  // If ALL employees (except leader) already have this behavior, remove it
  // Otherwise, add it
  let allHaveIt = isBehaviorEnabledForAll(behaviorName);

  for (let emp of employees) {
    if (emp.isLeader) continue; // skip the leader

    let index = emp.enabledBehaviors.indexOf(behaviorName);

    // If toggling followLeader => set leader pointer
    if (behaviorName === 'followLeader') {
      emp.leader = leader;
      // Also remove wander for stronger queue follow (optional)
    }

    if (allHaveIt) {
      // Everyone already has it => remove it
      if (index !== -1) {
        emp.enabledBehaviors.splice(index, 1);
      }
      // If that was their main behavior, revert to wander
      if (emp.behavior === behaviorName) {
        emp.behavior = 'wander';
        if (!emp.enabledBehaviors.includes('wander')) {
          emp.enabledBehaviors.push('wander');
        }
      }
    } else {
      // Not everyone has it => add it
      if (index === -1) {
        emp.enabledBehaviors.push(behaviorName);
      }
      // If it's followLeader, also set it as main
      if (behaviorName === 'followLeader') {
        emp.behavior = 'followLeader';
        // Remove wander if we want them to focus on following
        let wIndex = emp.enabledBehaviors.indexOf('wander');
        if (wIndex !== -1) {
          emp.enabledBehaviors.splice(wIndex, 1);
        }
      }
    }
  }

  // Refresh button colors
  updateBehaviorButtonsForAll();
}

// --------------------------------------------------------
// Check if a specific behavior is enabled for ALL employees
// except the leader
// --------------------------------------------------------
function isBehaviorEnabledForAll(behaviorName) {
  for (let emp of employees) {
    if (emp.isLeader) continue;
    if (!emp.enabledBehaviors.includes(behaviorName)) {
      return false;
    }
  }
  return true;
}

// --------------------------------------------------------
// Update all behavior buttons (green if the behavior
// is enabled for all employees except leader, red otherwise)
// --------------------------------------------------------
function updateBehaviorButtonsForAll() {
  for (let i = 0; i < behaviorNames.length; i++) {
    let behaviorName = behaviorNames[i];
    let btn = behaviorButtons[i];

    if (isBehaviorEnabledForAll(behaviorName)) {
      btn.style('background-color', 'green');
    } else {
      btn.style('background-color', 'red');
    }
  }
}

// --------------------------------------------------------
// Toggle Leader Follow-Mouse
// --------------------------------------------------------
function toggleLeaderControl() {
  leaderFollowMouse = !leaderFollowMouse;

  if (leaderFollowMouse) {
    // Switch leader to 'followMouse'
    leader.behavior = 'followMouse';
    leader.enabledBehaviors = []; // remove conflicts

    leaderControlButton.style('background-color', 'green');
  } else {
    // Revert leader to normal
    if (environment.evacuationStarted) {
      // If evacuation has started => pathFollowing
      leader.behavior = 'pathFollowing';
      leader.enabledBehaviors = ['obstacleAvoidance', 'fireAvoidance', 'separation'];
    } else {
      // Pre-evacuation => wander + in-bounds + obstacle + separation
      leader.behavior = 'wander';
      leader.enabledBehaviors = ['wander', 'stayInBounds', 'obstacleAvoidance', 'separation'];
    }
    leaderControlButton.style('background-color', 'red');
  }
}
