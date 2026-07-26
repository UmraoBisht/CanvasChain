import { SyncStatus, SyncMessage } from '@canvas-chain/types';
import { SyncAdapter } from './SyncService';

export class WebSocketSyncService implements SyncAdapter {
  private socket: WebSocket | null = null;
  private status: SyncStatus = 'disconnected';
  private messageHandlers: Set<(msg: SyncMessage<any>) => void> = new Set();
  private activeRoom: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimer: any = null;
  private fallbackChannel: BroadcastChannel | null = null;

  constructor(private serverUrl: string = 'ws://localhost:3001') {}

  async connect(roomId: string): Promise<void> {
    this.activeRoom = roomId;
    this.status = 'connecting';

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.fallbackChannel = new BroadcastChannel(`canvas-chain-room-${roomId}`);
      this.fallbackChannel.onmessage = (event) => {
        this.notifyHandlers(event.data);
      };
    }

    return new Promise((resolve) => {
      try {
        this.socket = new WebSocket(`${this.serverUrl}?room=${roomId}`);

        this.socket.onopen = () => {
          this.status = 'connected';
          this.reconnectAttempts = 0;
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.notifyHandlers(data);
          } catch (e) {}
        };

        this.socket.onclose = () => {
          this.status = 'disconnected';
          this.scheduleReconnect();
        };

        this.socket.onerror = () => {
          this.status = 'error';
          // Fallback gracefully to in-memory channel
          resolve();
        };
      } catch (err) {
        this.status = 'disconnected';
        resolve();
      }
    });
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    if (this.fallbackChannel) {
      this.fallbackChannel.close();
      this.fallbackChannel = null;
    }
    this.status = 'disconnected';
    this.activeRoom = null;
  }

  broadcastMessage<T>(message: Omit<SyncMessage<T>, 'id' | 'timestamp'>): void {
    const fullMsg: SyncMessage<T> = {
      ...message,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
    };

    // Send over WebSocket if connected
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(fullMsg));
    }

    // Broadcast over local channel
    if (this.fallbackChannel) {
      try {
        this.fallbackChannel.postMessage(fullMsg);
      } catch (e) {}
    }
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

  private notifyHandlers(msg: any) {
    this.messageHandlers.forEach((handler) => handler(msg));
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.activeRoom) {
      this.reconnectAttempts++;
      const timeout = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
      this.reconnectTimer = setTimeout(() => {
        if (this.activeRoom) {
          this.connect(this.activeRoom);
        }
      }, timeout);
    }
  }
}
