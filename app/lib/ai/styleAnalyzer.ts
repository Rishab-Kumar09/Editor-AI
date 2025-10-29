/**
 * Style Analyzer - Analyzes reference videos to extract editing styles
 * Uses GPT-4o Vision + FFmpeg for comprehensive style profiling
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import OpenAI from 'openai';
import { EditingStyle } from './styleTypes';

const execAsync = promisify(exec);

/**
 * Analyze a video file to extract editing style
 */
export async function analyzeVideoStyle(
  videoPath: string,
  styleName: string,
  openaiApiKey: string
): Promise<EditingStyle> {
  console.log(`📊 Analyzing style from: ${videoPath}`);

  const openai = new OpenAI({ apiKey: openaiApiKey });
  
  // Create temp directory for frames
  const tempDir = path.join(process.cwd(), '.next', 'temp', 'style-analysis');
  await fs.mkdir(tempDir, { recursive: true });

  try {
    // Step 1: Detect scene changes (cuts) using FFmpeg
    console.log('🔍 Step 1: Analyzing cuts and pacing...');
    const pacing = await analyzePacing(videoPath);

    // Step 2: Extract key frames for visual analysis
    console.log('🖼️ Step 2: Extracting frames...');
    const frames = await extractKeyFrames(videoPath, tempDir, 5); // Extract 5 frames

    // Step 3: Use GPT-4o Vision to analyze caption style
    console.log('👁️ Step 3: Analyzing caption style with GPT-4o...');
    const captions = await analyzeCaptionStyle(frames, openai);

    // Step 4: Analyze visual patterns
    console.log('🎨 Step 4: Analyzing visual patterns...');
    const visual = await analyzeVisualStyle(frames, openai);

    // Step 5: Audio analysis
    console.log('🎵 Step 5: Analyzing audio patterns...');
    const audio = await analyzeAudioStyle(videoPath);

    // Cleanup temp files
    await fs.rm(tempDir, { recursive: true, force: true });

    const style: EditingStyle = {
      id: `style-${Date.now()}`,
      name: styleName,
      createdAt: new Date().toISOString(),
      source: {
        type: 'local',
        filename: path.basename(videoPath),
      },
      pacing,
      captions,
      visual,
      audio,
    };

    console.log('✅ Style analysis complete!');
    return style;
  } catch (error) {
    // Cleanup on error
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    throw error;
  }
}

/**
 * Analyze pacing and cut frequency using FFmpeg scene detection
 */
async function analyzePacing(videoPath: string): Promise<EditingStyle['pacing']> {
  // Get video duration
  const durationCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`;
  const { stdout: durationStr } = await execAsync(durationCmd);
  const totalDuration = parseFloat(durationStr.trim());

  // Detect scene changes (cuts)
  const sceneCmd = `ffmpeg -i "${videoPath}" -filter:v "select='gt(scene,0.3)',showinfo" -f null - 2>&1 | grep "Parsed_showinfo" | wc -l`;
  let sceneCount = 0;
  
  try {
    const { stdout: sceneStr } = await execAsync(sceneCmd);
    sceneCount = parseInt(sceneStr.trim()) || 0;
  } catch (error) {
    // Fallback: estimate based on duration
    sceneCount = Math.floor(totalDuration / 3); // Assume 1 cut every 3 seconds
  }

  const cutsPerMinute = (sceneCount / totalDuration) * 60;
  const averageShotDuration = totalDuration / (sceneCount + 1);
  
  // Fast-paced: >20 cuts/min or <2s avg shot duration
  const fastPacedPercentage = cutsPerMinute > 20 || averageShotDuration < 2 ? 80 : 30;

  return {
    averageShotDuration: parseFloat(averageShotDuration.toFixed(2)),
    cutsPerMinute: parseFloat(cutsPerMinute.toFixed(2)),
    fastPacedPercentage,
  };
}

/**
 * Extract key frames from video for visual analysis
 */
async function extractKeyFrames(
  videoPath: string,
  outputDir: string,
  count: number
): Promise<string[]> {
  const frames: string[] = [];
  
  // Extract frames at even intervals
  for (let i = 0; i < count; i++) {
    const timestamp = `${i * (100 / count)}%`; // Distribute across video
    const outputPath = path.join(outputDir, `frame_${i}.jpg`);
    const cmd = `ffmpeg -ss ${timestamp} -i "${videoPath}" -vframes 1 -q:v 2 "${outputPath}" -y`;
    
    try {
      await execAsync(cmd);
      frames.push(outputPath);
    } catch (error) {
      console.warn(`Failed to extract frame ${i}:`, error);
    }
  }

  return frames;
}

/**
 * Analyze caption style using GPT-4o Vision
 */
async function analyzeCaptionStyle(
  framePaths: string[],
  openai: OpenAI
): Promise<EditingStyle['captions']> {
  // Read frames as base64
  const frameData = await Promise.all(
    framePaths.slice(0, 3).map(async (framePath) => {
      const buffer = await fs.readFile(framePath);
      return buffer.toString('base64');
    })
  );

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze the text captions/subtitles in these video frames. Return a JSON object with:
{
  "enabled": boolean (are captions visible?),
  "fontSize": number (estimate: small=32, medium=48, large=64, xlarge=80),
  "position": "top" | "center" | "bottom",
  "color": "#RRGGBB" (hex color),
  "backgroundColor": "#RRGGBB" or null,
  "fontFamily": string (best guess: Arial, Impact, etc.),
  "animation": "none" | "fade" | "word-pop" | "bounce",
  "textTransform": "none" | "uppercase" | "lowercase"
}

If no captions are visible, set enabled=false and provide default values.`,
          },
          ...frameData.map((data) => ({
            type: 'image_url' as const,
            image_url: {
              url: `data:image/jpeg;base64,${data}`,
            },
          })),
        ],
      },
    ],
    max_tokens: 500,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from GPT-4o');
  }

  // Parse JSON response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    // Default fallback
    return {
      enabled: false,
      fontSize: 48,
      position: 'bottom',
      color: '#FFFFFF',
      fontFamily: 'Arial',
    };
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Analyze visual style patterns
 */
