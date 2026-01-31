"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRobotStore } from "@/lib/stores/robotStore";

// ジョイントカラー
const JOINT_COLOR = "#ff6b35";
const LINK_COLOR = "#2a2a2a";
const GRIPPER_COLOR = "#1a1a1a";

// ソース・ターゲットの位置（アームのリーチ内に配置）
const SOURCE_POS = { x: 0.3, z: 0.25 };
const TARGET_POS = { x: -0.3, z: 0.25 };

// ワーク位置
const WORKPIECE_Y = 0.05;
const WORKPIECE_HEIGHT = 0.07;
// 指先がワーク上面を掴む高さ
const GRIP_HEIGHT = WORKPIECE_Y + WORKPIECE_HEIGHT / 2;

// アームのリンク長
const L1 = 0.28; // 上腕（shoulder to elbow）
const L2 = 0.24; // 前腕（elbow to wrist）
const BASE_HEIGHT = 0.13;

// wristからfingerTipまでのオフセット（ローカルY方向）
// gripperMount(0.1) + gripper(0.03) + fingerTip(-0.085) = 0.045
// fingerTipはwristより0.045「上」（ローカル+Y）
// グリッパーが下向き（累積回転=0）の場合、ワールドでもfingerTipはwristより0.045上
const FINGERTIP_OFFSET = 0.045;

function Gripper({ isGripping, fingerTipRef }: { isGripping: boolean; fingerTipRef: React.RefObject<THREE.Mesh | null> }) {
  const fingerSpread = isGripping ? 0.02 : 0.04;

  return (
    <group>
      {/* Gripper base plate */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.07, 0.025, 0.05]} />
        <meshStandardMaterial color={GRIPPER_COLOR} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Left finger */}
      <mesh position={[-fingerSpread, -0.045, 0]} castShadow>
        <boxGeometry args={[0.012, 0.07, 0.02]} />
        <meshStandardMaterial color={JOINT_COLOR} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Right finger */}
      <mesh position={[fingerSpread, -0.045, 0]} castShadow>
        <boxGeometry args={[0.012, 0.07, 0.02]} />
        <meshStandardMaterial color={JOINT_COLOR} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Finger tips */}
      <mesh position={[-fingerSpread, -0.085, 0]} castShadow>
        <boxGeometry args={[0.015, 0.015, 0.025]} />
        <meshStandardMaterial color={JOINT_COLOR} metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[fingerSpread, -0.085, 0]} castShadow>
        <boxGeometry args={[0.015, 0.015, 0.025]} />
        <meshStandardMaterial color={JOINT_COLOR} metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Finger tip marker */}
      <mesh ref={fingerTipRef} position={[0, -0.085, 0]} visible={false}>
        <sphereGeometry args={[0.005]} />
        <meshBasicMaterial color="red" />
      </mesh>
    </group>
  );
}

