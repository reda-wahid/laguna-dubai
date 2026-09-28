import { MENU_DATA as INITIAL_MENU_DATA, MainSection, MenuItem } from '../data/menuData';
import { doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';

const STORAGE_KEY = 'laguna_menu_data_v11';
const ADMIN_PIN_KEY = 'laguna_admin_auth_pin';
let isSyncing = false;
let lastServerTimestamp = 0;
let cachedMenuData: MainSection[] | null = null;

// Multi-Tab Real-time Broadcast Channel
const menuChannel =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('laguna_menu_realtime_sync')
    : null;

/**
 * Gets the current admin authentication PIN from session or memory.
 */
export function getAdminPin(): string {
  if (typeof window === 'undefined') return '102030';
  return sessionStorage.getItem(ADMIN_PIN_KEY) || '102030';
}

export function setAdminPin(pin: string) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(ADMIN_PIN_KEY, pin);
}

/**
 * Helper to dispatch menu update event to the local window with the latest data in detail
 */
function notifyLocalUpdate(data: MainSection[]) {
  cachedMenuData = data;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent<MainSection[]>('laguna-menu-updated', {
        detail: data,
      })
    );
  }
}

/**
 * Synchronously retrieves stored menu data for instant, zero-flicker UI render.
 * Also triggers background server sync.
 */
export function getStoredMenuData(): MainSection[] {
  if (cachedMenuData && cachedMenuData.length > 0) {
    return cachedMenuData;
  }

  if (typeof window === 'undefined') return INITIAL_MENU_DATA;

  // Trigger background server sync
  initiateServerSync();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedMenuData = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading menu data from local cache:', err);
  }

  cachedMenuData = INITIAL_MENU_DATA;
  return INITIAL_MENU_DATA;
}

/**
 * Background sync: queries /api/menu to ensure this client has the latest server-persisted menu data.
 */
export async function initiateServerSync(): Promise<void> {
  if (typeof window === 'undefined' || isSyncing) return;
  isSyncing = true;

  try {
    const res = await fetch('/api/menu', {
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (res.ok) {
      const { data, lastModified } = await res.json();
      if (data && Array.isArray(data) && data.length > 0) {
        if (lastModified && lastModified !== lastServerTimestamp) {
          lastServerTimestamp = lastModified;
          const currentRaw = localStorage.getItem(STORAGE_KEY);
          const newRaw = JSON.stringify(data);
          if (currentRaw !== newRaw) {
            localStorage.setItem(STORAGE_KEY, newRaw);
            notifyLocalUpdate(data);
          }
        }
      } else {
        // If server is clean, seed it with current local data
        const local = localStorage.getItem(STORAGE_KEY);
        const dataToSeed = local ? JSON.parse(local) : INITIAL_MENU_DATA;
        await fetch('/api/menu', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-pin': getAdminPin(),
          },
          body: JSON.stringify({ data: dataToSeed }),
        });
      }
    }
  } catch {
    // Offline or network error: gracefully fall back to local storage
  } finally {
    isSyncing = false;
  }
}

/**
 * Uploads a local image file (compressed data URL) directly to Firebase Firestore
 * under collection 'uploaded_images' and persists it so it is never lost.
 */
export async function saveUploadedImageToFirebase(dataUrl: string, name?: string): Promise<string> {
  if (!dataUrl) return '';
  const imageId = 'img_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);

  try {
    const imageDocRef = doc(db, 'uploaded_images', imageId);
    await setDoc(imageDocRef, {
      id: imageId,
      name: name || 'Uploaded Local Image',
      dataUrl,
      createdAt: Date.now(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `uploaded_images/${imageId}`);
  }

  // Also backup to server upload endpoint if available
  try {
    fetch('/api/upload-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-pin': getAdminPin(),
      },
      body: JSON.stringify({ dataUrl, name, imageId }),
    }).catch(() => {});
  } catch {
    // silent
  }

  return dataUrl;
}

/**
 * Synchronizes an individual product to Firebase collection 'products'
 * Handles additions, edits, and deletions cleanly.
 */
export async function syncProductToFirebase(item: MenuItem, isDelete = false): Promise<void> {
  if (!item || !item.id) return;
  try {
    const prodDocRef = doc(db, 'products', item.id);
    if (isDelete) {
      await deleteDoc(prodDocRef);
    } else {
      await setDoc(prodDocRef, {
        ...item,
        lastModified: Date.now(),
      }, { merge: true });
    }
  } catch (err) {
    handleFirestoreError(err, isDelete ? OperationType.DELETE : OperationType.WRITE, `products/${item.id}`);
  }
}

/**
 * Saves menu changes:
 * 1. Instantly updates in-memory cache and dispatches local event (0ms UI response)
 * 2. Instantly broadcasts to other open browser tabs via BroadcastChannel (0ms cross-tab sync)
 * 3. Persists to localStorage
 * 4. Pushes update to backend server (/api/menu), which broadcasts via SSE to all phones & devices!
 * 5. Pushes update to Cloud Firestore (both menu/main and realtime)
 */
