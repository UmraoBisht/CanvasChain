# Canvas Chain Architect 🎨

Production-ready, infinite collaborative whiteboard platform built with **Next.js 15 (App Router)**, **React 19**, **Zustand**, **Tailwind CSS**, **WebRTC**, and **Turborepo**.

---

## Key Features

### 1. Vector Engine & Infinite Canvas
- **2D Camera System**: Infinite pan and zoom from 20% to 500%.
- **Vector Tools**: Selection, Pan, Rectangle, Circle, Line, Arrow, Text, Freehand Pencil, Point-Level Eraser.
- **Transform Handles**: 8-point interactive resize, 360° rotation, and marquee selection.

### 2. Professional Whiteboard Tools
- **Frames & Artboards**: Group nodes inside moveable frames.
- **Rich Content Nodes**: Sticky Notes, Image Uploads, 3x3 Table Grids, Bezier Curved Connectors.
- **Alignment & Distribution**: Align Left/Center/Right/Top/Middle/Bottom, Distribute Horizontal/Vertical.
- **Templates Gallery**: Kanban Board, Mind Map, User Flowchart.
- **Comment Pins**: Threaded comments with author tags and resolution toggles.

### 3. Real-Time Multiplayer & WebRTC Voice
- **Server Stream Relay (`/api/sync`)**: Next.js Server-Sent Events (SSE) hub powering real-time cross-browser sync.
- **Silk-Smooth 60fps Cursors**: GPU-accelerated `requestAnimationFrame` Lerp interpolation for buttery fluid remote cursor movement.
- **Presence & Click-to-Follow**: Online avatar stack with click-to-jump camera viewports.
- **Live Text Chat**: Embedded text messaging drawer with timestamps and unread badges.
- **Native WebRTC Voice Calling**: WebRTC P2P audio call room with STUN peer discovery, mic mute/unmute, and Web Audio API active speaker visualizer.
- **Room Access Control**: Toggle between Editor (full access) and Viewer (read-only mode).

---

## Monorepo Architecture

```
canvas-chain/
├── apps/
│   ├── web/           # Next.js 15 + React 19 Frontend App
│   └── docs/          # Documentation App
├── packages/
│   ├── canvas-engine/ # Core Vector & Rendering Math Engine
│   ├── ui/            # Reusable Design System UI Components
│   ├── icons/         # Custom Lucide Canvas Icon System
│   ├── types/         # TypeScript Interfaces & Schemas
│   ├── shared/        # Shared Constants & Utilities
│   ├── hooks/         # Custom React Hooks
│   ├── utils/         # Math & Geometry Helper Functions
│   └── config/        # Shared ESLint & TS Configs
└── services/
    ├── sync/          # Collaborative Sync Microservice
    ├── auth/          # Authentication Service
    └── storage/       # Persistence & Cloud Storage Service
```

---

## Development Setup

```bash
# Install monorepo dependencies
pnpm install

# Start local development server (Web app on http://localhost:3000)
pnpm run dev

# Run TypeScript verification across all 13 monorepo packages
pnpm run typecheck
```

---

## License
MIT
