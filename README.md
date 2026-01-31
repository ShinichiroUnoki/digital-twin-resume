# Digital Twin Resume

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**「経歴書」ではなく「ロボットSIシミュレーター」としてのポートフォリオ**

ロボットシステムインテグレーションエンジニアとしての技術力と適性をアピールするためのインタラクティブポートフォリオです。

---

## 🎯 Technical Focus

**ロボットシステムインテグレーション技術の実証**

### 実装されている技術要素

| 技術領域 | ポートフォリオでの表現 |
|----------|------------------------|
| 3Dシミュレーション | React Three Fiberによるピック＆プレースシミュレーション |
| パラメータ調整 | リアルタイムパラメータ調整UI（速度・加速度・軌道） |
| ビジョンシステム | ビジョンシステム風オーバーレイ（検出枠・座標軸表示） |
| システム設計 | C++ + TypeScript ハイブリッド構成によるモダンアーキテクチャ |
| 運用監視 | SYSTEM_LOGによるイベント可視化 |

---

## 💡 Concept

ロボットシステム全体の「設計・設定・テスト」「3Dシミュレーション」「パフォーマンス検証」をWeb上で擬似的に再現し、エンジニアとしての適性を直接的にアピールします。

### 訴求ポイント

- **3Dシミュレーション力**: React Three Fiberによるピック＆プレース動作の可視化
- **パラメータ調整力**: モーションパラメータをリアルタイム調整可能なUIでチューニング能力をアピール
- **ビジョンシステム理解**: 物体検出・座標認識を模したオーバーレイ表示
- **顧客折衝力**: PM経験と技術的折衝能力をSYSTEM_LOGでストーリー化
- **現場志向**: 機械商社での3Dスキャナー販売経験、太陽光監視システムでの運用経験を可視化

---

## 🏗 Architecture

### 運用方針: 極限削減

| 項目 | 従来 | 極限削減版 |
|------|------|------------|
| **データ管理** | PostgreSQL + Prisma | JSONファイル |
| **開発環境** | Docker | npm run dev のみ |
| **CI/CD** | GitHub Actions | Vercel自動デプロイのみ |
| **WASM** | CI自動ビルド | JSフォールバック（WASMオプション） |
| **月額コスト** | $0〜$7 | **$0（完全無料）** |
| **管理負荷** | DB/Docker/CI保守 | **ゼロ** |

### 技術スタック（全てMIT/BSD/Apache互換OSS）

| レイヤー | 技術 | ライセンス |
|----------|------|------------|
| **Core Simulation (C++)** | Eigen | MPL2 |
| | Ruckig | MIT |
| | Emscripten | MIT |
| **3D Rendering** | Three.js | MIT |
| | React Three Fiber | MIT |
| | @react-three/drei | MIT |
| **Frontend** | Next.js 14 | MIT |
| | TypeScript | Apache 2.0 |
| | Tailwind CSS | MIT |
| | Zustand | MIT |
| | Framer Motion | MIT |
| **Hosting** | Vercel | Free Tier |

### C++ コアライブラリ

- **Ruckig** (MIT): https://github.com/pantor/ruckig - ジャーク制限付き時間最適軌道生成
- **Eigen** (MPL2): https://eigen.tuxfamily.org/ - 線形代数（逆運動学）

---

## 📁 Directory Structure

