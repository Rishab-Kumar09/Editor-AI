import { Dispatch } from '@reduxjs/toolkit';
import { setMediaFiles, setTextElements } from '@/app/store/slices/projectSlice';
import { MediaFile, TextElement } from '@/app/types';

interface AIAction {
  type: string;
  params: any;
}

/**
 * Execute AI-generated timeline actions
 */
export async function executeTimelineActions(
  actions: AIAction[],
  dispatch: Dispatch,
  currentMediaFiles: MediaFile[],
  currentTextElements?: TextElement[]
) {
  for (const action of actions) {
    try {
      switch (action.type) {
        case 'add_all_media':
          await handleAddAllMedia(dispatch, currentMediaFiles);
          break;

        case 'clear_timeline':
          await handleClearTimeline(dispatch);
          break;

        case 'add_transition':
          await handleAddTransition(dispatch, currentMediaFiles, action.params);
          break;

        case 'speed_up':
          await handleSpeedChange(dispatch, currentMediaFiles, action.params, 'faster');
          break;

        case 'slow_down':
          await handleSpeedChange(dispatch, currentMediaFiles, action.params, 'slower');
          break;

        case 'add_text':
          await handleAddText(dispatch, currentTextElements || [], action.params);
          break;

        case 'add_multiple_text':
          await handleAddMultipleText(dispatch, currentTextElements || [], action.params);
          break;

        case 'trim_clip':
          await handleTrimClip(dispatch, currentMediaFiles, action.params);
          break;

        case 'add_captions':
          await handleAddCaptions(dispatch, currentMediaFiles, action.params);
          break;

        case 'transcribe_video':
          // Trigger transcription - will be handled in the UI
          console.log('AI triggering transcription:', action.params);
          break;

        case 'search_and_add_images':
          await handleSearchAndAddImages(dispatch, currentMediaFiles, action.params);
          break;

        case 'ask_image_source':
          // User needs to choose: uploaded images or internet search
          // This will be handled in the chat UI
          console.log('AI is asking about image source:', action.params);
          break;

        case 'instruct_manual':
          // Manual instructions - will be shown in chat
          console.log('AI provided manual instructions:', action.params);
          break;

        default:
          console.warn('Unknown action type:', action.type);
      }
    } catch (error) {
      console.error(`Failed to execute action ${action.type}:`, error);
    }
  }
}

/**
 * Add all media files to timeline
 */
async function handleAddAllMedia(dispatch: Dispatch, currentMediaFiles: MediaFile[]) {
  if (currentMediaFiles.length === 0) {
    console.log('No media files to add');
    return;
  }

  let currentPosition = 0;
  const updatedMedia = currentMediaFiles.map((media, index) => {
    const duration = media.endTime - media.startTime;
    const newMedia: MediaFile = {
      ...media,
      positionStart: currentPosition,
      positionEnd: currentPosition + duration,
      includeInMerge: true, // Make sure to include in render
    };
    currentPosition += duration;
    return newMedia;
  });

  console.log('✅ ADD_ALL_MEDIA: Adding', updatedMedia.length, 'files to timeline');
  dispatch(setMediaFiles(updatedMedia));
  console.log('✅ ADD_ALL_MEDIA: Dispatch complete!');
}

/**
 * Clear all clips from timeline
 */
async function handleClearTimeline(dispatch: Dispatch) {
  dispatch(setMediaFiles([]));
}

/**
 * Add transitions between clips
 */
async function handleAddTransition(
  dispatch: Dispatch,
  currentMediaFiles: MediaFile[],
  params: { transitionType?: string }
) {
  // For now, just log - transitions require more complex implementation
  console.log('Add transition:', params);
  // TODO: Implement transition logic
}

/**
 * Change clip speed
 */
