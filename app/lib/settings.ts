// app/lib/settings.ts
// Settings storage - uses electron-store in production, memory in build

interface AppSettings {
  apiKey: string;
  pexelsApiKey: string;
  unsplashApiKey: string;
  pixabayApiKey: string;
}

// In-memory fallback for SSR/build
const memoryStore: AppSettings = {
  apiKey: '',
  pexelsApiKey: '',
  unsplashApiKey: '',
  pixabayApiKey: '',
};

// Lazy load electron-store only when running in Electron
let store: any = null;

function getStore() {
  if (typeof window === 'undefined') {
    // Server-side rendering or build time - use memory
    return null;
  }
  
  if (!store) {
    try {
      // Only import electron-store when actually in Electron
      const Store = require('electron-store');
      store = new Store({
        name: 'editor-ai-settings',
        defaults: {
          apiKey: '',
          pexelsApiKey: '',
          unsplashApiKey: '',
          pixabayApiKey: '',
        },
      });
    } catch (error) {
      // Not in Electron, use memory store
      console.log('Using memory store (not in Electron)');
      return null;
    }
  }
  
  return store;
}

export const appSettings = {
  get apiKey(): string {
    const s = getStore();
    return s ? s.get('apiKey') : memoryStore.apiKey;
  },
  set apiKey(key: string) {
    const s = getStore();
    if (s) {
      s.set('apiKey', key);
    } else {
      memoryStore.apiKey = key;
    }
  },
  get pexelsApiKey(): string {
    const s = getStore();
    return s ? s.get('pexelsApiKey') : memoryStore.pexelsApiKey;
  },
  set pexelsApiKey(key: string) {
    const s = getStore();
    if (s) {
      s.set('pexelsApiKey', key);
    } else {
      memoryStore.pexelsApiKey = key;
    }
  },
  get unsplashApiKey(): string {
    const s = getStore();
    return s ? s.get('unsplashApiKey') : memoryStore.unsplashApiKey;
  },
  set unsplashApiKey(key: string) {
    const s = getStore();
    if (s) {
      s.set('unsplashApiKey', key);
    } else {
      memoryStore.unsplashApiKey = key;
    }
  },
  get pixabayApiKey(): string {
    const s = getStore();
    return s ? s.get('pixabayApiKey') : memoryStore.pixabayApiKey;
  },
  set pixabayApiKey(key: string) {
    const s = getStore();
    if (s) {
      s.set('pixabayApiKey', key);
    } else {
      memoryStore.pixabayApiKey = key;
    }
  },
};
