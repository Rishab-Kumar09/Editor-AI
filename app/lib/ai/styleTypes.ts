/**
 * Type definitions for editing style profiles
 * Separated from styleAnalyzer.ts to avoid bundling Node.js modules
 */

export interface EditingStyle {
  id: string;
  name: string;
  createdAt: string;
  source: {
    type: 'youtube' | 'local';
    url?: string;
    filename?: string;
  };
  pacing: {
    averageShotDuration: number; // seconds
    cutsPerMinute: number;
    fastPacedPercentage: number; // % of video with <1s shots
  };
  captions: {
    enabled: boolean;
    fontSize: number;
    position: 'top' | 'center' | 'bottom';
    color: string;
    backgroundColor?: string;
    fontFamily: string;
    animation?: 'none' | 'fade' | 'slide' | 'bounce' | 'word-pop';
    textTransform?: 'uppercase' | 'lowercase' | 'none';
    strokeColor?: string;
    strokeWidth?: number;
  };
  visual: {
    colorGrading?: 'vibrant' | 'desaturated' | 'warm' | 'cool' | 'none' | 'natural';
    zoomFrequency: number; // zooms per minute
    transitionStyle: 'cut' | 'fade' | 'wipe' | 'zoom';
    overlayUsage: number; // percentage of video with overlays
  };
  audio: {
    musicPresent: boolean;
    soundEffectsFrequency: number; // SFX per minute
    voiceoverStyle?: 'energetic' | 'calm' | 'professional';
  };
}

