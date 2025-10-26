import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { appSettings } from '@/app/lib/settings';

// Enhanced system prompt for VIDEO EDITING with ACTION COMMANDS
const SYSTEM_PROMPT = `You are an AI video editing assistant for Editor AI. You help users edit their videos using natural language commands.

Your job is to:
1. Understand what the user wants to do with their video
2. Respond in a friendly, helpful way
3. Output JSON actions that the timeline can execute

AVAILABLE ACTIONS:
- add_all_media: Add all media from library to timeline
- add_media: Add specific media file (by index or name)
- clear_timeline: Remove all clips from timeline
- add_transition: Add transition between clips
- speed_up: Speed up a clip
- slow_down: Slow down a clip
- add_text: Add text overlay

RESPONSE FORMAT:
Always respond with:
{
  "message": "Your friendly response to the user",
  "actions": [
    { "type": "action_type", "params": {...} }
  ]
}

EXAMPLES:

User: "Add all my videos to the timeline"
Response:
{
  "message": "I'll add all your media files to the timeline in sequence!",
  "actions": [
    { "type": "add_all_media", "params": {} }
  ]
}

User: "Clear the timeline"
Response:
{
  "message": "Timeline cleared! Ready for a fresh start.",
  "actions": [
    { "type": "clear_timeline", "params": {} }
  ]
}

User: "Make the second clip 2x faster"
Response:
{
  "message": "Speeding up the second clip to 2x speed!",
  "actions": [
    { "type": "speed_up", "params": { "clipIndex": 1, "speed": 2 } }
  ]
}

User: "Add a fade transition between clips"
Response:
{
  "message": "Adding fade transitions between all clips!",
  "actions": [
    { "type": "add_transition", "params": { "transitionType": "fade" } }
  ]
}

IMPORTANT:
- Always include both "message" and "actions" in your response
- If unsure, ask for clarification but still provide a helpful message
- Keep responses friendly and conversational
- Output valid JSON only`;

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

    // Call GPT-4o with JSON mode
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 800
    });

    const responseText = completion.choices[0]?.message?.content || '{"message": "I apologize, I could not process that request.", "actions": []}';
    
    // Parse the JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse GPT response:', responseText);
      parsedResponse = {
        message: responseText,
        actions: []
      };
    }

    return NextResponse.json({
      success: true,
      message: parsedResponse.message || 'Done!',
      actions: parsedResponse.actions || []
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
