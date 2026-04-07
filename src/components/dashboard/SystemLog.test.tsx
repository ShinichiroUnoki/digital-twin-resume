import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import SystemLog from "./SystemLog";

// @/lib/data のモック — テスト用の固定ログデータを注入
vi.mock("@/lib/data", () => ({
  logs: [
    {
      timestamp: "2024-04-01T10:00:00Z",
      level: "INFO",
      type: "SYSTEM",
      message: "テストログ1",
    },
    {
      timestamp: "2024-04-01T10:01:00Z",
      level: "WARN",
      type: "DEPLOY",
      message: "テストログ2",
    },
    {
      timestamp: "2024-04-01T10:02:00Z",
      level: "ERROR",
      type: "SYSTEM",
      message: "テストログ3",
    },
  ],
}));

describe("SystemLog", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // 全ログを表示状態にするヘルパー（150ms × ログ数分タイマーを進める）
  const advanceUntilAllLogsDisplayed = () => {
    act(() => {
      vi.advanceTimersByTime(150 * 4); // 3件分 + 余裕
    });
  };

  it("エラーなくレンダリングされること", () => {
    render(<SystemLog />);
    // レンダリング自体が例外を投げなければ成功
    expect(document.querySelector("div")).toBeTruthy();
  });

  it("System Log タイトルが表示されること", () => {
    render(<SystemLog />);
    expect(screen.getByText("System Log")).toBeInTheDocument();
  });

  it("フィルターボタン（ALL, INFO, WARN, ERROR）が表示されること", () => {
    render(<SystemLog />);
    expect(screen.getByText("ALL")).toBeInTheDocument();
    expect(screen.getByText("INFO")).toBeInTheDocument();
    expect(screen.getByText("WARN")).toBeInTheDocument();
    expect(screen.getByText("ERROR")).toBeInTheDocument();
  });

  it("検索入力フィールドが存在すること", () => {
    render(<SystemLog />);
    expect(screen.getByPlaceholderText("Search logs...")).toBeInTheDocument();
  });

  it("タイマー進行後にログデータが順次表示されること", () => {
    render(<SystemLog />);

    // 初期状態ではログ未表示
    expect(screen.queryByText("テストログ1")).not.toBeInTheDocument();

    // 150ms後に最初のログが表示
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(screen.getByText("テストログ1")).toBeInTheDocument();

    // さらに150msで2件目
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(screen.getByText("テストログ2")).toBeInTheDocument();
  });

  it("フィルターボタンでログレベルを絞り込めること", () => {
    render(<SystemLog />);
    advanceUntilAllLogsDisplayed();

    // ERRORフィルタを適用（ボタンとログ内レベル表示が重複するためroleで特定）
    const errorButton = screen.getByRole("button", { name: "ERROR" });
    fireEvent.click(errorButton);

    // ERRORログのみ表示、他は非表示
    expect(screen.getByText("テストログ3")).toBeInTheDocument();
    expect(screen.queryByText("テストログ1")).not.toBeInTheDocument();
    expect(screen.queryByText("テストログ2")).not.toBeInTheDocument();
  });

  it("検索入力でログをテキスト検索できること", () => {
    render(<SystemLog />);
    advanceUntilAllLogsDisplayed();

    // "DEPLOY" で検索（typeフィールドに一致）
    fireEvent.change(screen.getByPlaceholderText("Search logs..."), {
      target: { value: "DEPLOY" },
    });

    expect(screen.getByText("テストログ2")).toBeInTheDocument();
    expect(screen.queryByText("テストログ1")).not.toBeInTheDocument();
    expect(screen.queryByText("テストログ3")).not.toBeInTheDocument();
  });

  it("エントリ数がフッターに表示されること", () => {
    render(<SystemLog />);
    advanceUntilAllLogsDisplayed();

    expect(screen.getByText("3 entries")).toBeInTheDocument();
  });
});