async function handleSpeedChange(
  dispatch: Dispatch,
  currentMediaFiles: MediaFile[],
  params: { clipIndex: number; speed: number },
  direction: 'faster' | 'slower'
) {
  const { clipIndex, speed } = params;
  const targetClip = currentMediaFiles[clipIndex];

  if (!targetClip) {
    console.warn('Clip not found at index:', clipIndex);
    return;
  }

  const speedMultiplier = direction === 'faster' ? speed : 1 / speed;
  const originalDuration = targetClip.endTime - targetClip.startTime;
  const newDuration = originalDuration / speedMultiplier;

  // Update the clip with new duration
  const updatedMedia = [...currentMediaFiles];
  updatedMedia[clipIndex] = {
    ...targetClip,
    endTime: targetClip.startTime + newDuration,
    // TODO: Add speed metadata for FFmpeg
  };

  // Adjust positions of subsequent clips
  let currentPosition = updatedMedia[clipIndex].positionEnd;
  for (let i = clipIndex + 1; i < updatedMedia.length; i++) {
    const duration = updatedMedia[i].endTime - updatedMedia[i].startTime;
    updatedMedia[i] = {
      ...updatedMedia[i],
      positionStart: currentPosition,
      positionEnd: currentPosition + duration
    };
    currentPosition += duration;
  }

  dispatch(setMediaFiles(updatedMedia));
}

/**
 * Add text overlay to timeline
 */
async function handleAddText(
  dispatch: Dispatch,
  currentTextElements: TextElement[],
  params: { text: string; start: number; duration: number; style?: any }
) {
  const { text, start, duration, style } = params;

  const newTextElement: TextElement = {
    id: `text-${Date.now()}`,
    text: text,
    positionStart: start,
    positionEnd: start + duration,
    fontSize: style?.fontSize || 48,
    font: style?.font || 'Arial',
    color: style?.color || '#FFFFFF',
    x: style?.x || 50,
    y: style?.y || 50,
  };

  // Add new text element to existing array
  dispatch(setTextElements([...currentTextElements, newTextElement]));
}

/**
 * Add multiple text overlays (e.g., captions) to timeline
 */
async function handleAddMultipleText(
  dispatch: Dispatch,
  currentTextElements: TextElement[],
  params: { textElements: TextElement[] }
) {
  const { textElements } = params;
  console.log(`✨ Adding ${textElements.length} text elements to timeline`);

  // Add all new text elements to existing array
  dispatch(setTextElements([...currentTextElements, ...textElements]));
}

/**
 * Trim clip with advanced options:
 * - newDuration: Trim to specific duration from start
 * - startTrim/endTrim: Trim a specific range (e.g., from 20s to 30s)
 * - restore: Restore original clip length
 */
async function handleTrimClip(
  dispatch: Dispatch,
  currentMediaFiles: MediaFile[],
  params: { 
    clipIndex: number; 
    newDuration?: number;
    startTrim?: number;  // Start time to keep (e.g., 20)
    endTrim?: number;    // End time to keep (e.g., 30)
    restore?: boolean;   // Restore to original length
  }
) {
  const { clipIndex, newDuration, startTrim, endTrim, restore } = params;
  const targetClip = currentMediaFiles[clipIndex];

  if (!targetClip) {
    console.warn('Clip not found at index:', clipIndex);
    return;
  }

  const updatedMedia = [...currentMediaFiles];
  
  // Store original duration if not already stored
  const originalDuration = (targetClip as any).originalDuration || (targetClip.endTime - targetClip.startTime);
  
  let newStartTime = targetClip.startTime;
  let newEndTime = targetClip.endTime;

  if (restore) {
    // RESTORE: Reset to original duration
    newStartTime = targetClip.startTime;
    newEndTime = targetClip.startTime + originalDuration;
    console.log(`🔄 Restoring clip ${clipIndex} to original duration: ${originalDuration}s`);
  } else if (startTrim !== undefined && endTrim !== undefined) {
    // RANGE TRIM: Keep only the range from startTrim to endTrim
    newStartTime = targetClip.startTime + startTrim;
    newEndTime = targetClip.startTime + endTrim;
    console.log(`✂️ Trimming clip ${clipIndex} from ${startTrim}s to ${endTrim}s (keeping ${endTrim - startTrim}s)`);
  } else if (startTrim !== undefined) {
    // TRIM FROM START: Remove first X seconds
    newStartTime = targetClip.startTime + startTrim;
    newEndTime = targetClip.endTime;
    console.log(`✂️ Removing first ${startTrim}s from clip ${clipIndex}`);
  } else if (endTrim !== undefined) {
    // TRIM TO END: Keep only first X seconds
    newStartTime = targetClip.startTime;
    newEndTime = targetClip.startTime + endTrim;
    console.log(`✂️ Keeping first ${endTrim}s of clip ${clipIndex}`);
  } else if (newDuration !== undefined) {
    // DURATION TRIM: Trim to specific duration
    newStartTime = targetClip.startTime;
    newEndTime = targetClip.startTime + newDuration;
    console.log(`✂️ Trimming clip ${clipIndex} to ${newDuration}s`);
  }

  const finalDuration = newEndTime - newStartTime;

  updatedMedia[clipIndex] = {
    ...targetClip,
    startTime: newStartTime,
    endTime: newEndTime,
    positionEnd: targetClip.positionStart + finalDuration,
    originalDuration: originalDuration, // Preserve original duration
  } as any;

  // Adjust positions of subsequent clips
  let currentPosition = updatedMedia[clipIndex].positionEnd;
  for (let i = clipIndex + 1; i < updatedMedia.length; i++) {
    const duration = updatedMedia[i].endTime - updatedMedia[i].startTime;
    updatedMedia[i] = {
      ...updatedMedia[i],
      positionStart: currentPosition,
      positionEnd: currentPosition + duration,
    };
    currentPosition += duration;
  }

  dispatch(setMediaFiles(updatedMedia));
}

