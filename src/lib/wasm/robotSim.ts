/**
 * Robot Simulation Module
 * 
 * 逆運動学・軌道生成のTypeScript実装
 * C++ WASMがビルドされた場合は将来的に置き換え可能
 */

export interface JointAngles {
  theta: number[];
}

export interface MotionParams {
  maxVelocity: number[];
  maxAcceleration: number[];
  maxJerk: number[];
}

export interface TrajectoryPoint {
  time: number;
  position: number[];
  velocity: number[];
  acceleration: number[];
}

/**
 * Initialize the robot simulation module
 */
export async function initRobotSim(): Promise<void> {
  console.log("[RobotSim] Initialized (JavaScript implementation)");
}

/**
 * Generate trajectory using S-curve velocity profile
 */
export function generateTrajectory(
  start: number[],
  end: number[],
  params: MotionParams,
  dt: number = 0.01
): TrajectoryPoint[] {
  const trajectory: TrajectoryPoint[] = [];

  // Calculate duration based on velocity limits
  let maxDuration = 0;
  for (let i = 0; i < 6; i++) {
    const distance = Math.abs(end[i] - start[i]);
    const maxVel = params.maxVelocity[i];
    const maxAcc = params.maxAcceleration[i];

    const tAcc = maxVel / maxAcc;
    const dAcc = 0.5 * maxAcc * tAcc * tAcc;

    let duration: number;
    if (2 * dAcc > distance) {
      duration = 2 * Math.sqrt(distance / maxAcc);
    } else {
      const tCruise = (distance - 2 * dAcc) / maxVel;
      duration = 2 * tAcc + tCruise;
    }

    maxDuration = Math.max(maxDuration, duration);
  }

  // Ensure minimum duration
  if (maxDuration < dt) {
    maxDuration = dt * 2;
  }

  // Generate synchronized trajectory
  for (let t = 0; t <= maxDuration; t += dt) {
    const point: TrajectoryPoint = {
      time: t,
      position: [],
      velocity: [],
      acceleration: [],
    };

    for (let i = 0; i < 6; i++) {
      const ratio = Math.min(t / maxDuration, 1);
      // S-curve interpolation (smoothstep)
      const smoothRatio = ratio * ratio * (3 - 2 * ratio);

      point.position.push(start[i] + (end[i] - start[i]) * smoothRatio);
      point.velocity.push(0);
      point.acceleration.push(0);
    }

    trajectory.push(point);
  }

  return trajectory;
}

/**
 * Solve inverse kinematics for target position
 */
export function solveInverseKinematics(
  position: [number, number, number],
  _rotation: number[][]
): JointAngles[] {
  const solutions: JointAngles[] = [];

  // Simplified IK solution for demonstration
  const theta1 = Math.atan2(position[1], position[0]);

  // Primary solution
  solutions.push({
    theta: [theta1, -0.5, 0.8, 0, 0.3, 0],
  });

  // Mirror solution
  solutions.push({
    theta: [theta1 + Math.PI, 0.5, -0.8, Math.PI, -0.3, Math.PI],
  });

  return solutions;
}

/**
 * Check if WASM is being used (always false for JS implementation)
 */
export function isWasmEnabled(): boolean {
  return false;
}
