import type { ActiveSource } from '../../types/takeout';
import { loadFile, listKeys } from './indexedDbStorage';

let currentSource: ActiveSource = 'none';

export const fileLoader = {
  setActiveSource(source: ActiveSource): void {
    currentSource = source;
  },

  getActiveSource(): ActiveSource {
    return currentSource;
  },

  /**
   * Reads raw text content of a file from IndexedDB.
   */
  async readText(normalizedKey: string): Promise<string> {
    if (currentSource === 'none') {
      throw new Error('No Takeout data loaded. Please upload your Google Takeout archive.');
    }

    const content = await loadFile(normalizedKey);
    if (content === null || content === undefined) {
      throw new Error(`File not found in uploaded Takeout: ${normalizedKey}`);
    }
    return content;
  },

  /**
   * Reads raw text content of a file, or returns null if not found.
   */
  async readTextOptional(normalizedKey: string): Promise<string | null> {
    if (currentSource === 'none') {
      return null;
    }
    const content = await loadFile(normalizedKey);
    return content ?? null;
  },

  /**
   * Reads and parses JSON content.
   */
  async readJson<T>(normalizedKey: string): Promise<T> {
    const text = await this.readText(normalizedKey);
    return JSON.parse(text) as T;
  },

  /**
   * Reads and parses JSON content, or returns null if not found or invalid.
   */
  async readJsonOptional<T>(normalizedKey: string): Promise<T | null> {
    const text = await this.readTextOptional(normalizedKey);
    if (!text) return null;
    try {
      return JSON.parse(text) as T;
    } catch {
      return null;
    }
  },

  /**
   * Checks if a file exists in the loaded storage.
   */
  async hasFile(normalizedKey: string): Promise<boolean> {
    const content = await this.readTextOptional(normalizedKey);
    return content !== null;
  },

  /**
   * Lists stored keys matching prefix from IndexedDB.
   */
  async listStoredKeys(prefix: string = ''): Promise<string[]> {
    if (currentSource === 'uploaded') {
      return listKeys(prefix);
    }
    return [];
  },
};
