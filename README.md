# Canvas Chain Architect 🎨

> Enterprise-grade, real-time collaborative infinite whiteboard monorepo built with **Next.js 16 (App Router)**, **React 19.2**, **Zustand**, **Tailwind CSS**, **WebRTC**, **ESLint 9 Flat Config**, **Vitest 4**, and **Turborepo 2.10**.

---

## 🌟 Key Features

### 📐 1. Vector Engine & Infinite Canvas
- **2D Camera System**: Infinite pan (`H` / Space drag) & zoom from 20% to 500% with smooth matrix transformation math.
- **Vector Tooling Suite**: Selection (`V`), Pan (`H`), Rectangle (`R`), Circle (`C`), Line (`L`), Arrow (`A`), Text (`T`), Freehand Pencil (`P`), Point-Level Eraser (`E`).
- **Transform Handles**: 8-point interactive resize handles with aspect-ratio lock (`Shift`), 360° rotation handle, and marquee selection.
- **Undo / Redo & History**: Full undo/redo stack (`Ctrl+Z` / `Ctrl+Shift+Z`), Duplicate (`Ctrl+D`), and Copy-Paste support.

### 🖼️ 2. Professional Whiteboard Tools
- **Frames & Artboards (`F`)**: Group and organize nodes inside moveable frame containers with custom titles.
- **Rich Content Nodes**: Sticky Notes (`S`), Image Uploads (`I`), 3x3 Interactive Table Grids (`K`), Bezier Curved Connectors (`X`).
- **Alignment & Distribution**: Align Left, Center, Right, Top, Middle, Bottom, and Distribute Horizontally/Vertically.
- **Template Gallery**: Inject pre-built Kanban Boards, Mind Maps, and User Flowcharts with one click.
- **Comment Pins (`M`)**: Threaded comment pins with author tags, live reply streams, and resolution toggles.

### 🌐 3. Real-Time Collaboration & WebRTC Engine
- **Silk-Smooth 60fps Remote Cursors**: GPU-accelerated `translate3d(x, y, 0)` with 60fps `requestAnimationFrame` Lerp interpolation (`0.55` dampening) and 150px instant snap threshold.
- **Next.js SSE Server Relay (`/api/sync`)**: Server-Sent Events stream hub delivering real-time cross-browser state, cursor, and chat sync.
- **Native WebRTC P2P Voice Calling**: Built-in audio room powered by `RTCPeerConnection` with STUN discovery (`stun:stun.l.google.com:19302`), mic mute/unmute, and Web Audio API active speaker visualizers.
- **Presence & Click-to-Follow**: Live avatar stack with online indicators and click-to-jump camera viewports.
- **Live Text Chat**: Slide-over messaging drawer with timestamps and unread badges.
- **Room Access Control**: Instant role switching between **Editor** (full editing capability) and **Viewer** (read-only mode).

---

## 🏗️ Monorepo Architecture

```text
canvas-chain/
├── apps/
│   ├── web/           # Next.js 16 + React 19.2 Interactive Canvas App
│   └── docs/          # Architecture Portal & Keyboard Shortcuts App
├── packages/
│   ├── canvas-engine/ # Core Vector Camera & Matrix Rendering Math Engine
│   ├── ui/            # Reusable Design System Components & Tailwind Preset
│   ├── icons/         # Custom Lucide Canvas Tool Iconography Package
│   ├── types/         # TypeScript Interfaces, Types & Schemas
│   ├── shared/        # Shared Constants & Scale Tokens
│   ├── hooks/         # Custom React 19 Hooks Library
│   ├── utils/         # Math, Geometry & ID Helper Utilities
│   └── config/        # Base Shared TypeScript & ESLint Configurations
└── services/
    ├── sync/          # Collaborative Sync Microservice & Socket Framer
    ├── auth/          # Authentication & Guest Adapter Service
    └── storage/       # IndexedDB & LocalStorage Cloud Persistence Service
```

---

## 🛠️ Tech Stack & Dependencies

- **Framework**: Next.js 16.2 (App Router with `next.config.ts`)
- **UI & React**: React 19.2, Tailwind CSS 3.4, Framer Motion 12.42
- **State Management**: Zustand 5.0, TanStack React Query 5.101
- **Real-Time Sync**: WebRTC P2P DataChannel + Next.js SSE Server Stream Relay
- **Linting & Formatting**: ESLint 9.39 (Flat Config `eslint.config.mjs`), Prettier 3.9
- **Testing & Monorepo Tooling**: Vitest 4.1, Playwright 1.62, Turborepo 2.10, pnpm 10.6

---

## 🚀 Getting Started

```bash
# 1. Install monorepo dependencies
pnpm install

# 2. Start development servers (Web app on http://localhost:3000 | Docs on http://localhost:3001)
pnpm run dev

# 3. Run ESLint across all apps (ESLint 9 Flat Config)
pnpm run lint

# 4. Run TypeScript verification across all 13 monorepo packages
pnpm run typecheck

# 5. Run unit tests with Vitest 4
pnpm test
```

---

## 📄 License

Distributed under the [MIT License](LICENSE).
