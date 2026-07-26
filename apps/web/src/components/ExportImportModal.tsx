'use client';

import React, { useRef } from 'react';
import { useCanvasStore } from '../store/useCanvasStore';
import { exportToPng, exportToSvg, exportToJson, importFromJson } from '../utils/exportUtils';
import { Button, Card } from '@canvas-chain/ui';
import { IconDownload, IconUpload } from '@canvas-chain/icons';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportImportModal({ isOpen, onClose }: ExportImportModalProps) {
  const { nodes, loadWorkspaceState } = useCanvasStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const importedNodes = await importFromJson(file);
      loadWorkspaceState(importedNodes);
      onClose();
    } catch (err) {
      alert('Failed to import JSON whiteboard file.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md p-6 bg-card border border-border shadow-2xl space-y-5 rounded-xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
            <IconDownload className="w-5 h-5 text-indigo-500" />
            <span>Export & Import Workspace</span>
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        {/* Export Options */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Export Options</h4>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              onClick={() => {
                exportToPng(nodes);
                onClose();
              }}
              className="flex flex-col items-center justify-center h-20 gap-1 hover:border-indigo-500"
            >
              <span className="font-bold text-foreground">PNG</span>
              <span className="text-[10px] text-muted-foreground">Image file</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                exportToSvg(nodes);
                onClose();
              }}
              className="flex flex-col items-center justify-center h-20 gap-1 hover:border-indigo-500"
            >
              <span className="font-bold text-foreground">SVG</span>
              <span className="text-[10px] text-muted-foreground">Vector file</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                exportToJson(nodes);
                onClose();
              }}
              className="flex flex-col items-center justify-center h-20 gap-1 hover:border-indigo-500"
            >
              <span className="font-bold text-foreground">JSON</span>
              <span className="text-[10px] text-muted-foreground">Board backup</span>
            </Button>
          </div>
        </div>

        {/* Import Section */}
        <div className="space-y-3 border-t border-border pt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Import Backup</h4>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            className="w-full gap-2"
          >
            <IconUpload className="w-4 h-4" />
            <span>Load Workspace from JSON</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
