import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { appSettings } from '../../settings/route';

// System prompt for the AI video editor
const SYSTEM_PROMPT = `You are an AI video editing assistant for Editor AI. You help users edit their videos using natural language commands.

Your capabilities:
- Add, remove, and rearrange clips on the timeline
- Apply transitions, effects, and filters
- Adjust timing, speed, and duration of clips
- Add text overlays and captions
- Control video properties (brightness, contrast, etc.)
- Export videos with specific settings

When users give commands, respond in a friendly, helpful way and explain what you're doing. If a command requires multiple steps or clarification, ask for it.

For now, you can describe what you would do. Timeline manipulation will be added soon.

Example interactions:
User: "Add all my videos to the timeline"
You: "I'll add all the videos from your media library to the timeline in sequence. This will create a continuous video from all your clips."

User: "Make the second clip faster"
You: "I'll speed up the second clip on your timeline. What speed would you like? 1.5x, 2x, or something else?"

Keep responses concise and actionable.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    // Get API key from shared settings
    const apiKey = appSettings.apiKey;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured. Please set it in Settings.' },
        { status: 401 }
      );
    }

    // Initialize OpenAI
    const openai = new OpenAI({ apiKey });

    // Call GPT-4o
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const assistantMessage = completion.choices[0]?.message?.content || 'I apologize, I could not process that request.';

    // TODO: Parse assistant message for timeline actions
    // For now, just return the message
    return NextResponse.json({
      success: true,
      message: assistantMessage,
      actions: [] // Will be populated later with parsed timeline actions
    });

  } catch (error: any) {
    console.error('AI chat error:', error);
    
    // Handle specific OpenAI errors
    if (error?.error?.type === 'invalid_request_error') {
      return NextResponse.json(
        { error: 'Invalid request to OpenAI. Please check your API key.' },
        { status: 400 }
      );
    }
    
    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'Invalid API key. Please update it in Settings.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process AI request. Please try again.' },
      { status: 500 }
    );
  }
}

