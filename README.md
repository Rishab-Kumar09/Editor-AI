# 🎬 **Editor AI** - AI-Powered Video Editor

> **The future of video editing**: Chat with AI to edit your videos. No complex UI, just natural language commands.

---

## ✨ **What is Editor AI?**

Editor AI is a **desktop video editing application** that combines professional editing tools with **AI-powered automation**. Simply chat with the AI assistant to trim videos, add captions, transcribe audio, and more - all using natural language commands.

**Built for creators who want to edit faster, not harder.**

---

## 🚀 **Key Features**

### **🤖 AI-Powered Editing**
- **Natural Language Commands**: "Trim the video to 10 seconds", "Add captions in MrBeast style"
- **OpenAI Integration**: Powered by GPT-4o for intelligent command interpretation
- **Whisper Transcription**: Multilingual speech-to-text with word-level timestamps
- **Smart Actions**: AI actually performs edits, doesn't just provide instructions

### **✂️ Advanced Editing**
- **Flexible Trimming**: Range trim, remove start, restore to original
- **Real-time Preview**: See changes instantly with Remotion
- **Timeline Editor**: Drag, arrange, and manage clips visually
- **Media Support**: Videos, audio, images, and text overlays

### **📝 Caption Generation**
- **Auto-Captions**: One-command caption generation from video audio
- **6 Professional Styles**: MrBeast, Alex Hormozi, TikTok Viral, Ali Abdaal, VSauce, Gaming
- **Transcript Editor**: View, edit, and download transcripts (.txt, .srt)
- **Customizable**: Font, size, color, position, and animation

### **⚡ Workflow**
- **Local-First**: No cloud uploads, all processing on your machine
- **IndexedDB Storage**: Projects saved locally with OPFS for media
- **Fast Export**: FFmpeg WASM with optimized encoding presets
- **Multiple Resolutions**: 480p, 720p, 1080p export options

---

## 🎯 **How It Works**

### **Traditional Editing:**
1. Upload media files
2. Drag clips to timeline
3. Manually trim, arrange, and adjust
4. Add text overlays individually
5. Export

### **AI-Powered Editing:**
1. Upload media files
2. **Tell the AI what you want**: "Add all videos, trim to 30 seconds, add captions"
3. **AI does the work** - automatically!
4. Export

---

## 💬 **AI Commands Examples**

```
"Add all my videos to the timeline"
"Trim the first video to 10 seconds"
"Keep only from second 20 to second 30"
"Remove the first 15 seconds"
"Undo that trim"
"Make it 2x faster"
"Add captions in MrBeast style"
"Transcribe this video"
"Add a title that says 'Welcome'"
"Clear the timeline"
```

**The AI understands context and performs actions immediately!**

---

## 📦 **Installation**

### **Windows (Recommended)**

1. **Download** the latest `Editor-AI-Setup.exe` from [Releases](https://github.com/Rishab-Kumar09/Editor-AI/releases)
2. **Run** the installer
3. **Launch** Editor AI
4. **Add your OpenAI API key** in Settings
5. **Start editing!**

### **From Source**

```bash
# Clone the repository
git clone https://github.com/Rishab-Kumar09/Editor-AI.git
cd Editor-AI/clip-js

# Install dependencies
npm install

# Run in development mode
npm run electron:dev

# Or build for Windows
npm run build:win
```

---

## ⚙️ **Setup**

### **1. Get an OpenAI API Key**
- Visit [OpenAI Platform](https://platform.openai.com/api-keys)
- Create a new API key
- Copy it

### **2. Add API Key to Editor AI**
- Open **Editor AI**
- Click **⚙️ Settings** (or home page "AI Settings" button)
- Paste your API key
- Click **Save**

### **3. Start Editing!**
- Create a **New Project**
- Upload your media files
- Click the **🤖 AI Assistant** button
- Start chatting!

---

## 🎨 **Caption Styles**

| Style | Description | Use Case |
|-------|-------------|----------|
| **MrBeast** | Large yellow text, black outline, bouncy animation | Viral content, energetic videos |
| **Alex Hormozi** | Clean white text, professional look | Business, educational content |
| **TikTok Viral** | Highlighted text, uppercase | Short-form viral content |
| **Ali Abdaal** | Simple yellow captions, clean | Productivity, tutorials |
| **VSauce** | Minimal white text, subtle shadow | Educational, documentary |
| **Gaming** | Bold green text, gaming aesthetic | Gaming videos, streams |

---

## 🛠️ **Tech Stack**

- **Electron** - Cross-platform desktop app
- **Next.js** - React framework
- **Remotion** - Real-time video preview
- **FFmpeg WASM** - Video rendering and export
- **OpenAI GPT-4o** - AI command interpretation
- **OpenAI Whisper** - Speech-to-text transcription
- **IndexedDB + OPFS** - Local storage
- **Redux Toolkit** - State management
- **Tailwind CSS** - Styling

---

## 📊 **System Requirements**

- **OS**: Windows 10 or later (macOS/Linux coming soon)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 500MB for app + space for projects
- **Internet**: Required for AI features (OpenAI API)

---

## 🤝 **Contributing**

Contributions are welcome! This project is built to be:
- **Open to improvements**: Better AI prompts, new features
- **Extensible**: Add new caption styles, export formats
- **Community-driven**: Built for creators, by creators

---

## 📝 **Roadmap**

- [ ] Image generation and insertion
- [ ] Multi-language UI
- [ ] Cloud project sync
- [ ] Collaboration features
- [ ] Plugin system
- [ ] More AI models support
- [ ] macOS and Linux builds

---

## 💡 **Support**

- **Issues**: [GitHub Issues](https://github.com/Rishab-Kumar09/Editor-AI/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Rishab-Kumar09/Editor-AI/discussions)

---

## 🙏 **Acknowledgments**

Built on top of [clip-js](https://github.com/mohyezid/clip-js) by Mohy Ibrahim, with extensive AI enhancements and features.

---

**Made with ❤️ for creators who want to edit videos smarter, not harder.**

**⭐ Star this repo if you find it useful!**
