import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for MVP (will use localStorage/electron-store in production)
let settings = {
  apiKey: ''
};

export async function GET() {
  try {
    // Return masked API key for security
    const maskedKey = settings.apiKey 
      ? settings.apiKey.slice(0, 7) + '...' + settings.apiKey.slice(-4)
      : '';
    
    return NextResponse.json({
      apiKey: maskedKey,
      hasKey: !!settings.apiKey
    });
  } catch (error) {
    console.error('GET /api/settings error:', error);
    return NextResponse.json(
      { error: 'Failed to load settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey } = body;

    // Basic validation
    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 400 }
      );
    }

    // OpenAI API keys start with 'sk-'
    if (!apiKey.startsWith('sk-')) {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key format' },
        { status: 400 }
      );
    }

    // Store the API key (encrypted in production)
    settings.apiKey = apiKey;

    return NextResponse.json({
      success: true,
      message: 'API key saved successfully'
    });
  } catch (error) {
    console.error('POST /api/settings error:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}

