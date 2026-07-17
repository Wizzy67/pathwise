import { openDB } from 'idb';

const DB_NAME = 'pathwise-db';
const DB_VERSION = 1;

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('cache')) {
        db.createObjectStore('cache');
      }
      if (!db.objectStoreNames.contains('syncQueue')) {
        const store = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        store.createIndex('action', 'action');
      }
    },
  });
};

export const setCache = async (key, value) => {
  const db = await initDB();
  return db.put('cache', value, key);
};

export const getCache = async (key) => {
  const db = await initDB();
  return db.get('cache', key);
};

export const clearCache = async () => {
  const db = await initDB();
  return db.clear('cache');
};

// Queue actions for offline sync
export const enqueueAction = async (action, payload) => {
  const db = await initDB();
  return db.add('syncQueue', { action, payload, timestamp: new Date().toISOString() });
};

export const getSyncQueue = async () => {
  const db = await initDB();
  return db.getAll('syncQueue');
};

export const removeQueueItem = async (id) => {
  const db = await initDB();
  return db.delete('syncQueue', id);
};
