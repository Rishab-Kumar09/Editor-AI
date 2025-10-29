/**
 * Apply Editing Style - Takes a style profile and applies it to the current project
 */

import { Dispatch } from '@reduxjs/toolkit';
import { EditingStyle } from './styleTypes';
import { setTextElements } from '@/app/store/slices/projectSlice';
import { TextElement, MediaFile } from '@/app/types';

export interface ApplyStyleParams {
  style: EditingStyle;
  mediaFiles: MediaFile[];
  currentTextElements: TextElement[];
  videoDuration: number;
}

/**
 * Apply a saved editing style to the current project
 */
export async function applyEditingStyle(
  params: ApplyStyleParams,
  dispatch: Dispatch
): Promise<{
  message: string;
  actions: Array<{ type: string; params: any }>;
}> {
  const { style, mediaFiles, currentTextElements, videoDuration } = params;
  
  console.log(`🎨 Applying "${style.name}" style...`);
  
  const actions: Array<{ type: string; params: any }> = [];

  // 1. Apply Caption Style (if captions enabled in style)
  if (style.captions.enabled && currentTextElements.length > 0) {
    const getYPosition = (pos: string) => {
      if (pos === 'top') return 10;
      if (pos === 'bottom') return 1000;
      return 540; // center
    };

    actions.push({
      type: 'adjust_all_captions',
      params: {
        fontSize: style.captions.fontSize,
        y: getYPosition(style.captions.position),
        color: style.captions.color,
        backgroundColor: style.captions.backgroundColor || undefined,
      },
    });
  }

  // 2. TODO: Apply Pacing (auto-cut based on style.pacing)
  // This would require more complex timeline manipulation
  
  // 3. TODO: Apply Visual Style (zoom, transitions)
  // This would require adding zoom/pan effects
  
  // 4. TODO: Apply Audio Style (music, SFX)
  // This would require audio library integration

  const styleDescription = `
**${style.name} Style Applied!**

✂️ **Pacing:** ${style.pacing.cutsPerMinute.toFixed(1)} cuts/min (${style.pacing.fastPacedPercentage}% fast-paced)
📝 **Captions:** ${style.captions.enabled ? `${style.captions.fontSize}px ${style.captions.position}` : 'Disabled'}
🎨 **Visual:** ${style.visual.colorGrading}, ${style.visual.zoomFrequency} zooms/min
🎵 **Audio:** ${style.audio.musicPresent ? 'Music enabled' : 'No music'}, ${style.audio.soundEffectsFrequency} SFX/min

*Note: Full pacing and visual effects coming soon!*
  `.trim();

  return {
    message: styleDescription,
    actions,
  };
}

/**
 * Get a summary of a style for AI to understand
 */
export function getStyleSummary(style: EditingStyle): string {
  return `Style: ${style.name}
- Pacing: ${style.pacing.cutsPerMinute} cuts/min, avg shot ${style.pacing.averageShotDuration}s
- Captions: ${style.captions.fontSize}px at ${style.captions.position}, ${style.captions.color}
- Visual: ${style.visual.colorGrading}, ${style.visual.transitionStyle} transitions
- Fast-paced: ${style.pacing.fastPacedPercentage > 50 ? 'Yes' : 'No'}`;
}

