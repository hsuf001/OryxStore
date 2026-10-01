// IndexedDB wrapper to store and retrieve large video blobs without crashing Chrome or exceeding LocalStorage quota.
const DB_NAME = 'OryxVideoDb';
const STORE_NAME = 'videos';

export function initDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function storeVideoBlob(id: string, blob: Blob): Promise<string> {
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(blob, id);
      request.onsuccess = () => resolve(`blob-db:${id}`);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Error storing video in IndexedDB:', err);
    throw err;
  }
}

export async function getVideoBlobUrl(id: string): Promise<string | null> {
  if (!id || !id.startsWith('blob-db:')) return null;
  const key = id.replace('blob-db:', '');
  try {
    const db = await initDb();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);
      request.onsuccess = () => {
        const blob = request.result as Blob;
        if (blob) {
          resolve(URL.createObjectURL(blob));
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  } catch (err) {
    console.error('Error reading video from IndexedDB:', err);
    return null;
  }
}
