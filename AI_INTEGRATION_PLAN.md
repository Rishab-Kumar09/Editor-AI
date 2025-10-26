# 🤖 AI Integration Plan for Editor AI

## Phase 1: Foundation (Current - Next 2 Hours)

### 1.1 Create AI Chat Interface
- [ ] Add a resizable chat panel to the editor
- [ ] Chat UI with message history
- [ ] Input field with send button
- [ ] Loading states for AI responses
- [ ] Error handling UI

### 1.2 OpenAI GPT-4o Integration
- [ ] Add OpenAI SDK to dependencies
- [ ] Create settings page for API key storage
- [ ] IPC handlers for GPT API calls in Electron main process
- [ ] Test basic chat functionality

### 1.3 Command Parser
- [ ] Design JSON schema for timeline commands
- [ ] Create system prompts for GPT
- [ ] Parse GPT responses into timeline actions
- [ ] Execute timeline modifications from commands

---

## Phase 2: Smart Editing (Next Session)

### 2.1 Whisper Transcription
- [ ] Add Whisper API integration
- [ ] Extract timestamps from audio/video
- [ ] Display transcription in UI
- [ ] Sync captions to timeline

### 2.2 Auto-Sync to Narration
- [ ] Analyze script vs media
- [ ] Match media to script context
- [ ] Place media at correct timestamps
- [ ] Apply default transitions

### 2.3 Timeline Manipulation
- [ ] Add/remove clips via AI commands
- [ ] Adjust durations via AI
- [ ] Apply transitions via AI
- [ ] Add text/captions via AI

---

## Phase 3: Advanced AI (Future)

### 3.1 Style Learning
- [ ] Analyze reference videos (YouTube/local)
- [ ] Extract shot lengths, transitions, zoom patterns
- [ ] Create style profiles
- [ ] Apply styles to user videos

### 3.2 Auto B-Roll
- [ ] Integrate Unsplash/Pexels API
- [ ] Search for relevant images based on script
- [ ] Auto-place B-roll at relevant timestamps

### 3.3 Emotion-Aware Editing
- [ ] Analyze script sentiment
- [ ] Match transitions to emotion
- [ ] Select music based on mood

---

## Technical Architecture

```
┌─────────────────────────────────────────┐
│           React UI (Renderer)           │
│  ┌────────────┐      ┌──────────────┐  │
│  │  Timeline  │      │  Chat Panel  │  │
│  │  Editor    │◄────►│  (AI Input)  │  │
│  └────────────┘      └──────────────┘  │
│         ▲                    │          │
└─────────┼────────────────────┼──────────┘
          │ IPC                │ IPC
┌─────────┼────────────────────┼──────────┐
│         ▼                    ▼          │
│      Electron Main Process              │
│  ┌────────────┐      ┌──────────────┐  │
│  │  Timeline  │      │  AI Service  │  │
│  │  Manager   │◄────►│  (GPT/Whsp)  │  │
│  └────────────┘      └──────────────┘  │
│         │                    │          │
│         ▼                    ▼          │
│  ┌────────────┐      ┌──────────────┐  │
│  │   FFmpeg   │      │   OpenAI     │  │
│  │   WASM     │      │     API      │  │
│  └────────────┘      └──────────────┘  │
└─────────────────────────────────────────┘
```

---

## Example Commands

**User:** "Add my talking-head video and create a 2-minute cut with smooth transitions"

**GPT Response (JSON):**
```json
{
  "actions": [
    {
      "type": "add_clip",
      "file": "talking_head.mp4",
      "track": "video",
      "start": 0,
      "duration": 120,
      "trimStart": 5,
      "trimEnd": 125
    },
    {
      "type": "add_transition",
      "between": ["clip_1", "clip_2"],
      "transitionType": "crossfade",
      "duration": 1
    }
  ]
}
```

---

## Next Immediate Steps

1. ✅ Save code to GitHub (DONE)
2. 🔨 Add chat panel to editor UI (NOW)
3. 🔨 Create settings page for API key (NOW)
4. 🔨 Integrate OpenAI SDK (NOW)
5. 🔨 Test basic chat flow (NOW)

Let's build this! 🚀

