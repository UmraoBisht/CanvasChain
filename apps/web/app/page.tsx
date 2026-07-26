'use client';

import React, { useState } from 'react';
import { useCanvasStore } from '../src/store/useCanvasStore';
import { useTheme } from '@canvas-chain/hooks';
import { useCollaboration } from '../src/hooks/useCollaboration';
import { Button, Toolbar, Card } from '@canvas-chain/ui';
import { InteractiveCanvas } from '../src/components/InteractiveCanvas';
import { PropertiesSidebar } from '../src/components/PropertiesSidebar';
import { Minimap } from '../src/components/Minimap';
import { ExportImportModal } from '../src/components/ExportImportModal';
import { AlignmentToolbar } from '../src/components/AlignmentToolbar';
import { TemplatesModal } from '../src/components/TemplatesModal';
import { PresenceBar } from '../src/components/PresenceBar';
import { ChatPanel } from '../src/components/ChatPanel';
import { VoiceCallPanel } from '../src/components/VoiceCallPanel';
import { RoomShareModal } from '../src/components/RoomShareModal';
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
  IconGrid,
  IconSun,
  IconMoon,
  IconShare,
  IconZoomIn,
  IconZoomOut,
  IconUndo,
  IconRedo,
  IconDownload,
} from '@canvas-chain/icons';
import { CanvasToolMode } from '@canvas-chain/types';

