import "@testing-library/jest-dom/vitest";

// Three.js / React Three Fiber のモック
// 3Dレンダリングはjsdomでは不可のため、Canvas系コンポーネントをモック化
vi.mock("@react-three/fiber", () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => children,
  useFrame: vi.fn(),
  useThree: () => ({
    camera: { position: { set: vi.fn() } },
    gl: { setSize: vi.fn() },
    scene: {},
  }),
}));

vi.mock("@react-three/drei", () => ({
  OrbitControls: () => null,
  Environment: () => null,
  ContactShadows: () => null,
  Html: ({ children }: { children: React.ReactNode }) => children,
}));