export function RobotArm() {
  const { robotState, motionParams, setGripperPosition } = useRobotStore();
  const fingerTipRef = useRef<THREE.Mesh>(null);
  
  // ターゲット位置（指先の目標位置）
  const getTargetPosition = (): { x: number; y: number; z: number } => {
    switch (robotState) {
      case "idle":
        return { x: 0.1, y: 0.25, z: 0.15 };
      case "approach":
        return { x: SOURCE_POS.x, y: GRIP_HEIGHT + 0.1, z: SOURCE_POS.z };
      case "grip":
        return { x: SOURCE_POS.x, y: GRIP_HEIGHT, z: SOURCE_POS.z };
      case "lift":
        return { x: SOURCE_POS.x, y: GRIP_HEIGHT + 0.12, z: SOURCE_POS.z };
      case "move":
        return { x: TARGET_POS.x, y: GRIP_HEIGHT + 0.12, z: TARGET_POS.z };
      case "place":
        return { x: TARGET_POS.x, y: GRIP_HEIGHT, z: TARGET_POS.z };
      case "return":
        return { x: 0.1, y: 0.25, z: 0.15 };
      default:
        return { x: 0.1, y: 0.25, z: 0.15 };
    }
  };

  const target = getTargetPosition();
  const currentPos = useRef({ x: 0.1, y: 0.25, z: 0.15 });

  // アーム各部の参照
  const armBaseRef = useRef<THREE.Group>(null);
  const shoulderRef = useRef<THREE.Group>(null);
  const elbowRef = useRef<THREE.Group>(null);
  const wristRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const speed = motionParams.velocity * 3;
    const lerpFactor = Math.min(delta * speed, 0.15);

    // 位置を補間
    currentPos.current.x = THREE.MathUtils.lerp(currentPos.current.x, target.x, lerpFactor);
    currentPos.current.y = THREE.MathUtils.lerp(currentPos.current.y, target.y, lerpFactor);
    currentPos.current.z = THREE.MathUtils.lerp(currentPos.current.z, target.z, lerpFactor);

    const { x, y, z } = currentPos.current;

    // === IK計算 ===
    
    // 1. ベース回転（Y軸）
    const baseAngle = Math.atan2(x, z);
    
    // 2. 2D平面でのIK（垂直面）
    const r = Math.sqrt(x * x + z * z); // 水平距離
    
    // wrist位置を計算
    // fingerTipY = wristY + FINGERTIP_OFFSET（グリッパー下向き時）
    // よって wristY = fingerTipY - FINGERTIP_OFFSET
    const wristY = y - FINGERTIP_OFFSET;
    const wristH = wristY - BASE_HEIGHT; // ベースからwristまでの高さ
    
    // wristまでの距離
    const d = Math.sqrt(r * r + wristH * wristH);
    const dClamped = Math.min(Math.max(d, Math.abs(L1 - L2) + 0.01), L1 + L2 - 0.01);
    
    // 3. 2リンクIK
    // 肘の内角（余弦定理）
    const cosElbow = (L1 * L1 + L2 * L2 - dClamped * dClamped) / (2 * L1 * L2);
    const elbowInner = Math.acos(Math.max(-1, Math.min(1, cosElbow)));
    
    // ターゲット方向の角度（水平から、上が正）
    const phi = Math.atan2(wristH, r);
    
    // 肩からターゲットへの補正角度
    const cosPsi = (L1 * L1 + dClamped * dClamped - L2 * L2) / (2 * L1 * dClamped);
    const psi = Math.acos(Math.max(-1, Math.min(1, cosPsi)));
    
    // === rotation.x への変換 ===
    // Three.jsのX軸回転：
    // rotation.x = 0 : +Y方向（上）を向く
    // rotation.x = π/2 : +Z方向（前）を向く
    // rotation.x = π : -Y方向（下）を向く
    
    // 肩の回転
    const shoulderRotX = Math.PI / 2 - (phi + psi);
    
    // 肘の回転
    const elbowRotX = Math.PI - elbowInner;
    
    // 手首の回転（グリッパーを下向きに保つ）
    // 累積回転 = 0 でグリッパーが初期状態（下向き）を維持
    const wristRotX = -shoulderRotX - elbowRotX;

    // === 回転を適用 ===
    const angleLerp = Math.min(delta * speed * 2, 0.2);
    
    if (armBaseRef.current) {
      armBaseRef.current.rotation.y = THREE.MathUtils.lerp(
        armBaseRef.current.rotation.y,
        baseAngle,
        angleLerp
      );
    }
    if (shoulderRef.current) {
      shoulderRef.current.rotation.x = THREE.MathUtils.lerp(
        shoulderRef.current.rotation.x,
        shoulderRotX,
        angleLerp
      );
    }
    if (elbowRef.current) {
      elbowRef.current.rotation.x = THREE.MathUtils.lerp(
        elbowRef.current.rotation.x,
        elbowRotX,
        angleLerp
      );
    }
    if (wristRef.current) {
      wristRef.current.rotation.x = THREE.MathUtils.lerp(
        wristRef.current.rotation.x,
        wristRotX,
        angleLerp
      );
    }

    // 指先のワールド座標を取得してストアに保存
    if (fingerTipRef.current) {
      const worldPos = new THREE.Vector3();
      fingerTipRef.current.getWorldPosition(worldPos);
      setGripperPosition([worldPos.x, worldPos.y, worldPos.z]);
    }
  });

  const isGripping = robotState === "grip" || robotState === "lift" || robotState === "move";

  return (
    <group position={[0, 0, 0]}>
      {/* Base Platform */}
      <mesh position={[0, 0.025, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.05, 32]} />
        <meshStandardMaterial color={LINK_COLOR} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Base Column */}
      <mesh position={[0, 0.075, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.1, 32]} />
        <meshStandardMaterial color={LINK_COLOR} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Arm Base (Y rotation) */}
      <group ref={armBaseRef} position={[0, BASE_HEIGHT, 0]}>
        {/* Shoulder Joint */}
        <mesh castShadow>
          <sphereGeometry args={[0.055, 20, 20]} />
          <meshStandardMaterial color={JOINT_COLOR} metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Upper Arm */}
        <group ref={shoulderRef}>
          <mesh position={[0, L1 / 2, 0]} castShadow>
            <capsuleGeometry args={[0.032, L1 - 0.06, 8, 16]} />
            <meshStandardMaterial color={LINK_COLOR} metalness={0.6} roughness={0.4} />
          </mesh>

          {/* Elbow */}
          <group position={[0, L1, 0]}>
            <mesh castShadow>
              <sphereGeometry args={[0.045, 16, 16]} />
              <meshStandardMaterial color={JOINT_COLOR} metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Forearm */}
            <group ref={elbowRef}>
              <mesh position={[0, L2 / 2, 0]} castShadow>
                <capsuleGeometry args={[0.028, L2 - 0.06, 8, 16]} />
                <meshStandardMaterial color={LINK_COLOR} metalness={0.6} roughness={0.4} />
              </mesh>

              {/* Wrist */}
              <group position={[0, L2, 0]}>
                <mesh castShadow>
                  <sphereGeometry args={[0.035, 16, 16]} />
                  <meshStandardMaterial color={JOINT_COLOR} metalness={0.8} roughness={0.2} />
                </mesh>

                <group ref={wristRef}>
                  <mesh position={[0, 0.05, 0]} castShadow>
                    <capsuleGeometry args={[0.022, 0.06, 8, 16]} />
                    <meshStandardMaterial color={LINK_COLOR} metalness={0.6} roughness={0.4} />
                  </mesh>

                  {/* Gripper Mount */}
                  <group position={[0, 0.1, 0]}>
                    <mesh position={[0, 0.015, 0]} castShadow>
                      <cylinderGeometry args={[0.025, 0.03, 0.03, 16]} />
                      <meshStandardMaterial color={GRIPPER_COLOR} metalness={0.7} roughness={0.3} />
                    </mesh>
                    <group position={[0, 0.03, 0]}>
                      <Gripper isGripping={isGripping} fingerTipRef={fingerTipRef} />
                    </group>
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
