"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRobotStore } from "@/lib/stores/robotStore";

// ワーク位置の定数（RobotArm.tsxと同期）
const SOURCE_POSITION: [number, number, number] = [0.3, 0.05, 0.25];
const TARGET_POSITION: [number, number, number] = [-0.3, 0.05, 0.25];
const WORKPIECE_HEIGHT = 0.07;

// ワーク上面の高さ（指先がここを掴む）
const WORKPIECE_TOP = SOURCE_POSITION[1] + WORKPIECE_HEIGHT / 2;

// グリップ判定用閾値
const PICKUP_THRESHOLD = 0.08; // 水平距離
const VERTICAL_THRESHOLD = 0.04; // 垂直距離

export function Workpiece() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { robotState, visionData, gripperPosition } = useRobotStore();
  const positionRef = useRef<THREE.Vector3>(new THREE.Vector3(...SOURCE_POSITION));
  
  // ワークがグリップされているかどうかの状態
  const isGripped = useRef(false);
  // ワークが配置されたかどうか
  const isPlaced = useRef(false);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // グリッパー指先位置
    const fingerTipPos = new THREE.Vector3(
      gripperPosition[0],
      gripperPosition[1],
      gripperPosition[2]
    );

    // ソース位置とターゲット位置
    const sourcePos = new THREE.Vector3(...SOURCE_POSITION);
    const targetPos = new THREE.Vector3(...TARGET_POSITION);

    // 判定用の水平距離（XZ平面）
    const fingerXZ = new THREE.Vector2(fingerTipPos.x, fingerTipPos.z);
    const sourceXZ = new THREE.Vector2(SOURCE_POSITION[0], SOURCE_POSITION[2]);
    const targetXZ = new THREE.Vector2(TARGET_POSITION[0], TARGET_POSITION[2]);

    // 状態に応じた処理
    let targetPosition: THREE.Vector3;

    switch (robotState) {
      case "idle":
        if (isPlaced.current) {
          targetPosition = targetPos;
        } else {
          targetPosition = sourcePos;
          isGripped.current = false;
        }
        break;

      case "approach":
        targetPosition = sourcePos;
        isGripped.current = false;
        isPlaced.current = false;
        break;

      case "grip":
        // グリッパーがソース位置に十分近づいたらグリップ
        const distToSource = fingerXZ.distanceTo(sourceXZ);
        const verticalDistSource = Math.abs(fingerTipPos.y - WORKPIECE_TOP);
        
        if (distToSource < PICKUP_THRESHOLD && verticalDistSource < VERTICAL_THRESHOLD) {
          isGripped.current = true;
        }
        
        if (isGripped.current) {
          // グリップ中はfingerTipの位置に追従（ワーク中心は指先より少し下）
          targetPosition = new THREE.Vector3(
            fingerTipPos.x,
            fingerTipPos.y - WORKPIECE_HEIGHT / 2,
            fingerTipPos.z
          );
        } else {
          targetPosition = sourcePos;
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
          targetPosition = sourcePos;
        }
        break;

      case "place":
        const distToTarget = fingerXZ.distanceTo(targetXZ);
        const verticalDistTarget = Math.abs(fingerTipPos.y - WORKPIECE_TOP);
        
        if (isGripped.current) {
          if (distToTarget < PICKUP_THRESHOLD && verticalDistTarget < VERTICAL_THRESHOLD) {
            isGripped.current = false;
            isPlaced.current = true;
            targetPosition = targetPos;
          } else {
            targetPosition = new THREE.Vector3(
              fingerTipPos.x,
              fingerTipPos.y - WORKPIECE_HEIGHT / 2,
              fingerTipPos.z
            );
          }
        } else {
          targetPosition = targetPos;
        }
        break;

      case "return":
        isGripped.current = false;
        isPlaced.current = true;
        targetPosition = targetPos;
        break;

      default:
        targetPosition = isPlaced.current ? targetPos : sourcePos;
    }

    // 位置を補間
    const lerpSpeed = isGripped.current ? 20 : 8;
    positionRef.current.lerp(targetPosition, delta * lerpSpeed);
    meshRef.current.position.copy(positionRef.current);
  });

  return (
    <group>
      {/* Source Zone Marker */}
      <group position={[SOURCE_POSITION[0], 0.001, SOURCE_POSITION[2]]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <ringGeometry args={[0.05, 0.08, 32]} />
          <meshStandardMaterial color="#22c55e" transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[0.05, 32]} />
          <meshStandardMaterial color="#22c55e" transparent opacity={0.15} />
        </mesh>
      </group>

      {/* Target Zone Marker */}
      <group position={[TARGET_POSITION[0], 0.001, TARGET_POSITION[2]]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <ringGeometry args={[0.05, 0.08, 32]} />
          <meshStandardMaterial color="#06b6d4" transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[0.05, 32]} />
          <meshStandardMaterial color="#06b6d4" transparent opacity={0.15} />
        </mesh>
      </group>

      {/* Workpiece (Box) */}
      <mesh ref={meshRef} position={SOURCE_POSITION} castShadow>
        <boxGeometry args={[WORKPIECE_HEIGHT, WORKPIECE_HEIGHT, WORKPIECE_HEIGHT]} />
        <meshStandardMaterial
          color={visionData.detected ? "#ff6b35" : "#666666"}
          metalness={0.4}
          roughness={0.6}
        />
      </mesh>

      {/* Conveyor Belt */}
      <mesh position={[0, 0.012, SOURCE_POSITION[2]]} receiveShadow>
        <boxGeometry args={[0.9, 0.025, 0.12]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Conveyor Rollers */}
      {[-0.35, -0.175, 0, 0.175, 0.35].map((xOffset, i) => (
        <mesh key={i} position={[xOffset, 0.012, SOURCE_POSITION[2]]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.01, 0.01, 0.1, 16]} />
          <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
    </group>
  );
}
