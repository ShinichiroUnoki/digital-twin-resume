"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { useRobotStore } from "@/lib/stores/robotStore";

// ワーク位置の定数（Workpiece.tsxと同期）
const SOURCE_POSITION: [number, number, number] = [0.3, 0.05, 0.25];
const TARGET_POSITION: [number, number, number] = [-0.3, 0.05, 0.25];
const WORKPIECE_HEIGHT = 0.07;
const WORKPIECE_TOP = SOURCE_POSITION[1] + WORKPIECE_HEIGHT / 2;
const PICKUP_THRESHOLD = 0.08;
const VERTICAL_THRESHOLD = 0.04;

export function VisionOverlay() {
  const { visionData, robotState, gripperPosition } = useRobotStore();
  const groupRef = useRef<THREE.Group>(null);
  
  const positionRef = useRef<THREE.Vector3>(
    new THREE.Vector3(SOURCE_POSITION[0], SOURCE_POSITION[1] + WORKPIECE_HEIGHT / 2, SOURCE_POSITION[2])
  );
  
  const isGripped = useRef(false);
  const isPlaced = useRef(false);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const fingerTipPos = new THREE.Vector3(
      gripperPosition[0],
      gripperPosition[1],
      gripperPosition[2]
    );

    const sourceCenter = new THREE.Vector3(
      SOURCE_POSITION[0],
      SOURCE_POSITION[1] + WORKPIECE_HEIGHT / 2,
      SOURCE_POSITION[2]
    );
    const targetCenter = new THREE.Vector3(
      TARGET_POSITION[0],
      TARGET_POSITION[1] + WORKPIECE_HEIGHT / 2,
      TARGET_POSITION[2]
    );

    const fingerXZ = new THREE.Vector2(fingerTipPos.x, fingerTipPos.z);
    const sourceXZ = new THREE.Vector2(SOURCE_POSITION[0], SOURCE_POSITION[2]);
    const targetXZ = new THREE.Vector2(TARGET_POSITION[0], TARGET_POSITION[2]);

    let targetPosition: THREE.Vector3;

    switch (robotState) {
      case "idle":
        if (isPlaced.current) {
          targetPosition = targetCenter;
        } else {
          targetPosition = sourceCenter;
          isGripped.current = false;
        }
        break;

      case "approach":
        targetPosition = sourceCenter;
        isGripped.current = false;
        isPlaced.current = false;
        break;

      case "grip":
        const distToSource = fingerXZ.distanceTo(sourceXZ);
        const verticalDistSource = Math.abs(fingerTipPos.y - WORKPIECE_TOP);
        
        if (distToSource < PICKUP_THRESHOLD && verticalDistSource < VERTICAL_THRESHOLD) {
          isGripped.current = true;
        }
        
        if (isGripped.current) {
          targetPosition = new THREE.Vector3(
            fingerTipPos.x,
            fingerTipPos.y - WORKPIECE_HEIGHT / 2,
            fingerTipPos.z
          );
        } else {
          targetPosition = sourceCenter;
        }
        break;

      case "lift":
      case "move":
        if (isGripped.current) {
          targetPosition = new THREE.Vector3(
            fingerTipPos.x,
            fingerTipPos.y - WORKPIECE_HEIGHT / 2,
            fingerTipPos.z
          );
        } else {
          targetPosition = sourceCenter;
        }
        break;

      case "place":
        const distToTarget = fingerXZ.distanceTo(targetXZ);
        const verticalDistTarget = Math.abs(fingerTipPos.y - WORKPIECE_TOP);
        
        if (isGripped.current && distToTarget < PICKUP_THRESHOLD && verticalDistTarget < VERTICAL_THRESHOLD) {
          isGripped.current = false;
          isPlaced.current = true;
        }
        targetPosition = isGripped.current
          ? new THREE.Vector3(fingerTipPos.x, fingerTipPos.y - WORKPIECE_HEIGHT / 2, fingerTipPos.z)
          : targetCenter;
        break;

      case "return":
        isGripped.current = false;
        isPlaced.current = true;
        targetPosition = targetCenter;
        break;

      default:
        targetPosition = isPlaced.current ? targetCenter : sourceCenter;
    }

    const lerpSpeed = isGripped.current ? 20 : 8;
    positionRef.current.lerp(targetPosition, delta * lerpSpeed);
    groupRef.current.position.copy(positionRef.current);
  });

  if (!visionData.detected) return null;

  return (
    <group ref={groupRef} position={[SOURCE_POSITION[0], SOURCE_POSITION[1] + WORKPIECE_HEIGHT / 2, SOURCE_POSITION[2]]}>
      {/* Bounding Box */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(0.085, 0.085, 0.085)]} />
        <lineBasicMaterial color="#22c55e" linewidth={2} />
      </lineSegments>

      {/* Coordinate Axes */}
      <group>
        <arrowHelper
          args={[new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 0.06, 0xff0000, 0.01, 0.007]}
        />
        <arrowHelper
          args={[new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 0.06, 0x00ff00, 0.01, 0.007]}
        />
        <arrowHelper
          args={[new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 0.06, 0x0000ff, 0.01, 0.007]}
        />
      </group>

      {/* Info Label */}
      <Html position={[0.07, 0.04, 0]} distanceFactor={2}>
        <div className="bg-[rgba(10,10,10,0.95)] border border-[var(--color-status-ok)] rounded px-2 py-1 text-xs font-[var(--font-mono)] whitespace-nowrap shadow-lg">
          <div className="text-[var(--color-status-ok)] font-bold text-[10px]">
            {visionData.objectId}
          </div>
          <div className="text-[var(--color-text-secondary)] text-[8px]">
            Conf: {visionData.confidence.toFixed(1)}%
          </div>
        </div>
      </Html>
    </group>
  );
}
