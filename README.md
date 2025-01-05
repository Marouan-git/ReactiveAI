# Steering behaviors 

Marouan Boulli - Master MIAGE IA2


# Fire Evacuation Simulation

## Introduction

This simulation demonstrates a simplified *fire evacuation scenario* using **p5.js**.  
Its goals are:
1. **Practice steering behaviors** (wander, follow, avoidance, etc.).
2. Illustrate a **leader-follower** evacuation approach.
3. Provide an **interactive** interface to toggle different steering behaviors globally.

## How It Works

1. **Office and Corridor Setup**  
   - The office area is defined in an `Environment` class, along with corridor walls, an emergency exit, and a gathering point.

2. **Employees**  
   - A number of employees (or “agents”) are placed randomly inside the office. One of them is chosen as the **leader**.
   - Each employee has:
     - A position, velocity, and acceleration.
     - A main (primary) behavior (e.g. `wander`, `followLeader`, `followMouse`, etc.).
     - A list of *enabled* behaviors (like `fireAvoidance`, `stayInBounds`, etc.) applied each frame.

3. **Evacuation Trigger**  
   - When you **click** inside the office, a **Fire** object is created. This starts the evacuation if not already started.
   - The leader uses **`pathFollowing`** to move toward the corridor, exit, and eventually the gathering point.
   - Non-leader employees use **`followLeader`** to queue up behind the leader and escape.

4. **Behaviors UI**  
   - Sliders let you tune the max speed, force, and specific behavior weights. The weights values are initialized so it works fine, but you can experiment if you want...
   - **Behavior toggle buttons** (e.g., `stayInBounds`, `obstacleAvoidance`, etc.) turn green if **all** non-leader employees have that behavior, and red otherwise.
   - A “**Toggle Leader Follow Mouse**” button allows manual control of the leader’s position:
     - **Green** if the leader is currently following the mouse.
     - **Red** if the leader is in a normal or evacuation mode.  
You can use this button if you want to experiment the FollowLeader behavior, and for instance observe the interaction with the StayInBounds behavior : if you make the leader go outside the office, the other employees will try to follow him but will stay inside the office ; if you change the behavior weights you may observe something different...


5. **Ending Condition**  
   - Once **all** employees reach the gathering point, the simulation stops. You can restart it by clicking on the restart button.

## Behaviors Implemented

All behaviors are implemented in a BehaviorManager.

### 1. **Idle Behavior**  
   - The agent sets velocity and acceleration to **0**. Essentially, it does nothing.

### 2. **Wander Behavior**  
   - The agent picks a small random offset around a circle in front of it and steers toward that point.  
   - Parameters:
     - `wanderRadius`: radius of the imaginary circle around which the agent wanders.
     - `wanderDistance`: how far ahead the circle is from the agent.
     - `wanderChange`: how much randomness is added each frame.

### 3. **Path Following**  
   - The agent has a list of **waypoints** (like door, corridor exit, gathering point).
   - It seeks the next waypoint; upon reaching it, it moves to the next until done.

### 4. **FollowLeader Behavior**  
   - Used by non-leader employees in a queue style.  
   - Each employee (except the leader) finds the agent with `queueIndex = theirQueueIndex - 1` (or the leader if queueIndex=0).  
   - It positions itself behind that target, using velocity offsets.  
   - This produces a “queue” behind the leader or behind the next agent in the chain.
   - If the leader tries to pass through the followers, they let him pass.

### 5. **Obstacle Avoidance**  
   - The agent checks nearby **walls** in the environment.
   - If close, it steers away from them. This prevents employees from walking through walls.

### 6. **Fire Avoidance**  
   - If a Fire is present, the agent moves away from it.  
   - The closer the agent is, the stronger it repels.

### 7. **Stay In Bounds**  
   - If the agent goes outside the defined office/corridor area, it steers back toward the nearest valid point.  
   - Prevents wandering infinitely off-screen.

### 8. **Separation**  
   - If agents are too close, they push away from each other.  
   - This avoids big clusters or collisions.

### 9. **FollowMouse**  
   - Specially for the **leader** if toggled. The leader seeks the mouse location each frame, allowing manual steering.

## Running the Simulation

1. **Open** the `index.html` (or your p5.js hosting setup).
2. **Observe** employees wandering in the office.
3. **Click** inside the office to start a fire:
   - The leader heads for the exit, others follow the leader in a queue.
4. **Toggle** behaviors with the buttons (green = all employees but the leader have that behavior; red = not all have it).
5. **Use** “Toggle Leader Follow Mouse” to manually control the leader.
6. **Adjust** the sliders (speeds, forces, behavior weights) to see different dynamics.
7. **Wait** until all employees reach the gathering point to end the simulation.

If you want to experiment the different behaviors, I suggest you do it before starting a fire.