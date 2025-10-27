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
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['word', 'segment'],
    });

    return NextResponse.json({
      text: transcription.text,
      words: transcription.words,
      segments: transcription.segments,
      language: transcription.language,
    });
  } catch (error: any) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}

