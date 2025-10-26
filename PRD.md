# YouTuber.ai / Editor AI - Product Requirements Document

**Version:** Phase 1 (Local MVP)  
**Author:** Rishab Kumar  
**Date:** October 25, 2025  

---

## 1. Mission & Vision

### Mission
Enable creators to build, edit, and render complete YouTube-ready videos using simple chat instructions, without needing complex software or cloud dependencies.

### Vision
Empower every storyteller with an AI video editor that works like a chat companion, combining GPT intelligence with FFmpeg rendering — all running locally on Windows.

---

## 2. Product Overview

**Editor AI** is a Windows desktop app where users can:

- Upload voiceovers, scripts, images, B-rolls, and talking-head videos
- Chat naturally to guide video editing
- Automatically generate a video with transitions, jump cuts, zooms, and synced timing
- Export a final MP4 video

Everything runs offline, except GPT API calls using the user's own API key.

---

## 3. Key Features

### Chat-Based Interface
- Central chat window for all commands
- GPT interprets commands and produces structured JSON instructions for video assembly

### Local Video Assembly Engine
- Uses FFmpeg to stitch media together
- Applies transitions, zooms, and jump cuts
- Auto-syncs images/videos to narration
- Generates captions via GPT and overlays them

### File Management
- Media stored locally in project folders
- Temporary files managed automatically
- Project state saved in `project.json`

### Settings Page
- User input for OpenAI API key
- Options: default export folder, resolution, transition style
- Stored in local `settings.json`

### Export & Preview
- Low-res preview for testing
- High-quality final export
- Optional watermark/logo

### Reference Style Support
- Upload reference video or provide link
- Extract style features: shot length, transitions, zoom, motion
- GPT applies style features to user video

---

## 4. Technical Architecture

### Frontend
- **Stack:** Electron + React + Tailwind
- **Handles:** UI, settings, file upload, and preview

### Backend
- **Stack:** Node.js
- **Handles:** FFmpeg commands, media management, GPT API calls, and JSON timeline generation

### AI Integration
- **GPT-4o:** Interprets chat, generates timeline JSON, analyzes script and media
- **Whisper:** Transcribes talking-head videos (English, Hindi, Punjabi)

---

## 5. File & Project Structure

```
Editor AI/
│
├── app/
│   ├── main.js              # Electron entry
│   ├── renderer/            # React UI
│   ├── backend/             # Node logic (FFmpeg, GPT handler)
│
├── user_data/
│   ├── settings.json        # API key & preferences
│   ├── projects/
│       ├── project_01/
│       │   ├── script.txt
│       │   ├── voice.mp3
│       │   ├── images/
│       │   ├── project.json  # GPT timeline + instructions
│       │   └── output.mp4
│
├── ffmpeg/                  # Portable FFmpeg binaries
```

---

## 6. AI Command Flow

1. User prompt → GPT parses input
2. Command interpreter converts JSON → FFmpeg commands
3. FFmpeg executes to assemble video
4. Progress updates displayed in chat

---

## 7. Example Chat Scenarios

### Scenario 1 – Auto Create
**User:** _"I've uploaded my voiceover, script, and 5 images. Make a calm, emotional story."_

**Result:** GPT generates video plan → FFmpeg renders → Output: `video.mp4`

### Scenario 2 – Custom Edit
**User:** _"Replace image 3 with image 5 after 7 seconds."_

**Result:** GPT updates timeline → `project.json` → re-render preview

### Scenario 3 – Add Captions
**User:** _"Add captions in white with black outline."_

**Result:** GPT converts script → SRT → FFmpeg overlays captions

### Scenario 4 – Reference Style
**User:** _"Make my video follow the style of reference.mp4"_

**Result:** AI extracts shot lengths, transitions, zoom, pacing → applies to timeline JSON → FFmpeg renders

---

## 8. AI Prompt Design (System Instruction)

```
You are a video editor assistant. The user will upload voiceovers, scripts, images, 
B-rolls, and optionally talking-head videos.

Analyze the input and any reference video to output a structured plan (JSON) for 
assembling the video using FFmpeg.

Rules:
- Match voiceover timing with relevant images or media
- Include natural transitions
- Mimic reference style features if provided
- Output machine-readable JSON only
```

---

## 9. Performance & Offline Goals

- Fully local rendering via FFmpeg
- Video assembly <2x real-time for 720p
- Only GPT API key needed for AI intelligence

---

## 10. Privacy & Security

- Media stays on local device
- API keys stored securely in local JSON
- No telemetry or background analytics

---

## 11. Future Extensions (Phase 2+)

- Automatic B-roll search (Unsplash/Pexels API)
- Template presets (Shorts, Explainers, Motivational)
- Built-in TTS voices
- YouTube auto-upload
- Emotion-aware transitions using AI vision models

---

## 12. Success Criteria

| Metric | Goal |
|--------|------|
| Render time (720p) | ≤ 2x video duration |
| App install size | ≤ 300MB |
| GPT calls per session | ≤ 5 |
| User setup time | ≤ 2 min |
| External dependencies | None (except GPT API key) |

---

## 13. User Workflow Summary

1. Upload voice/script/media (+ optional reference video)
2. Chat instructions → GPT generates timeline JSON
3. Preview video
4. Adjust commands if needed
5. Export final MP4

**All done locally except GPT calls.**

---

## 14. Current Status (As of Oct 26, 2025)

### ✅ Completed
- Electron desktop app framework
- Full timeline editor (Filmora-style UI)
- FFmpeg WASM video rendering
- Project management with local storage
- Drag & drop media to timeline
- Multi-track editing with duration display
- Export to MP4 with quality settings
- Optimized export speed (ultrafast preset)
- Clean UI with dark theme
- Windows .exe installer (~90MB)

### 🚧 In Progress
- AI chat interface
- GPT-4o integration
- Settings page for API key
- Command parser for timeline manipulation

### 📋 Next Steps
- Whisper transcription
- Auto-sync to narration
- Reference style learning
- Auto captions

---

**Built with ❤️ by Rishab Kumar**  
**Mission:** Never pay for SaaS when you can build it yourself!

