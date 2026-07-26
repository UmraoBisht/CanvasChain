import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@canvas-chain/ui';
import {
  IconSelect,
  IconPan,
  IconRectangle,
  IconCircle,
  IconLine,
  IconArrow,
  IconText,
  IconPencil,
  IconEraser,
  IconFrame,
  IconSticky,
  IconImage,
  IconTable,
  IconConnector,
  IconComment,
  IconTemplate,
  IconShare,
  IconMic,
  IconUsers,
  IconShield,
  IconGrid,
} from '@canvas-chain/icons';

export default function DocsPage() {
  const phases = [
    {
      phase: 'Phase 1',
      title: 'Core Vector Engine',
      status: 'Completed',
      desc: '2D camera viewport math (20%-500% zoom, infinite pan), 9 vector drawing tools, 8-point resize, 360° rotation handles, continuous point eraser, undo/redo state manager.',
      icon: <IconPencil className="w-5 h-5 text-indigo-400" />,
    },
    {
      phase: 'Phase 2',
      title: 'Professional Whiteboard',
      status: 'Completed',
      desc: 'Frame artboards, sticky notes, image uploaders, 3x3 table grids, Bezier connectors, alignment & distribution tools, comment pins, pre-built template gallery.',
      icon: <IconFrame className="w-5 h-5 text-violet-400" />,
    },
    {
      phase: 'Phase 3',
      title: 'Multiplayer & WebRTC Voice',
      status: 'Completed',
      desc: 'Next.js SSE server stream relay (/api/sync), 60fps rAF Lerp smooth remote cursors, presence avatars with click-to-follow, WebRTC P2P voice call room, live chat, room permissions.',
      icon: <IconUsers className="w-5 h-5 text-emerald-400" />,
    },
  ];

  const modules = [
    { name: '@canvas-chain/canvas-engine', desc: 'Core viewport management, camera matrix transforms, and rendering contracts.' },
    { name: '@canvas-chain/ui', desc: 'Baseline UI elements, Tailwind CSS tokens, and Radix/Framer Motion primitives.' },
    { name: '@canvas-chain/types', desc: 'TypeScript domain definitions for Canvas Nodes, Sync Messages, Auth, and Viewport.' },
    { name: '@canvas-chain/utils', desc: 'Canvas 2D geometry math, point distance calculation, and ID generator.' },
    { name: '@canvas-chain/shared', desc: 'Global constants, default viewport specs, and design system token scales.' },
    { name: '@canvas-chain/icons', desc: 'Custom Lucide icon registry and whiteboard tool SVG icons.' },
    { name: '@canvas-chain/hooks', desc: 'Custom React 19 hooks for Theme management, Keyboard shortcuts, and Containers.' },
    { name: '@canvas-chain/service-sync', desc: 'Real-time WebSocket, SSE, and CRDT collaboration service contracts.' },
    { name: '@canvas-chain/service-auth', desc: 'Authentication state manager and guest user provider contract.' },
    { name: '@canvas-chain/service-storage', desc: 'Unified LocalStorage and IndexedDB persistence adapters.' },
  ];

  const shortcuts = [
    { key: 'V', tool: 'Select & Move Tool' },
    { key: 'H / Space', tool: 'Pan Canvas Camera' },
    { key: 'R', tool: 'Rectangle Shape' },
    { key: 'C', tool: 'Circle Shape' },
    { key: 'L', tool: 'Line Segment' },
    { key: 'A', tool: 'Arrow Vector' },
    { key: 'T', tool: 'Text Element' },
    { key: 'P', tool: 'Freehand Pencil' },
    { key: 'E', tool: 'Point-Level Eraser' },
    { key: 'F', tool: 'Frame / Artboard' },
    { key: 'S', tool: 'Sticky Post-It Note' },
    { key: 'I', tool: 'Image File Upload' },
    { key: 'K', tool: '3x3 Table Grid' },
    { key: 'X', tool: 'Bezier Curved Connector' },
    { key: 'M', tool: 'Comment Pin' },
    { key: 'Ctrl + Z', tool: 'Undo Last Action' },
    { key: 'Ctrl + Shift + Z', tool: 'Redo Action' },
    { key: 'Ctrl + G', tool: 'Group Selected Nodes' },
    { key: 'Ctrl + Shift + G', tool: 'Ungroup Selected Group' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-8 max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <header className="space-y-3 border-b border-border pb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
              C
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Canvas Chain Documentation Portal</h1>
          </div>
          <p className="text-muted-foreground text-xs pt-1">
            Production-ready infinite whiteboard platform architecture, package directory, and keyboard shortcuts guide.
          </p>
        </div>
        <a href="http://localhost:3000" target="_blank" rel="noreferrer">
          <Button size="sm" className="gap-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
            <span>Launch Canvas App</span>
          </Button>
        </a>
      </header>

      {/* Feature Phases Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
          <span>Platform Capabilities & Implementation Phases</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {phases.map((p) => (
            <Card key={p.phase} className="p-5 bg-card/70 border-border/80 shadow-md space-y-3 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-secondary/60">{p.icon}</div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {p.status}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-mono text-indigo-400">{p.phase}</span>
                <h3 className="text-sm font-bold text-foreground">{p.title}</h3>
                <p className="text-xs text-muted-foreground pt-1 leading-relaxed">{p.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Package Directory */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight text-foreground">Monorepo Package Directory</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map((mod) => (
            <Card key={mod.name} className="border-border/70 hover:border-primary/50 transition-colors rounded-xl">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-mono text-indigo-400">{mod.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
                {mod.desc}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Keyboard Shortcuts Reference Table */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight text-foreground">Keyboard Shortcuts & Tool Reference</h2>
        <Card className="p-4 border-border/70 rounded-xl overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {shortcuts.map((s) => (
              <div key={s.key} className="flex items-center justify-between p-2 rounded-lg bg-secondary/40 border border-border/50 text-xs">
                <span className="font-semibold text-foreground">{s.tool}</span>
                <kbd className="px-2 py-0.5 rounded bg-background border border-border font-mono font-bold text-[10px] text-indigo-400">
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
