export interface StorageRecord<T = unknown> {
  key: string;
  data: T;
  version: number;
  lastModified: number;
}

export interface StorageAdapter {
  getItem<T>(key: string): Promise<T | null>;
  setItem<T>(key: string, value: T): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}
