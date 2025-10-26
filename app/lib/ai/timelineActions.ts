import { Dispatch } from '@reduxjs/toolkit';
import { setMediaFiles } from '@/app/store/slices/projectSlice';
import { MediaFile } from '@/app/types';

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
  currentMediaFiles: MediaFile[]
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
          // TODO: Implement text addition
          console.log('Add text action:', action.params);
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
    const newMedia = {
      ...media,
      positionStart: currentPosition,
      positionEnd: currentPosition + duration,
      trackId: media.type === 'audio' ? 1 : 0 // Audio track 1, Video track 0
    };
    currentPosition += duration;
    return newMedia;
  });

  dispatch(setMediaFiles(updatedMedia));
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

