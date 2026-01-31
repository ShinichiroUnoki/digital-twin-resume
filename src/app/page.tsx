"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

// 3Dシーンは動的インポート（SSR無効）
const RobotScene = dynamic(
  () => import("@/components/scene/RobotScene"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="text-[var(--color-text-secondary)]">
          Loading 3D Scene...
        </div>
      </div>
    ),
  }
);

const ControlPanel = dynamic(
  () => import("@/components/dashboard/ControlPanel"),
  { ssr: false }
);

const SystemLog = dynamic(
  () => import("@/components/dashboard/SystemLog"),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-panel mx-4 mt-4 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[var(--color-status-ok)] animate-pulse" />
            <h1 className="font-[var(--font-display)] text-xl font-bold text-[var(--color-text-primary)]">
              Digital Twin Resume
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)]">
            <span>Fullstack Engineer</span>
            <span className="text-[var(--color-accent-primary)]">
              Robot SI Simulator
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="pt-20 px-4 pb-4 grid grid-cols-12 gap-4 h-screen">
        {/* 3D Scene (Left - 8 columns) */}
        <div className="col-span-8 glass-panel overflow-hidden">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full text-[var(--color-text-secondary)]">
                Initializing...
              </div>
            }
          >
            <RobotScene />
          </Suspense>
        </div>

        {/* Control Panel & Log (Right - 4 columns) */}
        <div className="col-span-4 flex flex-col gap-4">
          {/* Control Panel */}
          <div className="glass-panel p-4 flex-shrink-0">
            <Suspense fallback={<div>Loading controls...</div>}>
              <ControlPanel />
            </Suspense>
          </div>

          {/* System Log */}
          <div className="glass-panel p-4 flex-1 overflow-hidden">
            <Suspense fallback={<div>Loading logs...</div>}>
              <SystemLog />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
