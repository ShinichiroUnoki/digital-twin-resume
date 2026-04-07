import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { VisionOverlay } from "./VisionOverlay";
import { useRobotStore } from "@/lib/stores/robotStore";

// Three.js プリミティブのモック — jsdomでは3Dレンダリング不可のため
// コンストラクタとして使われるため function キーワードが必須
vi.mock("three", () => {
  class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x = 0, y = 0, z = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    lerp() { return this; }
    copy() { return this; }
    distanceTo() { return 0; }
    set() { return this; }
  }
  class Vector2 {
    x: number;
    y: number;
    constructor(x = 0, y = 0) {
      this.x = x;
      this.y = y;
    }
    distanceTo() { return 0; }
  }
  class BoxGeometry {}
  class Group {}
  return { Vector3, Vector2, BoxGeometry, Group };
});

describe("VisionOverlay", () => {
  // 各テスト前にstoreを初期状態にリセット
  beforeEach(() => {
    useRobotStore.getState().reset();
  });

  it("エラーなくレンダリングされること", () => {
    // detected=true（デフォルト）の状態でレンダリング
    render(<VisionOverlay />);
    expect(document.querySelector("div")).toBeTruthy();
  });

  it("visionData.detected が true の場合、オブジェクトIDが表示されること", () => {
    render(<VisionOverlay />);
    // デフォルトの visionData.objectId は "Box_001"
    expect(screen.getByText("Box_001")).toBeInTheDocument();
  });

  it("信頼度（confidence）がパーセント表示されること", () => {
    render(<VisionOverlay />);
    // デフォルトの confidence は 98.5
    expect(screen.getByText("Conf: 98.5%")).toBeInTheDocument();
  });

  it("visionData.detected が false の場合、何も表示されないこと", () => {
    // detected を false に設定
    useRobotStore.getState().setVisionData({ detected: false });
    const { container } = render(<VisionOverlay />);
    // null を返すため、コンテナ内に子要素がない
    expect(container.innerHTML).toBe("");
  });

  it("visionData を更新するとオブジェクトIDが反映されること", () => {
    useRobotStore
      .getState()
      .setVisionData({ objectId: "Cylinder_002", confidence: 85.3 });
    render(<VisionOverlay />);
    expect(screen.getByText("Cylinder_002")).toBeInTheDocument();
    expect(screen.getByText("Conf: 85.3%")).toBeInTheDocument();
  });
});