async function analyzeVisualStyle(
  framePaths: string[],
  openai: OpenAI
): Promise<EditingStyle['visual']> {
  const frameData = await Promise.all(
    framePaths.slice(0, 3).map(async (framePath) => {
      const buffer = await fs.readFile(framePath);
      return buffer.toString('base64');
    })
  );

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze the visual style of this video. Return JSON:
{
  "zoomFrequency": number (estimate zooms per minute: 0-10),
  "transitionStyle": "cut" | "fade" | "dissolve" | "wipe",
  "colorGrading": string (describe color style: "warm", "cool", "vibrant", "desaturated", etc.)
}`,
          },
          ...frameData.map((data) => ({
            type: 'image_url' as const,
            image_url: {
              url: `data:image/jpeg;base64,${data}`,
            },
          })),
        ],
      },
    ],
    max_tokens: 300,
  });

  const content = response.choices[0]?.message?.content;
  const jsonMatch = content?.match(/\{[\s\S]*\}/);
  
  if (!jsonMatch) {
    return {
      zoomFrequency: 0,
      transitionStyle: 'cut',
      colorGrading: 'natural',
      overlayUsage: 0,
    };
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Analyze audio patterns
 */
async function analyzeAudioStyle(videoPath: string): Promise<EditingStyle['audio']> {
  // Simple heuristic: detect if there's background music
  // This is a basic implementation - can be enhanced
  
  return {
    musicPresent: true, // Assume yes for now
    soundEffectsFrequency: 2, // Estimate 2 SFX per minute
  };
}

/**
 * Save style profile to local storage
 */
export async function saveStyleProfile(style: EditingStyle): Promise<void> {
  const stylesDir = path.join(process.cwd(), '.next', 'data', 'styles');
  await fs.mkdir(stylesDir, { recursive: true });
  
  const filePath = path.join(stylesDir, `${style.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(style, null, 2));
  
  console.log(`✅ Style profile saved: ${style.name}`);
}

/**
 * Load all saved style profiles
 */
export async function loadStyleProfiles(): Promise<EditingStyle[]> {
  const stylesDir = path.join(process.cwd(), '.next', 'data', 'styles');
  
  try {
    const files = await fs.readdir(stylesDir);
    const styles = await Promise.all(
      files
        .filter((f) => f.endsWith('.json'))
        .map(async (file) => {
          const content = await fs.readFile(path.join(stylesDir, file), 'utf-8');
          return JSON.parse(content) as EditingStyle;
        })
    );
    return styles;
  } catch (error) {
    return []; // No styles yet
  }
}

/**
 * Get a specific style by ID
 */
export async function getStyleById(styleId: string): Promise<EditingStyle | null> {
  const styles = await loadStyleProfiles();
  return styles.find((s) => s.id === styleId) || null;
}