export default function CanvasPage() {
  const {
    activeTool,
    setActiveTool,
    isGridVisible,
    toggleGrid,
    viewport,
    nodes,
    zoomIn,
    zoomOut,
    resetZoom,
    undo,
    redo,
    past,
    future,
    setViewport,
  } = useCanvasStore();

  const {
    currentUser,
    collaborators,
    remoteCursors,
    chatMessages,
    sendChatMessage,
    broadcastCursorMove,
    roomRole,
    setRoomRole,
  } = useCollaboration();

  const { theme, toggleTheme, mounted } = useTheme('dark');

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const tools: { mode: CanvasToolMode; label: string; shortcut: string; icon: React.ReactNode }[] = [
    { mode: 'select', label: 'Select & Move (V)', shortcut: 'V', icon: <IconSelect className="w-4 h-4" /> },
    { mode: 'pan', label: 'Pan Canvas (H)', shortcut: 'H', icon: <IconPan className="w-4 h-4" /> },
    { mode: 'rectangle', label: 'Rectangle (R)', shortcut: 'R', icon: <IconRectangle className="w-4 h-4" /> },
    { mode: 'circle', label: 'Circle (C)', shortcut: 'C', icon: <IconCircle className="w-4 h-4" /> },
    { mode: 'line', label: 'Line (L)', shortcut: 'L', icon: <IconLine className="w-4 h-4" /> },
    { mode: 'arrow', label: 'Arrow (A)', shortcut: 'A', icon: <IconArrow className="w-4 h-4" /> },
    { mode: 'text', label: 'Text (T)', shortcut: 'T', icon: <IconText className="w-4 h-4" /> },
    { mode: 'pencil', label: 'Pencil (P)', shortcut: 'P', icon: <IconPencil className="w-4 h-4" /> },
    { mode: 'eraser', label: 'Eraser (E)', shortcut: 'E', icon: <IconEraser className="w-4 h-4" /> },
    { mode: 'frame', label: 'Frame / Artboard (F)', shortcut: 'F', icon: <IconFrame className="w-4 h-4" /> },
    { mode: 'sticky', label: 'Sticky Note (S)', shortcut: 'S', icon: <IconSticky className="w-4 h-4" /> },
    { mode: 'image', label: 'Image Upload (I)', shortcut: 'I', icon: <IconImage className="w-4 h-4" /> },
    { mode: 'table', label: 'Table Grid (K)', shortcut: 'K', icon: <IconTable className="w-4 h-4" /> },
    { mode: 'connector', label: 'Curved Connector (X)', shortcut: 'X', icon: <IconConnector className="w-4 h-4" /> },
    { mode: 'comment', label: 'Comment Pin (M)', shortcut: 'M', icon: <IconComment className="w-4 h-4" /> },
  ];

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-background text-foreground select-none flex flex-col">
      {/* Top Application Header */}
      <header className="h-14 border-b border-border/60 px-4 flex items-center justify-between bg-card/60 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
            C
          </div>
          <div>
            <h1 className="font-semibold text-sm tracking-tight">Canvas Chain Whiteboard</h1>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
              <span>Phase 3 — Real-Time Multiplayer</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="font-mono text-emerald-400 capitalize">{roomRole} Mode</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Active Collaborators Avatar Stack */}
          <div className="border-r border-border/60 pr-2 mr-1 flex items-center gap-2">
            <PresenceBar
              users={collaborators}
              onUserClick={(user) => {
                const targetCursor = remoteCursors.find((c) => c.id === user.id);
                if (targetCursor) {
                  setViewport({
                    ...viewport,
                    x: -targetCursor.x + window.innerWidth / 2,
                    y: -targetCursor.y + window.innerHeight / 2,
                  });
                }
              }}
            />
          </div>

          {/* Undo / Redo */}
          <div className="flex items-center gap-1 border-r border-border/60 pr-2 mr-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={undo}
              disabled={past.length === 0 || roomRole === 'viewer'}
              title="Undo (Ctrl+Z)"
            >
              <IconUndo className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={redo}
              disabled={future.length === 0 || roomRole === 'viewer'}
              title="Redo (Ctrl+Shift+Z)"
            >
              <IconRedo className="w-4 h-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTemplatesModalOpen(true)}
            className="gap-1.5 text-xs bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20"
          >
            <IconTemplate className="w-3.5 h-3.5" />
            Templates
          </Button>

          <Button variant="outline" size="sm" onClick={toggleGrid} className="gap-1.5 text-xs">
            <IconGrid className="w-3.5 h-3.5" />
            {isGridVisible ? 'Grid On' : 'Grid Off'}
          </Button>

          <Button variant="outline" size="sm" onClick={() => setIsExportModalOpen(true)} className="gap-1.5 text-xs">
            <IconDownload className="w-3.5 h-3.5" />
            Export / Import
          </Button>

          <Button variant="outline" size="sm" onClick={toggleTheme} className="gap-1.5 text-xs">
            {mounted && theme === 'dark' ? <IconSun className="w-3.5 h-3.5" /> : <IconMoon className="w-3.5 h-3.5" />}
            {mounted && theme === 'dark' ? 'Light' : 'Dark'}
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => setIsShareModalOpen(true)}
            className="gap-1.5 text-xs font-medium bg-primary hover:bg-primary/90"
          >
            <IconShare className="w-3.5 h-3.5" />
            Share Room
          </Button>
        </div>
      </header>

      {/* Main Interactive Canvas Surface */}
      <div className="relative flex-1 w-full h-full overflow-hidden bg-[var(--canvas-bg)]">
        <InteractiveCanvas remoteCursors={remoteCursors} role={roomRole} onCursorMove={broadcastCursorMove} />

        {/* Alignment & Distribution Floating Toolbar */}
        {roomRole === 'editor' && <AlignmentToolbar />}

        {/* Floating Tool Palette */}
        {roomRole === 'editor' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
            <Toolbar>
              {tools.map((tool) => (
                <Button
                  key={tool.mode}
                  variant={activeTool === tool.mode ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setActiveTool(tool.mode)}
                  title={tool.label}
                  className={activeTool === tool.mode ? 'shadow-sm bg-primary text-primary-foreground' : ''}
                >
                  {tool.icon}
                </Button>
              ))}
            </Toolbar>
          </div>
        )}

        {/* Properties Inspector Sidebar */}
        {roomRole === 'editor' && <PropertiesSidebar />}

        {/* Floating Status & Viewport Card */}
        <div className="absolute bottom-4 left-4 z-30 pointer-events-none">
          <Card className="p-3 bg-card/80 backdrop-blur-md border border-border/70 shadow-lg text-xs space-y-2 w-56 pointer-events-auto">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Active Mode:</span>
              <span className="font-semibold capitalize text-indigo-400">{roomRole} Mode</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Zoom Scale:</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={zoomOut} title="Zoom Out (-)">
                  <IconZoomOut className="w-3 h-3" />
                </Button>
                <button
                  onClick={resetZoom}
                  title="Reset Zoom (0)"
                  className="font-mono font-semibold text-foreground hover:underline"
                >
                  {Math.round(viewport.zoom * 100)}%
                </button>
                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={zoomIn} title="Zoom In (+)">
                  <IconZoomIn className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Elements:</span>
              <span className="font-mono text-foreground font-semibold">
                {Object.keys(nodes).length}
              </span>
            </div>
          </Card>
        </div>

        {/* Minimap Thumbnail Navigator */}
        <Minimap />

        {/* Voice Call Floating Widget */}
        <VoiceCallPanel currentUser={currentUser} />

        {/* Live Text Chat Panel */}
        <ChatPanel messages={chatMessages} onSendMessage={sendChatMessage} />
      </div>

      {/* Export / Import Modal */}
      <ExportImportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} />

      {/* Templates Modal */}
      <TemplatesModal isOpen={isTemplatesModalOpen} onClose={() => setIsTemplatesModalOpen(false)} />

      {/* Room Share Modal */}
      <RoomShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        role={roomRole}
        onRoleChange={setRoomRole}
      />
    </main>
  );
}
