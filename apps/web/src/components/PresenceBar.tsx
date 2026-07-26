'use client';

import React from 'react';
import { IconUsers } from '@canvas-chain/icons';

export interface CollaboratorUser {
  id: string;
  name: string;
  color: string;
  avatar: string;
  isSelf?: boolean;
}

interface PresenceBarProps {
  users: CollaboratorUser[];
  onUserClick?: (user: CollaboratorUser) => void;
  onAddPeer?: () => void;
}

export function PresenceBar({ users, onUserClick, onAddPeer }: PresenceBarProps) {
  return (
    <div className="flex items-center space-x-1 px-1">
      <div className="flex items-center -space-x-2 overflow-hidden">
        {users.map((u) => (
          <div
            key={u.id}
            onClick={() => onUserClick && onUserClick(u)}
            title={`${u.name} ${u.isSelf ? '(You)' : '(Click to follow)'}`}
            style={{ borderColor: u.color }}
            className="relative h-7 w-7 rounded-full border-2 bg-card text-foreground flex items-center justify-center font-bold text-[10px] shadow-sm cursor-pointer transition-transform hover:scale-110 hover:z-10"
          >
            {u.avatar || u.name.slice(0, 2).toUpperCase()}
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-background" />
          </div>
        ))}
      </div>

      {onAddPeer && (
        <button
          onClick={onAddPeer}
          title="Simulate / Add Test Collaborator Peer"
          className="h-7 px-2 rounded-full bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 text-[10px] font-semibold flex items-center gap-1 transition-colors"
        >
          <IconUsers className="w-3 h-3 text-indigo-400" />
          <span>+ Peer</span>
        </button>
      )}
    </div>
  );
}
