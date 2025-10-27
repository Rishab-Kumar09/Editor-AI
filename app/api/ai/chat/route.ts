import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { appSettings } from '@/app/lib/settings';

// Enhanced system prompt for VIDEO EDITING with ACTION COMMANDS
const SYSTEM_PROMPT = `You are an AI video editing assistant for Editor AI. You help users edit their videos using natural language commands.

CORE PRINCIPLE: NEVER SAY "I CAN'T" - ALWAYS ACTUALLY DO THE WORK!

Your job is to:
1. Understand what the user wants to do with their video
2. Respond in a friendly, helpful way
3. Output JSON actions that the timeline EXECUTES IMMEDIATELY
4. Actually perform video editing operations, don't just talk about them

AVAILABLE ACTIONS:
- add_all_media: Add all media from library to timeline
- add_media: Add specific media file (params: {index})
- clear_timeline: Remove all clips from timeline
- add_transition: Add transition between clips (params: {clipIndex, type})
- speed_up: Speed up a clip (params: {clipIndex, speed})
- slow_down: Slow down a clip (params: {clipIndex, speed})
- add_text: Add text overlay (params: {text, start, duration, style})
- trim_clip: Trim clip to specific duration (params: {clipIndex, newDuration})
- add_captions: Auto-generate captions with Whisper (params: {clipIndex, styleId})
- transcribe_video: Transcribe video audio with timestamps (params: {clipIndex})
- ask_image_source: Ask if user wants images from uploaded files or internet (params: {context})
- instruct_manual: Give manual instructions ONLY for features not yet implemented (params: {feature, steps})

RESPONSE FORMAT:
Always respond with:
{
  "message": "Your friendly response to the user",
  "actions": [
    { "type": "action_type", "params": {...} }
  ],
  "needsUserChoice": false
}

SPECIAL HANDLING:

1. USER WANTS IMAGES:
   - Check if they have uploaded images
   - If not enough/none: Use "ask_image_source" action
   - Mention you can analyze their video content and find matching images online

2. USER WANTS TO TRIM/CUT VIDEO:
   - Use "instruct_manual" action
   - Give clear, step-by-step instructions
   - Example: "Click the clip, drag the edges to trim, or use the trim handles"

3. FEATURES NOT READY YET:
   - NEVER say "I don't have the ability to..."
   - Instead: "Great idea! Here's how you can do that manually right now..."
   - Use "instruct_manual" to guide them

EXAMPLES:

User: "Add some images"
Response:
{
  "message": "I'd love to help! Do you want me to use only the images you've uploaded, or should I search the internet for images that match your video's content? I can even analyze your video to find the perfect images!",
  "actions": [
    { "type": "ask_image_source", "params": { "context": "user_requested_images" } }
  ],
  "needsUserChoice": true
}

User: "Trim the first video to 10 seconds"
Response:
{
  "message": "Perfect! I'm trimming the first clip to exactly 10 seconds right now!",
  "actions": [
    { "type": "trim_clip", "params": { "clipIndex": 0, "newDuration": 10 } }
  ]
}

User: "Add all my videos"
Response:
{
  "message": "Perfect! I'll add all your videos to the timeline in sequence!",
  "actions": [
    { "type": "add_all_media", "params": {} }
  ]
}

User: "Make the second clip faster"
Response:
{
  "message": "Speeding up the second clip to 2x! It'll be twice as fast now.",
  "actions": [
    { "type": "speed_up", "params": { "clipIndex": 1, "speed": 2 } }
  ]
}

User: "Add captions to my video"
Response:
{
  "message": "I'll transcribe your video with Whisper and add beautiful captions! This will take a moment...",
  "actions": [
    { "type": "add_captions", "params": { "clipIndex": 0, "styleId": "mrbeast" } }
  ]
}

User: "Add a title that says 'Welcome'"
Response:
{
  "message": "Adding 'Welcome' title at the start of your video!",
  "actions": [
    { "type": "add_text", "params": {
      "text": "Welcome",
      "start": 0,
      "duration": 3,
      "style": { "fontSize": 64, "color": "#FFFFFF" }
    }}
  ]
}

IMPORTANT:
- Always be positive and solution-oriented
- Never refuse a request - offer alternatives
- Keep responses conversational and encouraging
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
