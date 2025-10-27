import { NextRequest, NextResponse } from 'next/server';

interface Word {
  word: string;
  start: number;
  end: number;
}

interface CaptionSegment {
  text: string;
  start: number;
  end: number;
  words: Word[];
}

export async function POST(request: NextRequest) {
  try {
    const { words, maxWordsPerLine = 3 } = await request.json();

    if (!words || !Array.isArray(words)) {
      return NextResponse.json(
        { error: 'Invalid words data' },
        { status: 400 }
      );
    }

    // Group words into caption segments
    const segments: CaptionSegment[] = [];
    for (let i = 0; i < words.length; i += maxWordsPerLine) {
      const chunk = words.slice(i, i + maxWordsPerLine);
      segments.push({
        text: chunk.map((w: Word) => w.word).join(' '),
        start: chunk[0].start,
        end: chunk[chunk.length - 1].end,
        words: chunk,
      });
    }

    return NextResponse.json({ segments });
  } catch (error: any) {
    console.error('Caption generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate captions' },
      { status: 500 }
    );
  }
}

