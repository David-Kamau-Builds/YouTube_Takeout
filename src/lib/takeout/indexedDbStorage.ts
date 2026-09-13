import type { TakeoutManifest } from '../../types/takeout';

const DB_NAME = 'yt_takeout_db';
const DB_VERSION = 1;
const STORE_FILES = 'files';
const STORE_META = 'meta';

export interface TakeoutSessionMeta {
  uploadedAt: number;
  archiveName: string;
  manifest: TakeoutManifest;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_FILES)) {
        db.createObjectStore(STORE_FILES);
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB'));
  });
}

/**
 * Atomically saves all extracted files and session metadata in a single transaction.
 */
export async function saveFiles(
  files: Map<string, string> | Record<string, string>,
  meta: TakeoutSessionMeta
): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_FILES, STORE_META], 'readwrite');
    const fileStore = tx.objectStore(STORE_FILES);
    const metaStore = tx.objectStore(STORE_META);

    tx.onabort = () => reject(tx.error ?? new Error('IndexedDB transaction aborted'));
    tx.onerror = () => reject(tx.error ?? new Error('Failed to write to IndexedDB'));
    tx.oncomplete = () => resolve();

    // Clear existing files first
    fileStore.clear();

    const entries = files instanceof Map ? files.entries() : Object.entries(files);
    for (const [key, content] of entries) {
      fileStore.put(content, key);
    }

    metaStore.put(meta, 'session');
  });
}

/**
 * Loads a single file by its normalized key.
 */
export async function loadFile(key: string): Promise<string | null> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_FILES, 'readonly');
    const store = tx.objectStore(STORE_FILES);
    const req = store.get(key);

    req.onsuccess = () => resolve((req.result as string) ?? null);
    req.onerror = () => reject(req.error ?? new Error(`Failed to load ${key}`));
  });
}

/**
 * Lists all stored file keys matching an optional prefix (e.g. 'playlists/').
 */
export async function listKeys(prefix: string = ''): Promise<string[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_FILES, 'readonly');
    const store = tx.objectStore(STORE_FILES);
    const req = store.getAllKeys();

    req.onsuccess = () => {
      const keys = (req.result as string[]) || [];
      if (!prefix) {
        resolve(keys);
      } else {
        resolve(keys.filter((k) => k.startsWith(prefix)));
      }
    };
    req.onerror = () => reject(req.error ?? new Error('Failed to list IndexedDB keys'));
  });
}

/**
 * Gets session metadata if present.
 */
export async function getMeta(): Promise<TakeoutSessionMeta | null> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_META, 'readonly');
    const store = tx.objectStore(STORE_META);
    const req = store.get('session');

    req.onsuccess = () => resolve((req.result as TakeoutSessionMeta) ?? null);
    req.onerror = () => reject(req.error ?? new Error('Failed to get session metadata'));
  });
}

/**
 * Clears all data from the database.
 */
export async function clearAll(): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_FILES, STORE_META], 'readwrite');
    tx.objectStore(STORE_FILES).clear();
    tx.objectStore(STORE_META).clear();

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Failed to clear database'));
  });
}