```
portfolio/
├── src/
│   ├── app/                      # Next.js Pages
│   │   ├── page.tsx              # メインページ
│   │   ├── layout.tsx            # レイアウト
│   │   └── globals.css           # Industrial Dark テーマ
│   ├── components/
│   │   ├── ui/                   # 共通UI
│   │   ├── dashboard/            # ダッシュボード
│   │   │   ├── ControlPanel.tsx  # パラメータ調整UI
│   │   │   └── SystemLog.tsx     # 経歴イベントログ
│   │   └── scene/                # 3Dシーン
│   │       ├── RobotScene.tsx    # メイン3Dキャンバス
│   │       ├── RobotArm.tsx      # 6軸ロボットアーム
│   │       ├── Workpiece.tsx     # ワーク＆コンベア
│   │       └── VisionOverlay.tsx # ビジョンオーバーレイ
│   ├── lib/
│   │   ├── wasm/                 # シミュレーションモジュール
│   │   │   └── robotSim.ts       # 軌道生成・IK（JSフォールバック）
│   │   ├── data/                 # 静的JSONデータ
│   │   │   ├── profile.json
│   │   │   ├── skills.json
│   │   │   ├── projects.json
│   │   │   └── logs.json
│   │   └── stores/               # Zustand
│   │       └── robotStore.ts
│   └── styles/
│       └── globals.css
│
├── cpp/                          # C++ Source（ローカルビルド用）
│   ├── src/
│   │   ├── kinematics.cpp        # 逆運動学（Eigen使用）
│   │   ├── trajectory.cpp        # 軌道生成（Ruckig使用）
│   │   └── bindings.cpp          # Emscriptenバインディング
│   ├── include/
│   │   └── robot_sim.hpp
│   ├── CMakeLists.txt
│   └── README.md                 # ビルド手順
│
├── public/                       # 静的アセット
├── LICENSE                       # MIT
└── README.md
```

---

## 📊 Data Schema

DB不要。静的JSONファイルでデータ管理。

### profile.json

```json
{
  "name": "Your Name",
  "title": "Fullstack Engineer",
  "bio": "「現場視点」×「フルスタック技術」で、自動化のラストワンマイルを埋める。",
  "uptimeYears": 6,
  "contact": "contact@example.com"
}
```

### skills.json

```json
[
  { "id": "rails", "name": "Ruby on Rails", "category": "Backend", "level": 90, "months": 48 },
  { "id": "terraform", "name": "Terraform", "category": "Infra", "level": 75, "months": 12 }
]
```

### projects.json

```json
[
  {
    "id": "sales-system",
    "title": "販売管理システム刷新",
    "company": "Company D",
    "startDate": "2024-04",
    "endDate": "2025-10",
    "role": "PM/PG",
    "teamSize": 5,
    "skills": ["rails", "aws", "terraform"],
    "featured": true
  }
]
```

### logs.json

```json
[
  { "timestamp": "2024-01-01T09:00:00Z", "level": "INFO", "type": "SYSTEM_INIT", "message": "Joined Company D as PM/PG" }
]
```

### TypeScript 型定義

```typescript
export interface Profile {
  name: string;
  title: string;
  bio: string;
  uptimeYears: number;
  contact: string;
}

export interface Skill {
  id: string;
  name: string;
  category: 'Backend' | 'Frontend' | 'Infra' | 'Other';
  level: number;  // 1-100
  months: number;
}

export interface Project {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string | null;
  role: string;
  teamSize: number;
  skills: string[];
  featured: boolean;
}

export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  type: string;
  message: string;
}
```

---

## ✨ Features

### A. 3D Robot Simulation (The "Digital Twin")

ロボットSI業務を模した3Dシミュレーション機能。

#### A-1. ピック＆プレース動作

```
[シーン構成]
┌─────────────────────────────────────────┐
│                                         │
│    📦 Source Zone        📦 Target Zone │
│    ┌───┐                 ┌───┐         │
│    │Box│    🦾 Robot     │   │         │
│    └───┘      Arm        └───┘         │
│                                         │
│    [Conveyor Belt ═══════════════]     │
│                                         │
└─────────────────────────────────────────┘
```

- **動作シーケンス**: Idle → Approach → Grip → Lift → Move → Place → Return
- **状態表示**: 現在の動作フェーズをステータスバッジで表示
- **OrbitControls**: マウスドラッグで視点変更可能

#### A-2. モーションパラメータ調整UI

リアルタイムでロボット動作を調整可能なコントロールパネル。

| パラメータ | 範囲 | 単位 | 説明 |
|------------|------|------|------|
| `velocity` | 0.1 - 2.0 | m/s | アーム移動速度 |
| `acceleration` | 0.1 - 1.5 | m/s² | 加速度 |
| `trajectory` | Linear / Curved | - | 軌道タイプ |
| `grip_force` | 10 - 100 | % | グリップ力 |