/**
 * Add auto-generated captions
 */
async function handleAddCaptions(
  dispatch: Dispatch,
  currentMediaFiles: MediaFile[],
  params: { clipIndex: number; styleId?: string }
) {
  console.log('Adding captions to clip:', params);
  // This will trigger the transcription + caption workflow in the UI
  // The actual implementation will be in the AIChatPanel component
}

/**
 * Search for images online and add to timeline
 */
async function handleSearchAndAddImages(
  dispatch: Dispatch,
  currentMediaFiles: MediaFile[],
  params: { query: string; count?: number; positions?: number[] }
) {
  const { query, count = 5, positions } = params;
  
  console.log(`🔍 Searching for ${count} images: "${query}"`);

  try {
    // Call image search API
    const response = await fetch('/api/ai/images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, count }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.needsSetup) {
        console.error('❌ Image search requires API keys! Please add them in Settings.');
        console.error('   Go to Settings → Image Search APIs');
        console.error('   Add at least Pexels API key (FREE at https://www.pexels.com/api/)');
      }
      throw new Error(errorData.error || 'Image search failed');
    }

    const data = await response.json();
    const images = data.images;

    if (!images || images.length === 0) {
      console.warn('No images found');
      return;
    }

    console.log(`✅ Found ${images.length} images, downloading...`);

    // Download each image and add to project
    const newMediaFiles: MediaFile[] = [];
    let currentPosition = currentMediaFiles.length > 0 
      ? Math.max(...currentMediaFiles.map(m => m.positionEnd)) 
      : 0;

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      try {
        // Download image as blob
        const imageResponse = await fetch(image.url);
        const blob = await imageResponse.blob();
        const file = new File([blob], `${query}-${i + 1}.jpg`, { type: 'image/jpeg' });

        // Save to IndexedDB
        const { storeFile } = await import('@/app/store');
        const fileId = `image-${Date.now()}-${i}`;
        await storeFile(file, fileId);

        // Create media file entry
        const imageDuration = 3; // Default 3 seconds per image
        const position = positions && positions[i] !== undefined ? positions[i] : currentPosition;

        const mediaFile: MediaFile = {
          id: `media-${Date.now()}-${i}`,
          fileName: file.name,
          fileId: fileId,
          type: 'image',
          startTime: 0,
          endTime: imageDuration,
          positionStart: position,
          positionEnd: position + imageDuration,
          includeInMerge: true,
          playbackSpeed: 1,
          volume: 1,
          zIndex: 0,
        };

        newMediaFiles.push(mediaFile);
        currentPosition = position + imageDuration;

        console.log(`📥 Downloaded: ${image.alt} (${image.source})`);
      } catch (error) {
        console.error(`Failed to download image ${i + 1}:`, error);
      }
    }

    // Add all new images to timeline
    if (newMediaFiles.length > 0) {
      const updatedMedia = [...currentMediaFiles, ...newMediaFiles];
      dispatch(setMediaFiles(updatedMedia));
      console.log(`✨ Added ${newMediaFiles.length} images to timeline!`);
    }
  } catch (error) {
    console.error('Image search error:', error);
  }
}

