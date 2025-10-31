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

        case 'adjust_all_captions':
          await handleAdjustAllCaptions(dispatch, currentTextElements || [], action.params);
          break;

        case 'remove_all_captions':
          await handleRemoveAllCaptions(dispatch);
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

        case 'apply_editing_style':
          console.log('⚠️ Edit style feature coming soon!');
          break;

        case 'list_available_styles':
          console.log('⚠️ Style list feature coming soon!');
          break;

        case 'remove_images':
          await handleRemoveImages(dispatch, currentMediaFiles, action.params);
          break;

        case 'adjust_all_images':
          await handleAdjustAllImages(dispatch, currentMediaFiles, action.params);
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
  params: { 
    query: string; 
    count?: number; 
    positions?: number[];
    keywords?: Array<{ keyword: string; timestamp: number }>; // For synced placement with transcript
  }
) {
  const { query, count = 5, positions, keywords } = params;
  
  console.log(`🔍 Searching for ${count} images: "${query}"${keywords ? ' (⏱️ synced with transcript)' : ''}`);

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
    
    // Calculate video duration to place images within video timeframe
    const videoDuration = currentMediaFiles.length > 0 
      ? Math.max(...currentMediaFiles.filter(m => m.type === 'video').map(m => m.positionEnd))
      : 30; // Default to 30 seconds if no video
    
    // Distribute images evenly throughout the video
    const imageDuration = 3; // Default 3 seconds per image
    const spacing = Math.max(imageDuration, videoDuration / images.length);

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

        // Create blob URL for immediate display (critical for video player!)
        const blobUrl = URL.createObjectURL(blob);

        // Calculate position: use keyword timestamp if available, otherwise distribute evenly
        const position = keywords && keywords[i] 
          ? keywords[i].timestamp // Use exact timestamp from transcript
          : positions && positions[i] !== undefined 
            ? positions[i] 
            : Math.min(i * spacing, videoDuration - imageDuration);
        
        const imageKeyword = keywords && keywords[i] ? keywords[i].keyword : query;

        // Position images in a grid pattern (2 columns)
        const imageWidth = 600; // Reasonable size for overlay
        const imageHeight = 400;
        const padding = 50;
        
        // Calculate grid position (2 columns, multiple rows)
        const col = i % 2; // 0 or 1 (left or right column)
        const row = Math.floor(i / 2); // Which row
        
        const xPos = col === 0 
          ? padding // Left side
          : 1920 - imageWidth - padding; // Right side
        
        const yPos = padding + (row * (imageHeight + padding)); // Stack vertically with spacing
        
        // Ensure image stays within canvas bounds
        const finalY = Math.min(yPos, 1080 - imageHeight - padding);

        const mediaFile: MediaFile = {
          id: `media-${Date.now()}-${i}`,
          fileName: file.name,
          fileId: fileId,
          type: 'image',
          src: blobUrl, // CRITICAL: Add src so video player can display it!
          startTime: 0,
          endTime: imageDuration,
          positionStart: Math.max(0, position), // Ensure not negative
          positionEnd: Math.max(0, position) + imageDuration,
          includeInMerge: true,
          playbackSpeed: 1,
          volume: 1,
          zIndex: 10 + i, // Higher zIndex so images appear on top of video
          // Position in grid layout
          x: xPos,
          y: finalY,  
          width: imageWidth,
          height: imageHeight,
          opacity: 100, // Fully visible
        };

        newMediaFiles.push(mediaFile);

        console.log(`📥 Downloaded: ${image.alt} at ${Math.max(0, position).toFixed(1)}s${imageKeyword !== query ? ` [keyword: "${imageKeyword}"]` : ''} (${image.source})`);
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

/**
 * Adjust all caption properties at once
 * Params: {fontSize?, y?, color?, backgroundColor?}
 */
async function handleAdjustAllCaptions(
  dispatch: Dispatch,
  currentTextElements: TextElement[],
  params: {
    fontSize?: number;
    y?: number;
    color?: string;
    backgroundColor?: string;
  }
) {
  const { fontSize, y, color, backgroundColor } = params;
  
  console.log(`🎨 Adjusting all ${currentTextElements.length} captions:`, params);

  // Update all text elements with new properties
  const updatedTextElements = currentTextElements.map((text) => ({
    ...text,
    ...(fontSize !== undefined && { fontSize }),
    ...(y !== undefined && { y }),
    ...(color !== undefined && { color }),
    ...(backgroundColor !== undefined && { backgroundColor }),
  }));

  dispatch(setTextElements(updatedTextElements));
  console.log(`✅ Updated all captions!`);
}

/**
 * Remove all captions/subtitles from timeline
 */
async function handleRemoveAllCaptions(dispatch: Dispatch) {
  console.log('🗑️ Removing all captions/subtitles from timeline');
  dispatch(setTextElements([]));
  console.log('✅ All captions removed!');
}

/**
 * Remove images from timeline
 * Params: {all?: boolean, index?: number}
 */
async function handleRemoveImages(
  dispatch: Dispatch,
  currentMediaFiles: MediaFile[],
  params: { all?: boolean; index?: number }
) {
  const { all, index } = params;

  if (all) {
    // Remove ALL images
    console.log('🗑️ Removing all images from timeline');
    // CRITICAL: Filter out undefined/null entries AND non-image files
    const updatedMedia = currentMediaFiles.filter(file => 
      file != null && typeof file === 'object' && 'type' in file && file.type !== 'image'
    );
    dispatch(setMediaFiles(updatedMedia));
    console.log(`✅ Removed all images! (${currentMediaFiles.length - updatedMedia.length} images removed)`);
  } else if (index !== undefined) {
    // Remove specific image by index
    console.log(`🗑️ Removing image at index ${index}`);
    // CRITICAL: Filter out undefined/null entries first
    const images = currentMediaFiles.filter(file => 
      file != null && typeof file === 'object' && 'type' in file && file.type === 'image'
    );
    
    if (index >= 0 && index < images.length) {
      const imageToRemove = images[index];
      const updatedMedia = currentMediaFiles.filter(file => 
        file != null && typeof file === 'object' && 'id' in file && file.id !== imageToRemove.id
      );
      dispatch(setMediaFiles(updatedMedia));
      console.log(`✅ Removed image: ${imageToRemove.fileName}`);
    } else {
      console.error(`❌ Invalid image index: ${index} (total images: ${images.length})`);
    }
  } else {
    console.warn('⚠️ No removal parameters specified (all or index)');
  }
}

/**
 * Adjust all image properties at once
 * Params: {x?, y?, width?, height?, opacity?}
 */
async function handleAdjustAllImages(
  dispatch: Dispatch,
  currentMediaFiles: MediaFile[],
  params: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    opacity?: number;
  }
) {
  const { x, y, width, height, opacity } = params;
  
  console.log(`🖼️ Adjusting all images:`, params);

  // Find all image files - with safety check for undefined entries
  const images = currentMediaFiles.filter(file => 
    file != null && typeof file === 'object' && 'type' in file && file.type === 'image'
  );
  
  if (images.length === 0) {
    console.warn('⚠️ No images found on timeline');
    return;
  }

  // Update all images with new properties - filter out any undefined entries
  const updatedMediaFiles = currentMediaFiles
    .filter(file => file != null && typeof file === 'object' && 'type' in file)
    .map((file) => {
      if (file.type === 'image') {
        return {
          ...file,
          ...(x !== undefined && { x }),
          ...(y !== undefined && { y }),
          ...(width !== undefined && { width }),
          ...(height !== undefined && { height }),
          ...(opacity !== undefined && { opacity }),
        };
      }
      return file;
    });

  dispatch(setMediaFiles(updatedMediaFiles));
  console.log(`✅ Updated ${images.length} images!`);
}

// Editing style features temporarily disabled to fix build issues
// Will be re-enabled once proper server-side architecture is implemented

