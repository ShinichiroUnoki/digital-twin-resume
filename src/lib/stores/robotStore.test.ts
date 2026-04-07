import { describe, it, expect, beforeEach } from "vitest";
import { useRobotStore } from "./robotStore";

// Zustand storeはモジュールスコープでシングルトンのため、テスト間で状態をリセット
beforeEach(() => {
  useRobotStore.getState().reset();
});

describe("robotStore — 初期状態の検証", () => {
  it("初期状態はidle・停止中であること", () => {
    const state = useRobotStore.getState();
    expect(state.robotState).toBe("idle");
    expect(state.isRunning).toBe(false);
  });

  it("デフォルトのモーションパラメータが設定されていること", () => {
    const { motionParams } = useRobotStore.getState();
    expect(motionParams.velocity).toBe(1.0);
    expect(motionParams.acceleration).toBe(0.8);
    expect(motionParams.trajectoryType).toBe("linear");
    expect(motionParams.gripForce).toBe(80);
    expect(motionParams.approachOffset).toBe(20);
  });
});

describe("robotStore — アクションの検証", () => {
  it("setRobotState で状態が変更されること", () => {
    useRobotStore.getState().setRobotState("approach");
    expect(useRobotStore.getState().robotState).toBe("approach");
  });

  it("setMotionParams で部分更新ができること", () => {
    useRobotStore.getState().setMotionParams({ velocity: 1.5 });
    const { motionParams } = useRobotStore.getState();
    // 変更した値が反映される
    expect(motionParams.velocity).toBe(1.5);
    // 変更していない値は保持される
    expect(motionParams.acceleration).toBe(0.8);
  });

  it("incrementSuccess でカウントが増加すること", () => {
    useRobotStore.getState().incrementSuccess();
    useRobotStore.getState().incrementSuccess();
    const { stats } = useRobotStore.getState();
    expect(stats.successCount).toBe(2);
    expect(stats.totalCount).toBe(2);
  });

  it("reset で初期状態に戻ること", () => {
    // 状態を変更
    useRobotStore.getState().setRobotState("grip");
    useRobotStore.getState().setIsRunning(true);
    useRobotStore.getState().incrementSuccess();
    // リセット
    useRobotStore.getState().reset();
    const state = useRobotStore.getState();
    expect(state.robotState).toBe("idle");
    expect(state.isRunning).toBe(false);
    expect(state.stats.successCount).toBe(0);
  });
});

// setVisionData / setGripperPosition / setTrajectory / resetStats の追加検証
describe("robotStore — 追加アクションの検証", () => {
  it("setVisionData で部分更新ができること", () => {
    useRobotStore.getState().setVisionData({ confidence: 75.0, objectId: "Box_002" });
    const { visionData } = useRobotStore.getState();
    // 変更した値が反映される
    expect(visionData.confidence).toBe(75.0);
    expect(visionData.objectId).toBe("Box_002");
    // 変更していない値は保持される
    expect(visionData.detected).toBe(true);
    expect(visionData.position).toEqual([150, 200, 50]);
  });

  it("setGripperPosition で座標が更新されること", () => {
    useRobotStore.getState().setGripperPosition([100, 200, 300]);
    const { gripperPosition } = useRobotStore.getState();
    expect(gripperPosition).toEqual([100, 200, 300]);
  });

  it("setTrajectory で軌道データが設定されること", () => {
    const trajectory = [
      { time: 0, position: [0, 0, 0], velocity: [0, 0, 0] },
      { time: 1, position: [1, 1, 1], velocity: [0.5, 0.5, 0.5] },
    ];
    useRobotStore.getState().setTrajectory(trajectory);
    expect(useRobotStore.getState().trajectory).toEqual(trajectory);
    expect(useRobotStore.getState().trajectory).toHaveLength(2);
  });

  it("resetStats でカウントのみリセットされること（他の状態は保持）", () => {
    // 状態を変更
    useRobotStore.getState().setRobotState("grip");
    useRobotStore.getState().setGripperPosition([50, 60, 70]);
    useRobotStore.getState().incrementSuccess();
    useRobotStore.getState().incrementSuccess();
    expect(useRobotStore.getState().stats.successCount).toBe(2);

    // statsのみリセット
    useRobotStore.getState().resetStats();

    // カウントはリセットされる
    const { stats } = useRobotStore.getState();
    expect(stats.successCount).toBe(0);
    expect(stats.totalCount).toBe(0);

    // 他の状態は保持される
    expect(useRobotStore.getState().robotState).toBe("grip");
    expect(useRobotStore.getState().gripperPosition).toEqual([50, 60, 70]);
  });
});
