import { NextRequest, NextResponse } from 'next/server';
import { appSettings } from '@/app/lib/settings';

/**
 * AI Image Search API
 * Searches multiple free image APIs (Pexels, Unsplash, Pixabay)
 * Falls back to Lorem Picsum if no API keys configured
 */

interface ImageResult {
  id: string;
  url: string;
  thumbnail: string;
  source: 'pexels' | 'unsplash' | 'pixabay' | 'lorem-picsum';
  photographer?: string;
  alt: string;
}

export async function POST(request: NextRequest) {
  try {
    const { query, count = 5 } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Invalid query parameter' },
        { status: 400 }
      );
    }

    console.log(`🔍 AI Image Search: "${query}" (requesting ${count} images)`);

    // Try to get API keys from settings (if configured)
    const pexelsKey = (appSettings as any).pexelsApiKey || process.env.PEXELS_API_KEY;
    const unsplashKey = (appSettings as any).unsplashApiKey || process.env.UNSPLASH_API_KEY;
    const pixabayKey = (appSettings as any).pixabayApiKey || process.env.PIXABAY_API_KEY;

    const images: ImageResult[] = [];

    // Try Pexels first (best quality, most generous free tier)
    if (pexelsKey) {
      try {
        console.log('🟢 Using Pexels API');
        const pexelsImages = await searchPexels(query, count, pexelsKey);
        images.push(...pexelsImages);
      } catch (error) {
        console.error('Pexels search failed:', error);
      }
    }

    // Try Unsplash if we need more images
    if (unsplashKey && images.length < count) {
      try {
        console.log('🟡 Using Unsplash API');
        const unsplashImages = await searchUnsplash(query, count - images.length, unsplashKey);
        images.push(...unsplashImages);
      } catch (error) {
        console.error('Unsplash search failed:', error);
      }
    }

    // Try Pixabay if we still need more
    if (pixabayKey && images.length < count) {
      try {
        console.log('🔵 Using Pixabay API');
        const pixabayImages = await searchPixabay(query, count - images.length, pixabayKey);
        images.push(...pixabayImages);
      } catch (error) {
        console.error('Pixabay search failed:', error);
      }
    }

    // Fallback to Lorem Picsum if no API keys or not enough images
    if (images.length < count) {
      console.log('⚪ Falling back to Lorem Picsum (no API keys configured)');
      const loremImages = await getLoremPicsumImages(count - images.length, query);
      images.push(...loremImages);
    }

    console.log(`✅ Found ${images.length} images`);

    return NextResponse.json({
      images,
      message: images.length > 0 
        ? `Found ${images.length} images for "${query}"`
        : `No images found for "${query}"`,
      hasApiKeys: !!(pexelsKey || unsplashKey || pixabayKey),
    });
  } catch (error: any) {
    console.error('Image search error:', error);
    return NextResponse.json(
      { error: 'Failed to search for images' },
      { status: 500 }
    );
  }
}

/**
 * Search Pexels API
 */
async function searchPexels(query: string, count: number, apiKey: string): Promise<ImageResult[]> {
  const response = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}`,
    {
      headers: {
        'Authorization': apiKey,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.status}`);
  }

  const data = await response.json();
  return data.photos.map((photo: any) => ({
    id: `pexels-${photo.id}`,
    url: photo.src.large,
    thumbnail: photo.src.medium,
    source: 'pexels' as const,
    photographer: photo.photographer,
    alt: photo.alt || query,
  }));
}

/**
 * Search Unsplash API
 */
async function searchUnsplash(query: string, count: number, apiKey: string): Promise<ImageResult[]> {
  const response = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}`,
    {
      headers: {
        'Authorization': `Client-ID ${apiKey}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Unsplash API error: ${response.status}`);
  }

  const data = await response.json();
  return data.results.map((photo: any) => ({
    id: `unsplash-${photo.id}`,
    url: photo.urls.regular,
    thumbnail: photo.urls.small,
    source: 'unsplash' as const,
    photographer: photo.user.name,
    alt: photo.alt_description || query,
  }));
}

/**
 * Search Pixabay API
 */
async function searchPixabay(query: string, count: number, apiKey: string): Promise<ImageResult[]> {
  const response = await fetch(
    `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&per_page=${count}&image_type=photo`
  );

  if (!response.ok) {
    throw new Error(`Pixabay API error: ${response.status}`);
  }

  const data = await response.json();
  return data.hits.map((hit: any) => ({
    id: `pixabay-${hit.id}`,
    url: hit.largeImageURL,
    thumbnail: hit.webformatURL,
    source: 'pixabay' as const,
    photographer: hit.user,
    alt: hit.tags || query,
  }));
}

/**
 * Fallback: Lorem Picsum (no API key needed)
 * Returns random high-quality placeholder images
 */
async function getLoremPicsumImages(count: number, query: string): Promise<ImageResult[]> {
  const images: ImageResult[] = [];
  
  // Generate random IDs to get different images
  for (let i = 0; i < count; i++) {
    const randomId = Math.floor(Math.random() * 1000);
    const width = 1920;
    const height = 1080;
    
    images.push({
      id: `lorem-${randomId}-${i}`,
      url: `https://picsum.photos/id/${randomId}/${width}/${height}`,
      thumbnail: `https://picsum.photos/id/${randomId}/400/300`,
      source: 'lorem-picsum' as const,
      alt: `Image related to ${query}`,
    });
  }
  
  return images;
}

