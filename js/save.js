/**
 * IndexedDB persistence for Barbell Legends.
 */
const DB_NAME = 'BarbellLegendsDB';
const DB_VERSION = 1;
const STORE = 'saves';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
  });
}

export async function saveGame(data) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      const record = { id: 'main', ...data, savedAt: Date.now() };
      const req = store.put(record);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('Save failed, using localStorage fallback', e);
    try {
      localStorage.setItem('barbell_legends_save', JSON.stringify({ id: 'main', ...data, savedAt: Date.now() }));
      return true;
    } catch (e2) {
      console.error(e2);
      return false;
    }
  }
}

export async function loadGame() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const store = tx.objectStore(STORE);
      const req = store.get('main');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('Load from IDB failed, trying localStorage', e);
    try {
      const raw = localStorage.getItem('barbell_legends_save');
      return raw ? JSON.parse(raw) : null;
    } catch (e2) {
      return null;
    }
  }
}

export async function deleteGame() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      const req = store.delete('main');
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    localStorage.removeItem('barbell_legends_save');
    return true;
  }
}

export async function hasSave() {
  const data = await loadGame();
  return !!data && !!data.character;
}

export function exportSave(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `barbell-legends-save-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importSaveFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        resolve(data);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
