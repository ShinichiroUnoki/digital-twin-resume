# C++ Robot Simulation Library

逆運動学・軌道生成をC++で実装し、WebAssemblyにコンパイルしてWebブラウザで実行するライブラリです。

## 使用ライブラリ

| ライブラリ | ライセンス | 用途 |
|------------|------------|------|
| Eigen | MPL2 (MIT互換) | 線形代数・行列演算 |
| Ruckig | MIT | ジャーク制限付き軌道生成 |

## 機能

### 逆運動学 (Inverse Kinematics)
- DH (Denavit-Hartenberg) パラメータベースの6軸ロボット
- 順運動学・逆運動学の解析解

### 軌道生成 (Trajectory Generation)
- 台形速度プロファイル
- S字速度プロファイル（Ruckig使用時）
- ジャーク制限付き時間最適軌道

## ビルド手順

### 前提条件

1. **Emscripten** のインストール

```bash
# macOS
brew install emscripten

# Ubuntu/Debian
sudo apt install emscripten

# または公式手順
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
```

2. **CMake** (3.16以上)

```bash
# macOS
brew install cmake

# Ubuntu/Debian
sudo apt install cmake
```

### WebAssembly ビルド

```bash
cd cpp

# ビルドディレクトリ作成
mkdir -p build && cd build

# Emscripten でビルド
emcmake cmake ..
make

# 成果物を確認
ls -la robot_sim.js robot_sim.wasm
```

### 成果物のコピー

```bash
# プロジェクトルートから実行
cp cpp/build/robot_sim.js src/lib/wasm/
cp cpp/build/robot_sim.wasm src/lib/wasm/

# Git にコミット
git add src/lib/wasm/robot_sim.*
git commit -m "build: update WASM binary"
```

## API リファレンス

### RobotKinematics

```typescript
// 順運動学
const kinematics = new wasmModule.RobotKinematics();
const transform = kinematics.forwardKinematics({ theta: [0, 0, 0, 0, 0, 0] });

// 逆運動学
const solutions = kinematics.inverseKinematics(
  [0.5, 0.3, 0.2],  // position
  [1, 0, 0, 0, 1, 0, 0, 0, 1]  // rotation matrix (flattened)
);

kinematics.delete();  // メモリ解放
```

### TrajectoryPlanner

```typescript
const planner = new wasmModule.TrajectoryPlanner();

const trajectory = planner.plan(
  [0, 0, 0, 0, 0, 0],  // start position
  [1, 0.5, 0.3, 0, 0, 0],  // end position
  {
    maxVelocity: [1, 1, 1, 2, 2, 2],
    maxAcceleration: [2, 2, 2, 4, 4, 4],
    maxJerk: [10, 10, 10, 20, 20, 20]
  },
  0.01  // sampling interval
);

planner.delete();  // メモリ解放
```

## ライセンス

MIT License
