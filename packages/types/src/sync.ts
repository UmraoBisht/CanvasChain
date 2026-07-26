export type SyncStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

export interface SyncMessage<T = unknown> {
  id: string;
  type: 'node:update' | 'node:delete' | 'cursor:move' | 'presence:join' | 'presence:leave';
  senderId: string;
  timestamp: number;
  payload: T;
}

export interface UserPresence {
  userId: string;
  userName: string;
  userAvatar?: string;
  cursorPosition?: { x: number; y: number };
  color: string;
}
