import { NextRequest, NextResponse } from 'next/server';

// Shared settings storage (will use electron-store in production)
export const appSettings = {
  apiKey: ''
};

export async function GET() {
  try {
    // Return masked API key for security
    const maskedKey = appSettings.apiKey 
      ? appSettings.apiKey.slice(0, 7) + '...' + appSettings.apiKey.slice(-4)
      : '';
    
    return NextResponse.json({
      apiKey: maskedKey,
      hasKey: !!appSettings.apiKey
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
    appSettings.apiKey = apiKey;

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

