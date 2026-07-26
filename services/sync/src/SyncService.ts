import { SyncStatus, SyncMessage, UserPresence } from '@canvas-chain/types';

export interface SyncAdapter {
  connect(roomId: string): Promise<void>;
  disconnect(): void;
  broadcastMessage<T>(message: Omit<SyncMessage<T>, 'id' | 'timestamp'>): void;
  onMessage<T>(handler: (msg: SyncMessage<T>) => void): () => void;
  getStatus(): SyncStatus;
}

export class MockSyncService implements SyncAdapter {
  private status: SyncStatus = 'disconnected';
  private messageHandlers: Set<(msg: SyncMessage<any>) => void> = new Set();
  private activeRoom: string | null = null;

  async connect(roomId: string): Promise<void> {
    this.status = 'connecting';
    this.activeRoom = roomId;
    this.status = 'connected';
  }

  disconnect(): void {
    this.status = 'disconnected';
    this.activeRoom = null;
  }

  broadcastMessage<T>(message: Omit<SyncMessage<T>, 'id' | 'timestamp'>): void {
    const fullMsg: SyncMessage<T> = {
      ...message,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
    };
    this.messageHandlers.forEach((handler) => handler(fullMsg));
  }

  onMessage<T>(handler: (msg: SyncMessage<T>) => void): () => void {
    this.messageHandlers.add(handler as any);
    return () => {
      this.messageHandlers.delete(handler as any);
    };
  }

  getStatus(): SyncStatus {
    return this.status;
  }
}
