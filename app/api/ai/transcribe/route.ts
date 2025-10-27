import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { appSettings } from '@/app/lib/settings';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Get API key
    const apiKey = appSettings.apiKey;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 401 }
      );
    }

    // Initialize OpenAI
    const openai = new OpenAI({ apiKey });

    // Transcribe with Whisper (with timestamps)
    // Note: Using verbose_json for segment-level timestamps
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'verbose_json',
    });

    return NextResponse.json({
      text: transcription.text,
      words: transcription.words,
      segments: transcription.segments,
      language: transcription.language,
    });
  } catch (error: any) {
    console.error('❌ Transcription error:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      type: error.type,
      code: error.code,
    });
    
    // Return more detailed error message
    const errorMessage = error.message || 'Failed to transcribe audio';
    const errorDetails = error.status ? ` (Status: ${error.status})` : '';
    
    return NextResponse.json(
      { error: `${errorMessage}${errorDetails}` },
      { status: 500 }
    );
  }
}

