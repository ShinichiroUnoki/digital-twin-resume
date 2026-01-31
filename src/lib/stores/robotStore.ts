import { create } from "zustand";

// ロボットの動作状態
export type RobotState =
  | "idle"
  | "approach"
  | "grip"
  | "lift"
  | "move"
  | "place"
  | "return";

// モーションパラメータ
export interface MotionParams {
  velocity: number; // m/s (0.1 - 2.0)
  acceleration: number; // m/s² (0.1 - 1.5)
  trajectoryType: "linear" | "curved";
  gripForce: number; // % (10 - 100)
  approachOffset: number; // mm (0 - 50)
}

// 軌道ポイント
export interface TrajectoryPoint {
  time: number;
  position: number[];
  velocity: number[];
}

// ビジョンシステム情報
export interface VisionData {
  objectId: string;
  position: [number, number, number];
  rotation: [number, number, number];
  confidence: number;
  detected: boolean;
}

// シミュレーション統計
export interface SimulationStats {
  cycleTime: number;
  successCount: number;
  totalCount: number;
}

interface RobotStore {
  // 状態
  robotState: RobotState;
  isRunning: boolean;
  motionParams: MotionParams;
  trajectory: TrajectoryPoint[];
  visionData: VisionData;
  stats: SimulationStats;
  gripperPosition: [number, number, number]; // グリッパーのワールド座標

  // アクション
  setRobotState: (state: RobotState) => void;
  setIsRunning: (running: boolean) => void;
  setMotionParams: (params: Partial<MotionParams>) => void;
  setTrajectory: (trajectory: TrajectoryPoint[]) => void;
  setVisionData: (data: Partial<VisionData>) => void;
  setGripperPosition: (pos: [number, number, number]) => void;
  incrementSuccess: () => void;
  resetStats: () => void;
  reset: () => void;
}

const defaultMotionParams: MotionParams = {
  velocity: 1.0,
  acceleration: 0.8,
  trajectoryType: "linear",
  gripForce: 80,
  approachOffset: 20,
};

const defaultVisionData: VisionData = {
  objectId: "Box_001",
  position: [150, 200, 50],
  rotation: [0, 0, 45],
  confidence: 98.5,
  detected: true,
};

const defaultStats: SimulationStats = {
  cycleTime: 0,
  successCount: 0,
  totalCount: 0,
};

export const useRobotStore = create<RobotStore>((set) => ({
  // 初期状態
  robotState: "idle",
  isRunning: false,
  motionParams: defaultMotionParams,
  trajectory: [],
  visionData: defaultVisionData,
  stats: defaultStats,
  gripperPosition: [0, 0, 0],

  // アクション
  setRobotState: (state) => set({ robotState: state }),

  setIsRunning: (running) => set({ isRunning: running }),

  setMotionParams: (params) =>
    set((state) => ({
      motionParams: { ...state.motionParams, ...params },
    })),

  setTrajectory: (trajectory) => set({ trajectory }),

  setVisionData: (data) =>
    set((state) => ({
      visionData: { ...state.visionData, ...data },
    })),

  setGripperPosition: (pos) => set({ gripperPosition: pos }),

  incrementSuccess: () =>
    set((state) => ({
      stats: {
        ...state.stats,
        successCount: state.stats.successCount + 1,
        totalCount: state.stats.totalCount + 1,
      },
    })),

  resetStats: () => set({ stats: defaultStats }),

  reset: () =>
    set({
      robotState: "idle",
      isRunning: false,
      motionParams: defaultMotionParams,
      trajectory: [],
      visionData: defaultVisionData,
      stats: defaultStats,
      gripperPosition: [0, 0, 0],
    }),
}));