```
┌─ Motion Parameters ─────────────────────┐
│                                         │
│  Velocity      [━━━━━━━●━━━] 1.2 m/s   │
│  Acceleration  [━━━━●━━━━━━] 0.8 m/s²  │
│  Trajectory    [Linear ▼]              │
│  Grip Force    [━━━━━━━━●━━] 85%       │
│                                         │
│  [▶ Run] [⏸ Pause] [↻ Reset]           │
│                                         │
└─────────────────────────────────────────┘
```

#### A-3. ビジョンシステムオーバーレイ

物体検出・座標認識を模したビジュアル表現。

- **検出ボックス**: ワーク周囲に緑色のバウンディングボックスを表示
- **座標軸**: ワーク中心にXYZ軸（RGB色分け）を表示
- **認識情報パネル**: Object ID, Position, Rotation, Confidence

### B. System Dashboard (The "Control Panel")

産業用制御盤を模したダッシュボード。

#### B-1. リアルタイムメトリクス

| メトリクス | 表示形式 | データソース |
|------------|----------|--------------|
| Cycles | カウント | シミュレーション累計 |
| Success Rate | % 表示 | 成功/試行回数 |

#### B-2. SYSTEM_LOG（経歴イベントログ）

- JSONから取得した経歴イベントをリアルタイムログ風に表示
- フィルタ機能: ALL / INFO / WARN / ERROR
- 検索機能: キーワード検索

### SYSTEM_LOG イベント種別

#### 基本イベント

| event_type | level | 説明 | 経歴書での対応 |
|------------|-------|------|----------------|
| `SYSTEM_INIT` | INFO | システム起動・入社 | 新会社への入社 |
| `MODULE_DEPLOY` | INFO | 新機能・プロジェクト開始 | 新規プロジェクト着手 |
| `TASK_COMPLETE` | INFO | タスク完了 | 案件納品・リリース |
| `PERFORMANCE_BOOST` | INFO | 性能向上・成果達成 | 売上向上・KPI達成 |
| `CONFIG_UPDATE` | INFO | 設定変更・スキル習得 | 新技術習得 |
| `SYSTEM_HALT` | INFO | システム停止・退職 | 退職・契約終了 |

#### ロボットSI特化イベント

| event_type | level | 説明 | 経歴書での対応 |
|------------|-------|------|----------------|
| `MOTION_OPTIMIZED` | INFO | モーション最適化完了 | パフォーマンス改善 |
| `VISION_CALIBRATED` | INFO | ビジョンシステム調整完了 | システム調整作業 |
| `CUSTOMER_DEMO` | INFO | 顧客向けデモ実施 | 顧客折衝・プレゼン |
| `LAYOUT_DESIGNED` | INFO | レイアウト設計完了 | 要件定義・設計 |
| `INTEGRATION_TEST` | INFO | 結合テスト完了 | テスト工程 |
| `SITE_DEPLOY` | INFO | 現場導入完了 | 本番リリース |
| `PARAM_TUNED` | INFO | パラメータチューニング | 性能調整作業 |
| `CYCLE_TIME_REDUCED` | INFO | サイクルタイム短縮 | 効率化達成 |

---

## 🎨 Design System

### カラーパレット ("Industrial Dark" Theme)

```css
:root {
  /* Base */
  --color-bg-primary: #0a0a0a;
  --color-bg-secondary: #1a1a1a;
  --color-bg-tertiary: #2a2a2a;
  
  /* Text */
  --color-text-primary: #e5e5e5;
  --color-text-secondary: #a3a3a3;
  --color-text-muted: #737373;
  
  /* Accent (Safety Orange) */
  --color-accent-primary: #ff6b35;
  --color-accent-hover: #ff8c5a;
  
  /* Status (Industrial) */
  --color-status-ok: #22c55e;
  --color-status-warn: #eab308;
  --color-status-error: #ef4444;
  --color-status-info: #06b6d4;
  
  /* Border */
  --color-border: #333333;
  --color-border-focus: #ff6b35;
}
```

