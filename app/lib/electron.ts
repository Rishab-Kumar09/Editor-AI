/**
 * Electron IPC utility
 * Replaces fetch calls with Electron IPC for static desktop app
 */

// Type definitions for window.electron
declare global {
  interface Window {
    electron?: {
      isElectron: boolean;
      settings: {
        get: () => Promise<any>;
        save: (settings: any) => Promise<any>;
      };
      ai: {
        chat: (data: any) => Promise<any>;
        transcribe: (data: any) => Promise<any>;
        captions: (data: any) => Promise<any>;
        searchImages: (data: any) => Promise<any>;
      };
    };
  }
}

/**
 * Check if running in Electron
 */
export function isElectron(): boolean {
  return typeof window !== 'undefined' && window.electron?.isElectron === true;
}

/**
 * Settings API
 */
export const settingsApi = {
  async get() {
    if (isElectron()) {
      return window.electron!.settings.get();
    }
    // Fallback for dev/browser
    const response = await fetch('/api/settings');
    return response.json();
  },

  async save(settings: any) {
    if (isElectron()) {
      return window.electron!.settings.save(settings);
    }
    // Fallback for dev/browser
    const response = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return response.json();
  },
};

/**
 * AI API
 */
export const aiApi = {
  async chat(messages: any[], currentMediaFiles?: any[], currentTextElements?: any[]) {
    const data = { messages, currentMediaFiles, currentTextElements };
    
    if (isElectron()) {
      return window.electron!.ai.chat(data);
    }
    // Fallback for dev/browser
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async transcribe(audioBlob: Blob) {
    const data = { audioBlob };
    
    if (isElectron()) {
      return window.electron!.ai.transcribe(data);
    }
    // Fallback for dev/browser
    const formData = new FormData();
    formData.append('audio', audioBlob);
    const response = await fetch('/api/ai/transcribe', {
      method: 'POST',
      body: formData,
    });
    return response.json();
  },

  async generateCaptions(data: any) {
    if (isElectron()) {
      return window.electron!.ai.captions(data);
    }
    // Fallback for dev/browser
    const response = await fetch('/api/ai/captions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async searchImages(query: string, count: number = 5) {
    const data = { query, count };
    
    if (isElectron()) {
      return window.electron!.ai.searchImages(data);
    }
    // Fallback for dev/browser
    const response = await fetch('/api/ai/images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