export function saveStoredMenuData(data: MainSection[]) {
  try {
    cachedMenuData = data;
    const jsonString = JSON.stringify(data);

    // 1. Instant local persistence and event notification
    localStorage.setItem(STORAGE_KEY, jsonString);
    notifyLocalUpdate(data);

    // 2. Broadcast immediately to any other open tabs or windows
    if (menuChannel) {
      menuChannel.postMessage({
        type: 'MENU_UPDATED',
        data,
        timestamp: Date.now(),
      });
    }

    // 3. Permanent Cloud Firestore persistence across all devices & regions
    try {
      const now = Date.now();
      lastServerTimestamp = now;
      const menuDocRef = doc(db, 'menu', 'main');
      setDoc(menuDocRef, {
        sections: jsonString,
        lastModified: now,
        updatedBy: 'admin',
      }, { merge: true }).catch((firestoreErr) => {
        handleFirestoreError(firestoreErr, OperationType.WRITE, 'menu/main');
      });
    } catch (err) {
      console.warn('Firestore write init note:', err);
    }

    // 4. Permanent server persistence with security header
    fetch('/api/menu', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-pin': getAdminPin(),
      },
      body: JSON.stringify({ data }),
    })
      .then((res) => {
        if (!res.ok) {
          console.warn('Server save response status:', res.status);
        }
        return res.json();
      })
      .then((resData) => {
        if (resData.lastModified) {
          lastServerTimestamp = Math.max(lastServerTimestamp, resData.lastModified);
        }
      })
      .catch((err) => {
        console.error('Error persisting menu data to server:', err);
      });
  } catch (err) {
    console.error('Error saving menu data:', err);
  }
}

/**
 * Setup Real-time Firebase Cloud Firestore stream
 * Ensures any edit on any phone/device propagates instantly worldwide to all open menus
 */
function setupFirestoreRealtime() {
  if (typeof window === 'undefined') return;

  try {
    const menuDocRef = doc(db, 'menu', 'main');
    onSnapshot(menuDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const docData = snapshot.data();
        let sections: MainSection[] | null = null;
        if (docData) {
          if (Array.isArray(docData.sections)) {
            sections = docData.sections;
          } else if (typeof docData.sections === 'string') {
            try {
              sections = JSON.parse(docData.sections);
            } catch (err) {
              console.warn('Failed to parse docData.sections string:', err);
            }
          }
        }

        if (sections && Array.isArray(sections) && sections.length > 0) {
          const firestoreTimestamp = docData?.lastModified || Date.now();
          if (firestoreTimestamp >= lastServerTimestamp) {
            lastServerTimestamp = firestoreTimestamp;
            cachedMenuData = sections;
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
            } catch {
              // ignore
            }
            notifyLocalUpdate(sections);
          }
        }
      } else {
        // First-time seed into Cloud Firestore so it is stored permanently in the cloud
        const local = localStorage.getItem(STORAGE_KEY);
        let initialData = INITIAL_MENU_DATA;
        if (local) {
          try {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed) && parsed.length > 0) initialData = parsed;
          } catch {
            // ignore
          }
        }
        setDoc(menuDocRef, {
          sections: JSON.stringify(initialData),
          lastModified: Date.now(),
          updatedBy: 'bootstrap',
        }).catch((seedErr) => {
          handleFirestoreError(seedErr, OperationType.WRITE, 'menu/main');
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'menu/main');
    });
  } catch (err) {
    console.warn('Firestore subscription note:', err);
  }
}

/**
 * Listen to incoming BroadcastChannel messages from other tabs
 */
if (menuChannel) {
  menuChannel.onmessage = (event) => {
    if (event.data?.type === 'MENU_UPDATED' && Array.isArray(event.data.data)) {
      const incomingData = event.data.data;
      cachedMenuData = incomingData;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(incomingData));
      notifyLocalUpdate(incomingData);
    }
  };
}

/**
 * Setup Real-time Server-Sent Events (SSE) stream for instant mobile push updates
 */
function setupRealtimeSSE() {
  if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;

  try {
    const sse = new EventSource('/api/menu/events');

    sse.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'menu_updated') {
          if (payload.data && Array.isArray(payload.data) && payload.data.length > 0) {
            lastServerTimestamp = payload.lastModified || Date.now();
            cachedMenuData = payload.data;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload.data));
            notifyLocalUpdate(payload.data);
          } else {
            initiateServerSync();
          }
        }
      } catch {
        // Heartbeat or malformed comment
      }
    };

    sse.onerror = () => {
      // Reconnect handled automatically by browser EventSource
    };
  } catch (err) {
    console.warn('SSE connection note:', err);
  }
}

/**
 * Start listeners and background synchronization on client load
 */
if (typeof window !== 'undefined') {
  // 1. Initialize Real-Time Firebase Cloud Firestore Stream
  setupFirestoreRealtime();

  // 2. Initialize Real-Time SSE Stream
  setupRealtimeSSE();

  // 2. Storage event listener (fires in other tabs when localStorage changes)
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cachedMenuData = parsed;
          notifyLocalUpdate(parsed);
        }
      } catch {
        // ignore
      }
    }
  });

  // 3. Sync immediately when user switches to or returns to the menu tab
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      initiateServerSync();
    }
  });

  // 4. Regular heartbeat polling fallback every 3 seconds
  setInterval(() => {
    initiateServerSync();
  }, 3000);
}