### タイポグラフィ

| 用途 | フォント | サイズ |
|------|----------|--------|
| ヘッダー | **Space Grotesk** | 2rem - 4rem |
| 本文 | **Inter** | 1rem |
| コード/ログ | **JetBrains Mono** | 0.875rem |

---

## 🔧 C++ Implementation

### 逆運動学（Inverse Kinematics）

**使用ライブラリ**: Eigen (MPL2 - MIT互換)

```cpp
// cpp/src/kinematics.cpp
namespace RobotSim {

class RobotKinematics {
public:
    struct JointAngles { double theta[6]; };
    struct DHParams { double a, d, alpha; };
    
    // DH Parameters (Puma-like)
    const std::vector<DHParams> dh_params = {
        {0, 0.67, -M_PI/2}, {0.432, 0, 0}, {0.020, 0, -M_PI/2},
        {0, 0.432, M_PI/2}, {0, 0, -M_PI/2}, {0, 0.056, 0}
    };
    
    Eigen::Matrix4d forwardKinematics(const JointAngles& q);
    std::vector<JointAngles> inverseKinematics(
        const Eigen::Vector3d& position, const Eigen::Matrix3d& rotation);
};

}
```

### 軌道生成（Trajectory Generation）

**使用ライブラリ**: Ruckig (MIT) - https://github.com/pantor/ruckig

```cpp
// cpp/src/trajectory.cpp
namespace RobotSim {

class TrajectoryPlanner {
public:
    struct MotionParams {
        std::array<double, 6> max_velocity;      // rad/s
        std::array<double, 6> max_acceleration;  // rad/s²
        std::array<double, 6> max_jerk;          // rad/s³
    };
    
    std::vector<TrajectoryPoint> plan(
        const std::array<double, 6>& start,
        const std::array<double, 6>& end,
        const MotionParams& params
    );
};

}
```

### ローカルWASMビルド手順（オプション）

```bash
# 1. Emscripten インストール（初回のみ）
brew install emscripten  # macOS
# または: sudo apt install emscripten  # Ubuntu

# 2. ビルド
cd cpp
mkdir -p build && cd build
emcmake cmake ..
make

# 3. 成果物をコピー
cp robot_sim.js robot_sim.wasm ../../src/lib/wasm/

# 4. コミット
git add src/lib/wasm/robot_sim.*
git commit -m "build: update WASM binary"
```

**ビルド頻度**: C++コード変更時のみ（オプション）

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/portfolio.git
cd portfolio

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## 🌐 Deploy

### Vercel（推奨）

1. GitHubにリポジトリを作成
2. Vercelでリポジトリを連携
3. 自動デプロイ完了

```mermaid
flowchart LR
    A[ローカル開発] --> B[git push]
    B --> C[Vercel自動検知]
    C --> D[ビルド & デプロイ]
    D --> E[本番公開]
```

---

## 🔍 Technical Challenges & Solutions

| チャレンジ | 解決策 |
|------------|--------|
| WASMの初期ロード | `dynamic import` + Suspenseで遅延読込 |
| 逆運動学の多解問題 | 最適解選択（現在姿勢からの最短距離） |
| 軌道生成のリアルタイム性 | S-curve補間でスムーズな動作 |
| 3Dモデルの軽量化 | プリミティブ図形の組み合わせで表現 |
| パラメータ調整の即時反映 | Zustandの`subscribe`でリアクティブ更新 |

---

## 📜 License

MIT License - See [LICENSE](LICENSE) for details.

### 依存ライブラリ（全てMIT互換）

| ライブラリ | ライセンス |
|------------|------------|
| Eigen | MPL2 |
| Ruckig | MIT |
| Emscripten | MIT |
| Next.js | MIT |
| Three.js | MIT |
| React Three Fiber | MIT |
| Tailwind CSS | MIT |
| Zustand | MIT |

---

## 👤 Author

**Your Name**

- Fullstack Engineer
- 「現場視点」×「フルスタック技術」で、自動化のラストワンマイルを埋める

---

*Built with ❤️ for Robotics Engineering*
