"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Environment } from "@react-three/drei";
import { Suspense } from "react";
import { RobotArm } from "./RobotArm";
import { Workpiece } from "./Workpiece";
import { VisionOverlay } from "./VisionOverlay";

export default function RobotScene() {
  return (
    <div className="w-full h-full min-h-[500px]">
      <Canvas
        camera={{ position: [3, 3, 3], fov: 50 }}
        shadows
        gl={{ antialias: true }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#ff6b35" />

        {/* Environment */}
        <Environment preset="warehouse" />

        {/* Ground Grid */}
        <Grid
          position={[0, 0, 0]}
          args={[10, 10]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#333333"
          sectionSize={2}
          sectionThickness={1}
          sectionColor="#555555"
          fadeDistance={25}
          fadeStrength={1}
        />

        {/* Robot and Objects */}
        <Suspense fallback={null}>
          <RobotArm />
          <Workpiece />
          <VisionOverlay />
        </Suspense>

        {/* Camera Controls */}
        <OrbitControls
          makeDefault
          minDistance={2}
          maxDistance={10}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
        />
      </Canvas>

      {/* Status Overlay */}
      <div className="absolute bottom-4 left-4 text-xs text-[var(--color-text-muted)] font-[var(--font-mono)]">
        Drag to rotate • Scroll to zoom • Right-click to pan
      </div>
    </div>
  );
}
