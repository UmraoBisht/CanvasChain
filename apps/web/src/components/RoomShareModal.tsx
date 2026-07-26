'use client';

import React, { useState } from 'react';
import { Button, Card } from '@canvas-chain/ui';
import { IconLink, IconShield, IconEye } from '@canvas-chain/icons';

interface RoomShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'editor' | 'viewer';
  onRoleChange: (role: 'editor' | 'viewer') => void;
}

export function RoomShareModal({ isOpen, onClose, role, onRoleChange }: RoomShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 bg-card border border-border shadow-2xl space-y-5 rounded-2xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <IconShield className="w-5 h-5 text-indigo-500" />
            <h2 className="text-base font-bold text-foreground">Share Room & Permissions</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        {/* Room URL Link */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Collaborative Room Link</label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={typeof window !== 'undefined' ? window.location.href : ''}
              className="flex-1 bg-secondary/60 px-3 py-1.5 rounded-lg text-xs font-mono border border-border text-foreground select-all"
            />
            <Button size="sm" onClick={handleCopy} className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
              <IconLink className="w-3.5 h-3.5" />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>

        {/* Permission Role Switch */}
        <div className="space-y-2 border-t border-border pt-3">
          <label className="text-xs font-semibold text-muted-foreground">Your Room Role</label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={role === 'editor' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onRoleChange('editor')}
              className="gap-2 text-xs"
            >
              <IconShield className="w-4 h-4 text-indigo-400" />
              <span>Editor (Full Access)</span>
            </Button>
            <Button
              variant={role === 'viewer' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onRoleChange('viewer')}
              className="gap-2 text-xs"
            >
              <IconEye className="w-4 h-4 text-amber-400" />
              <span>Viewer (Read Only)</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
