import { NextRequest, NextResponse } from 'next/server';
import { appSettings } from '@/app/lib/settings';

export async function GET() {
  try {
    // Return masked API keys for security
    const maskedOpenAI = appSettings.apiKey 
      ? appSettings.apiKey.slice(0, 7) + '...' + appSettings.apiKey.slice(-4)
      : '';
    const maskedPexels = appSettings.pexelsApiKey
      ? '...' + appSettings.pexelsApiKey.slice(-4)
      : '';
    const maskedUnsplash = appSettings.unsplashApiKey
      ? '...' + appSettings.unsplashApiKey.slice(-4)
      : '';
    const maskedPixabay = appSettings.pixabayApiKey
      ? '...' + appSettings.pixabayApiKey.slice(-4)
      : '';
    
    return NextResponse.json({
      apiKey: maskedOpenAI,
      pexelsApiKey: maskedPexels,
      unsplashApiKey: maskedUnsplash,
      pixabayApiKey: maskedPixabay,
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
    const { apiKey, pexelsApiKey, unsplashApiKey, pixabayApiKey } = body;

    // Save OpenAI API key if provided
    if (apiKey && typeof apiKey === 'string' && apiKey.startsWith('sk-')) {
      appSettings.apiKey = apiKey;
    }

    // Save Pexels API key if provided
    if (pexelsApiKey && typeof pexelsApiKey === 'string') {
      appSettings.pexelsApiKey = pexelsApiKey;
    }

    // Save Unsplash API key if provided
    if (unsplashApiKey && typeof unsplashApiKey === 'string') {
      appSettings.unsplashApiKey = unsplashApiKey;
    }

    // Save Pixabay API key if provided
    if (pixabayApiKey && typeof pixabayApiKey === 'string') {
      appSettings.pixabayApiKey = pixabayApiKey;
    }

    return NextResponse.json({
      success: true,
      message: 'Settings saved successfully'
    });
  } catch (error) {
    console.error('POST /api/settings error:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
