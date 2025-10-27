const { ipcMain } = require('electron');
const Store = require('electron-store');
const OpenAI = require('openai');

// Initialize electron-store for settings
const store = new Store({
  name: 'editor-ai-settings',
  defaults: {
    apiKey: '',
    pexelsApiKey: '',
    unsplashApiKey: '',
    pixabayApiKey: '',
  },
});

// Helper to mask API keys
function maskApiKey(key) {
  if (!key || key.length < 8) return '';
  return `${key.slice(0, 3)}...${key.slice(-4)}`;
}

/**
 * Initialize all IPC handlers
 */
function initializeIpcHandlers() {
  console.log('📡 Initializing IPC handlers...');

  // ========================================
  // SETTINGS HANDLERS
  // ========================================
  
  ipcMain.handle('settings:get', async () => {
    try {
      return {
        apiKey: maskApiKey(store.get('apiKey')),
        pexelsApiKey: maskApiKey(store.get('pexelsApiKey')),
        unsplashApiKey: maskApiKey(store.get('unsplashApiKey')),
        pixabayApiKey: maskApiKey(store.get('pixabayApiKey')),
      };
    } catch (error) {
      console.error('Failed to get settings:', error);
      throw error;
    }
  });

  ipcMain.handle('settings:save', async (event, settings) => {
    try {
      const { apiKey, pexelsApiKey, unsplashApiKey, pixabayApiKey } = settings;

      // Only save if not masked
      if (apiKey !== undefined && !apiKey.startsWith('•') && !apiKey.includes('...')) {
        if (apiKey === '' || apiKey.startsWith('sk-')) {
          store.set('apiKey', apiKey);
        } else {
          throw new Error('Invalid OpenAI API key format');
        }
      }

      if (pexelsApiKey !== undefined && !pexelsApiKey.startsWith('•') && !pexelsApiKey.includes('...')) {
        store.set('pexelsApiKey', pexelsApiKey);
      }

      if (unsplashApiKey !== undefined && !unsplashApiKey.startsWith('•') && !unsplashApiKey.includes('...')) {
        store.set('unsplashApiKey', unsplashApiKey);
      }

      if (pixabayApiKey !== undefined && !pixabayApiKey.startsWith('•') && !pixabayApiKey.includes('...')) {
        store.set('pixabayApiKey', pixabayApiKey);
      }

      return { success: true, message: 'Settings saved successfully' };
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  });

  // ========================================
  // AI CHAT HANDLER
  // ========================================
  
  ipcMain.handle('ai:chat', async (event, data) => {
    try {
      const { messages } = data;
      const apiKey = store.get('apiKey');

      if (!apiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const openai = new OpenAI({ apiKey });

      // System prompt (same as before)
      const SYSTEM_PROMPT = `You are an AI video editing assistant for Editor AI. You help users edit their videos using natural language commands.

⚠️ CRITICAL RULE: YOU MUST ALWAYS RETURN ACTIONS! NEVER JUST TALK!

CORE PRINCIPLE: NEVER SAY "I CAN'T" - ALWAYS ACTUALLY DO THE WORK!

Your job is to:
1. Understand what the user wants to do with their video
2. Respond in a friendly, helpful way
3. **ALWAYS OUTPUT JSON ACTIONS** - These execute IMMEDIATELY on the timeline
4. Actually perform video editing operations, DON'T JUST TALK ABOUT THEM

🚨 MANDATORY: Every response MUST include an "actions" array, even if empty []

AVAILABLE ACTIONS:
- add_all_media: Add all media from library to timeline
- add_media: Add specific media file (params: {index})
- clear_timeline: Remove all clips from timeline
- add_transition: Add transition between clips (params: {clipIndex, type})
- speed_up: Speed up a clip (params: {clipIndex, speed})
- slow_down: Slow down a clip (params: {clipIndex, speed})
- add_text: Add text overlay (params: {text, start, duration, style})
- trim_clip: ADVANCED TRIMMING with multiple modes:
    * Trim to duration: {clipIndex, newDuration}
    * Trim range: {clipIndex, startTrim, endTrim} - Keep only from startTrim to endTrim seconds
    * Remove start: {clipIndex, startTrim} - Remove first X seconds
    * Keep only: {clipIndex, endTrim} - Keep only first X seconds
    * Restore: {clipIndex, restore: true} - Undo trim, restore original length
- add_captions: Auto-generate captions with Whisper (params: {clipIndex, styleId})
- transcribe_video: Transcribe video audio with timestamps (params: {clipIndex})
- search_and_add_images: 🆕 Search and download images from internet! (params: {query, count, positions?})
- ask_image_source: Ask if user wants images from uploaded files or internet (params: {context})
- instruct_manual: Give manual instructions ONLY for features not yet implemented (params: {feature, steps})

RESPONSE FORMAT:
Always respond with:
{
  "message": "Your friendly response to the user",
  "actions": [
    { "type": "action_type", "params": {...} }
  ],
  "needsUserChoice": false
}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        response_format: { type: 'json_object' },
      });

      const responseContent = completion.choices[0].message.content;
      if (!responseContent) {
        throw new Error('No content in AI response');
      }

      return JSON.parse(responseContent);
    } catch (error) {
      console.error('AI chat error:', error);
      throw error;
    }
  });

  // ========================================
  // AI TRANSCRIBE HANDLER
  // ========================================
  
  ipcMain.handle('ai:transcribe', async (event, data) => {
    try {
      const { audioBlob } = data;
      const apiKey = store.get('apiKey');

      if (!apiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const openai = new OpenAI({ apiKey });

      // Convert blob to file
      const audioFile = new File([audioBlob], 'audio.mp3', { type: 'audio/mp3' });

      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        response_format: 'verbose_json',
        timestamp_granularities: ['segment'],
      });

      return transcription;
    } catch (error) {
      console.error('Transcription error:', error);
      throw error;
    }
  });

  // ========================================
  // AI CAPTIONS HANDLER
  // ========================================
  
  ipcMain.handle('ai:captions', async (event, data) => {
    try {
      // Captions are generated client-side after transcription
      // This handler is a placeholder for future server-side caption generation
      return { success: true };
    } catch (error) {
      console.error('Captions error:', error);
      throw error;
    }
  });

  // ========================================
  // AI IMAGE SEARCH HANDLER
  // ========================================
  
  ipcMain.handle('ai:searchImages', async (event, data) => {
    try {
      const { query, count = 5 } = data;

      // Get API keys
      const pexelsKey = store.get('pexelsApiKey');
      const unsplashKey = store.get('unsplashApiKey');
      const pixabayKey = store.get('pixabayApiKey');

      // Require at least one API key
      if (!pexelsKey && !unsplashKey && !pixabayKey) {
        throw new Error('No image search API keys configured. Please add at least one API key in Settings.');
      }

      const images = [];

      // Try Pexels first
      if (pexelsKey) {
        try {
          const fetch = require('node-fetch');
          const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}`, {
            headers: { 'Authorization': pexelsKey },
          });
          const data = await response.json();
          
          if (data.photos) {
            images.push(...data.photos.map(photo => ({
              id: String(photo.id),
              url: photo.src.large,
              thumbnail: photo.src.medium,
              source: 'pexels',
              photographer: photo.photographer,
              alt: photo.alt || query,
            })));
          }
        } catch (error) {
          console.error('Pexels search failed:', error);
        }
      }

      // Try Unsplash if needed
      if (unsplashKey && images.length < count) {
        try {
          const fetch = require('node-fetch');
          const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count - images.length}`, {
            headers: { 'Authorization': `Client-ID ${unsplashKey}` },
          });
          const data = await response.json();
          
          if (data.results) {
            images.push(...data.results.map(photo => ({
              id: photo.id,
              url: photo.urls.regular,
              thumbnail: photo.urls.small,
              source: 'unsplash',
              photographer: photo.user.name,
              alt: photo.alt_description || query,
            })));
          }
        } catch (error) {
          console.error('Unsplash search failed:', error);
        }
      }

      // Try Pixabay if needed
      if (pixabayKey && images.length < count) {
        try {
          const fetch = require('node-fetch');
          const response = await fetch(`https://pixabay.com/api/?key=${pixabayKey}&q=${encodeURIComponent(query)}&per_page=${count - images.length}&image_type=photo`);
          const data = await response.json();
          
          if (data.hits) {
            images.push(...data.hits.map(photo => ({
              id: String(photo.id),
              url: photo.largeImageURL,
              thumbnail: photo.webformatURL,
              source: 'pixabay',
              photographer: photo.user,
              alt: photo.tags || query,
            })));
          }
        } catch (error) {
          console.error('Pixabay search failed:', error);
        }
      }

      return { images: images.slice(0, count) };
    } catch (error) {
      console.error('Image search error:', error);
      throw error;
    }
  });

  console.log('✅ IPC handlers initialized!');
}

module.exports = { initializeIpcHandlers };

