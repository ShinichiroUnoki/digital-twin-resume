import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import ControlPanel from "./ControlPanel";
import { useRobotStore } from "@/lib/stores/robotStore";

describe("ControlPanel", () => {
  // 各テスト前にstoreを初期状態にリセット
  beforeEach(() => {
    useRobotStore.getState().reset();
  });

  it("エラーなくレンダリングされること", () => {
    render(<ControlPanel />);
    expect(document.querySelector("div")).toBeTruthy();
  });

  it("Motion Parameters タイトルが表示されること", () => {
    render(<ControlPanel />);
    expect(screen.getByText("Motion Parameters")).toBeInTheDocument();
  });

  it("Run / Pause / Reset ボタンが表示されること", () => {
    render(<ControlPanel />);
    expect(screen.getByText(/Run/)).toBeInTheDocument();
    expect(screen.getByText(/Pause/)).toBeInTheDocument();
    expect(screen.getByText(/Reset/)).toBeInTheDocument();
  });

  it("Linear / Curved ボタンが表示されること", () => {
    render(<ControlPanel />);
    expect(screen.getByText("Linear")).toBeInTheDocument();
    expect(screen.getByText("Curved")).toBeInTheDocument();
  });

  it("Stats セクション（Cycles, Success Rate）が表示されること", () => {
    render(<ControlPanel />);
    expect(screen.getByText("Cycles")).toBeInTheDocument();
    expect(screen.getByText("Success Rate")).toBeInTheDocument();
  });

  it("初期状態で Cycles が 0、Success Rate が 0.0% であること", () => {
    render(<ControlPanel />);
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("0.0%")).toBeInTheDocument();
  });

  it("Run ボタンクリックで isRunning が true になること", () => {
    render(<ControlPanel />);

    expect(useRobotStore.getState().isRunning).toBe(false);

    fireEvent.click(screen.getByText(/Run/));

    expect(useRobotStore.getState().isRunning).toBe(true);
  });

  it("Pause ボタンクリックで isRunning が false になること", () => {
    // まず実行状態にする
    useRobotStore.getState().setIsRunning(true);
    render(<ControlPanel />);

    fireEvent.click(screen.getByText(/Pause/));

    expect(useRobotStore.getState().isRunning).toBe(false);
  });

  it("Reset ボタンクリックで isRunning が false かつ robotState が idle になること", () => {
    // 実行中 + approach状態にする
    useRobotStore.getState().setIsRunning(true);
    useRobotStore.getState().setRobotState("approach");
    render(<ControlPanel />);

    fireEvent.click(screen.getByText(/Reset/));

    const state = useRobotStore.getState();
    expect(state.isRunning).toBe(false);
    expect(state.robotState).toBe("idle");
  });
});
