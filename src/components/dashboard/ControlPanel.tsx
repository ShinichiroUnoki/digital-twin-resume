"use client";

import { useCallback, useEffect } from "react";
import { useRobotStore, RobotState } from "@/lib/stores/robotStore";

// スライダーコンポーネント
interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}

function Slider({ label, value, min, max, step, unit, onChange }: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-[var(--color-text-secondary)]">{label}</span>
        <span className="font-[var(--font-mono)] text-[var(--color-accent-primary)]">
          {value.toFixed(1)} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, var(--color-accent-primary) 0%, var(--color-accent-primary) ${percentage}%, var(--color-bg-tertiary) ${percentage}%, var(--color-bg-tertiary) 100%)`,
        }}
      />
    </div>
  );
}

// 状態表示バッジ
function StateBadge({ state }: { state: RobotState }) {
  const stateColors: Record<RobotState, string> = {
    idle: "var(--color-text-muted)",
    approach: "var(--color-status-info)",
    grip: "var(--color-status-warn)",
    lift: "var(--color-status-ok)",
    move: "var(--color-accent-primary)",
    place: "var(--color-status-warn)",
    return: "var(--color-status-info)",
  };

  return (
    <span
      className="px-2 py-0.5 rounded text-xs font-[var(--font-mono)] uppercase"
      style={{
        backgroundColor: `${stateColors[state]}20`,
        color: stateColors[state],
        border: `1px solid ${stateColors[state]}40`,
      }}
    >
      {state}
    </span>
  );
}

export default function ControlPanel() {
  const {
    robotState,
    isRunning,
    motionParams,
    stats,
    setRobotState,
    setIsRunning,
    setMotionParams,
    incrementSuccess,
  } = useRobotStore();

  // 状態遷移シーケンス
  const stateSequence: RobotState[] = [
    "idle",
    "approach",
    "grip",
    "lift",
    "move",
    "place",
    "return",
  ];

  // アニメーションループ
  const runAnimation = useCallback(() => {
    if (!isRunning) return;

    const currentIndex = stateSequence.indexOf(robotState);
    const nextIndex = (currentIndex + 1) % stateSequence.length;
    const nextState = stateSequence[nextIndex];

    // 状態遷移
    setTimeout(() => {
      setRobotState(nextState);

      // サイクル完了時
      if (nextState === "idle") {
        incrementSuccess();
      }
    }, 1000 / motionParams.velocity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, robotState, motionParams.velocity, setRobotState, incrementSuccess]);

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(runAnimation, 1500 / motionParams.velocity);
      return () => clearInterval(interval);
    }
  }, [isRunning, runAnimation, motionParams.velocity]);

  const handleRun = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setRobotState("idle");
  };

  const successRate =
    stats.totalCount > 0
      ? ((stats.successCount / stats.totalCount) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-[var(--font-display)] font-bold text-[var(--color-text-primary)]">
          Motion Parameters
        </h2>
        <StateBadge state={robotState} />
      </div>

      {/* Parameter Sliders */}
      <div className="space-y-3">
        <Slider
          label="Velocity"
          value={motionParams.velocity}
          min={0.1}
          max={2.0}
          step={0.1}
          unit="m/s"
          onChange={(v) => setMotionParams({ velocity: v })}
        />
        <Slider
          label="Acceleration"
          value={motionParams.acceleration}
          min={0.1}
          max={1.5}
          step={0.1}
          unit="m/s²"
          onChange={(v) => setMotionParams({ acceleration: v })}
        />
        <Slider
          label="Grip Force"
          value={motionParams.gripForce}
          min={10}
          max={100}
          step={5}
          unit="%"
          onChange={(v) => setMotionParams({ gripForce: v })}
        />
      </div>

      {/* Trajectory Type */}
      <div className="flex gap-2">
        <button
          onClick={() => setMotionParams({ trajectoryType: "linear" })}
          className={`flex-1 py-1.5 text-xs font-[var(--font-mono)] rounded border transition-colors ${
            motionParams.trajectoryType === "linear"
              ? "bg-[var(--color-accent-primary)] text-[var(--color-bg-primary)] border-[var(--color-accent-primary)]"
              : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-accent-primary)]"
          }`}
        >
          Linear
        </button>
        <button
          onClick={() => setMotionParams({ trajectoryType: "curved" })}
          className={`flex-1 py-1.5 text-xs font-[var(--font-mono)] rounded border transition-colors ${
            motionParams.trajectoryType === "curved"
              ? "bg-[var(--color-accent-primary)] text-[var(--color-bg-primary)] border-[var(--color-accent-primary)]"
              : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-accent-primary)]"
          }`}
        >
          Curved
        </button>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleRun}
          disabled={isRunning}
          className="flex-1 py-2 bg-[var(--color-status-ok)] text-[var(--color-bg-primary)] rounded font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          ▶ Run
        </button>
        <button
          onClick={handlePause}
          disabled={!isRunning}
          className="flex-1 py-2 bg-[var(--color-status-warn)] text-[var(--color-bg-primary)] rounded font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          ⏸ Pause
        </button>
        <button
          onClick={handleReset}
          className="flex-1 py-2 bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded font-bold text-sm border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] transition-colors"
        >
          ↻ Reset
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--color-border)]">
        <div className="text-center p-2 bg-[var(--color-bg-tertiary)] rounded">
          <div className="text-[10px] text-[var(--color-text-muted)] uppercase">
            Cycles
          </div>
          <div className="font-[var(--font-mono)] text-lg text-[var(--color-text-primary)]">
            {stats.totalCount}
          </div>
        </div>
        <div className="text-center p-2 bg-[var(--color-bg-tertiary)] rounded">
          <div className="text-[10px] text-[var(--color-text-muted)] uppercase">
            Success Rate
          </div>
          <div className="font-[var(--font-mono)] text-lg text-[var(--color-status-ok)]">
            {successRate}%
          </div>
        </div>
      </div>
    </div>
  );
}
