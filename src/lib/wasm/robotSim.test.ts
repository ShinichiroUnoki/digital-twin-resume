import { describe, it, expect } from "vitest";
import {
  generateTrajectory,
  solveInverseKinematics,
  isWasmEnabled,
  initRobotSim,
  type MotionParams,
} from "./robotSim";

// 共通テストパラメータ — 6軸ロボットの標準的な速度・加速度・ジャーク制約
const defaultParams: MotionParams = {
  maxVelocity: [1, 1, 1, 1, 1, 1],
  maxAcceleration: [2, 2, 2, 2, 2, 2],
  maxJerk: [5, 5, 5, 5, 5, 5],
};

// generateTrajectory: S-curve補間による軌道生成の動作検証
describe("generateTrajectory — 軌道生成の検証", () => {
  it("開始位置と終了位置が正しく補間されること", () => {
    const start = [0, 0, 0, 0, 0, 0];
    const end = [1, 2, 3, 4, 5, 6];
    const trajectory = generateTrajectory(start, end, defaultParams);

    // 最初のポイントが開始位置
    for (let i = 0; i < 6; i++) {
      expect(trajectory[0].position[i]).toBeCloseTo(start[i], 5);
    }

    // 最後のポイントが終了位置に近い
    const last = trajectory[trajectory.length - 1];
    for (let i = 0; i < 6; i++) {
      expect(last.position[i]).toBeCloseTo(end[i], 1);
    }
  });

  it("dtパラメータが軌道点数に影響すること", () => {
    const start = [0, 0, 0, 0, 0, 0];
    const end = [1, 1, 1, 1, 1, 1];

    const trajSmallDt = generateTrajectory(start, end, defaultParams, 0.01);
    const trajLargeDt = generateTrajectory(start, end, defaultParams, 0.1);

    // dtが小さいほど点数が多い
    expect(trajSmallDt.length).toBeGreaterThan(trajLargeDt.length);
  });

  it("距離0（同一位置）の場合でも空でない軌道が返ること", () => {
    const pos = [1, 2, 3, 4, 5, 6];
    const trajectory = generateTrajectory(pos, pos, defaultParams);

    expect(trajectory.length).toBeGreaterThan(0);
    // 全ポイントが開始位置と同一
    for (const point of trajectory) {
      for (let i = 0; i < 6; i++) {
        expect(point.position[i]).toBeCloseTo(pos[i], 5);
      }
    }
  });

  it("各軌道ポイントが time, position, velocity, acceleration を持つこと", () => {
    const start = [0, 0, 0, 0, 0, 0];
    const end = [1, 1, 1, 1, 1, 1];
    const trajectory = generateTrajectory(start, end, defaultParams);

    for (const point of trajectory) {
      expect(point).toHaveProperty("time");
      expect(point).toHaveProperty("position");
      expect(point).toHaveProperty("velocity");
      expect(point).toHaveProperty("acceleration");
      expect(point.position).toHaveLength(6);
    }
  });
});

// solveInverseKinematics: 逆運動学ソルバーの動作検証
describe("solveInverseKinematics — 逆運動学の検証", () => {
  const identityRotation = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];

  it("2つのソリューション（primary + mirror）が返ること", () => {
    const solutions = solveInverseKinematics([1, 0, 0], identityRotation);
    expect(solutions).toHaveLength(2);
    expect(solutions[0].theta).toHaveLength(6);
    expect(solutions[1].theta).toHaveLength(6);
  });

  it("theta1がatan2(y, x)で計算されていること", () => {
    const x = 3;
    const y = 4;
    const expectedTheta1 = Math.atan2(y, x);
    const solutions = solveInverseKinematics([x, y, 0], identityRotation);

    expect(solutions[0].theta[0]).toBeCloseTo(expectedTheta1, 10);
  });

  it("mirrorソリューションのtheta1がPI分ずれていること", () => {
    const solutions = solveInverseKinematics([1, 1, 0], identityRotation);
    const diff = Math.abs(solutions[1].theta[0] - solutions[0].theta[0]);
    expect(diff).toBeCloseTo(Math.PI, 10);
  });

  it("原点(0,0,0)のエッジケースでもエラーなく結果が返ること", () => {
    const solutions = solveInverseKinematics([0, 0, 0], identityRotation);
    expect(solutions).toHaveLength(2);
    // atan2(0, 0) = 0
    expect(solutions[0].theta[0]).toBeCloseTo(0, 10);
  });
});

// isWasmEnabled / initRobotSim: モジュール初期化の検証
describe("モジュール初期化の検証", () => {
  it("isWasmEnabled は JS実装のため false を返すこと", () => {
    expect(isWasmEnabled()).toBe(false);
  });

  it("initRobotSim がエラーなく初期化されること", async () => {
    await expect(initRobotSim()).resolves.toBeUndefined();
  });
});
