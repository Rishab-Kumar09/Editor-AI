import { NextRequest, NextResponse } from 'next/server';
import { appSettings } from '@/app/lib/settings';

export const maxDuration = 300; // 5 minutes for analysis

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const videoFile = formData.get('video') as File;
    const styleName = formData.get('styleName') as string;

    if (!videoFile || !styleName) {
      return NextResponse.json(
        { error: 'Missing video file or style name' },
        { status: 400 }
      );
    }

    // Get OpenAI API key
    const openaiApiKey = appSettings.apiKey;
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 401 }
      );
    }

    // Save video temporarily
    const bytes = await videoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempPath = `/tmp/analyze-${Date.now()}.mp4`;
    
    // In production, we'd use fs.writeFile, but for Electron we need to handle this differently
    // For now, return a message that we're processing
    
    console.log('🎬 Starting style analysis...');
    
    // TODO: Implement video file handling for Electron environment
    // For now, return a placeholder response
    return NextResponse.json({
      message: 'Style analysis feature is being set up. Coming soon!',
      status: 'processing',
    });

  } catch (error: any) {
    console.error('Style analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze style' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Dynamic import to avoid bundling Node.js modules
    const { loadStyleProfiles } = await import('@/app/lib/ai/styleAnalyzer');
    const styles = await loadStyleProfiles();
    
    return NextResponse.json({ styles });
  } catch (error: any) {
    console.error('Failed to load styles:', error);
    return NextResponse.json(
      { error: 'Failed to load style profiles' },
      { status: 500 }
    );
  }
}

