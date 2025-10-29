'use client'

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { setTranscript as saveTranscript } from '@/app/store/slices/projectSlice';
import { executeTimelineActions } from '@/app/lib/ai/timelineActions';
import TranscriptPanel from '@/app/components/editor/Transcript/TranscriptPanel';
import CaptionStylePicker from '@/app/components/editor/Transcript/CaptionStylePicker';
import { getFile } from '@/app/store';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIChatPanel() {
  const dispatch = useAppDispatch();
  const { mediaFiles, textElements, transcript } = useAppSelector(state => state.projectState);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: "👋 Hi! I'm your AI video editing assistant. I can help you edit your video using natural language commands.\n\nTry saying:\n• \"Add all my videos to the timeline\"\n• \"Add captions to my video\"\n• \"Trim the video to 10 seconds\"\n• \"Make it 2x faster\"",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'valid' | 'missing'>('checking');
  const [showTranscript, setShowTranscript] = useState(false);
  const [showCaptionPicker, setShowCaptionPicker] = useState(false);
  const [selectedCaptionStyle, setSelectedCaptionStyle] = useState('mrbeast');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAPIKey();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Show transcript panel if transcript exists
  useEffect(() => {
    if (transcript) {
      setShowTranscript(true);
    }
  }, [transcript]);

  const checkAPIKey = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setApiKeyStatus(data.apiKey ? 'valid' : 'missing');
      } else {
        setApiKeyStatus('missing');
      }
    } catch (error) {
      console.error('Failed to check API key:', error);
      setApiKeyStatus('missing');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTranscribeVideo = async (params: { clipIndex: number; forceRetranscribe?: boolean }) => {
    try {
      const targetClip = mediaFiles[params.clipIndex];
      if (!targetClip) {
        throw new Error('Clip not found');
      }

      // Check if transcript already exists and matches this clip
      if (transcript && transcript.clipId === targetClip.id && !params.forceRetranscribe) {
        const msg: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: '✅ Found existing transcript! Using saved transcript. (Say "transcribe again" if you want to re-transcribe)',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, msg]);
        setShowTranscript(true);
        return;
      }

      // Get the file data from IndexedDB
      const file = await getFile(targetClip.fileId); // Use fileId, not id!
      if (!file) {
        console.error('File not found in IndexedDB:', targetClip.fileId);
        throw new Error('File data not found in storage');
      }
      
      const fileSizeMB = file.size / 1024 / 1024;
      console.log('📁 File loaded for transcription:', {
        name: targetClip.fileName,
        type: file.type,
        size: fileSizeMB.toFixed(2) + ' MB'
      });

      const msg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: fileSizeMB > 20 
          ? '🎤 Extracting and compressing audio... This may take a moment!'
          : '🎤 Transcribing your video with Whisper... This may take a moment!',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, msg]);

      // Extract audio if video is large (> 20 MB) or always extract for better compatibility
      let audioFile = file;
      if (file.type.startsWith('video/') && fileSizeMB > 20) {
        console.log('📦 File too large, extracting audio...');
        
        try {
          // Dynamic import ffmpeg
          const { FFmpeg } = await import('@ffmpeg/ffmpeg');
          const { fetchFile } = await import('@ffmpeg/util');
          
          const ffmpeg = new FFmpeg();
          await ffmpeg.load();
          
          // Write input file
          await ffmpeg.writeFile('input', await fetchFile(file));
          
          // Extract audio with compression (64k bitrate MP3)
          await ffmpeg.exec([
            '-i', 'input',
            '-vn', // No video
            '-acodec', 'libmp3lame',
            '-ab', '64k', // 64 kbps audio bitrate (small size)
            '-ar', '16000', // 16kHz sample rate (Whisper works fine with this)
            'output.mp3'
          ]);
          
          // Read output
          const data = await ffmpeg.readFile('output.mp3');
          audioFile = new File([data], 'audio.mp3', { type: 'audio/mp3' });
          
          console.log('✅ Audio extracted:', (audioFile.size / 1024 / 1024).toFixed(2) + ' MB');
        } catch (ffmpegError) {
          console.error('FFmpeg extraction failed:', ffmpegError);
          console.log('⚠️ Falling back to original file...');
          // Fall back to original file if extraction fails
        }
      }

      // Check if still too large
      if (audioFile.size > 25 * 1024 * 1024) {
        throw new Error(`File too large (${(audioFile.size / 1024 / 1024).toFixed(1)} MB). Maximum is 25 MB. Please use a shorter video or compress it first.`);
      }

      // Send to Whisper API
      const formData = new FormData();
      formData.append('audio', audioFile);

      const response = await fetch('/api/ai/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Transcription failed');
      }

      const transcriptData = await response.json();
      
      // Save transcript to Redux with clip ID
      const savedTranscript = {
        ...transcriptData,
        clipId: targetClip.id
      };
      dispatch(saveTranscript(savedTranscript));
      setShowTranscript(true);

      const successMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '✅ Transcription complete and saved! You can view, edit, and download it above.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, successMsg]);
    } catch (error: any) {
      console.error('❌ Transcription error:', error);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `❌ Failed to transcribe video: ${error.message || 'Unknown error'}. Please check your API key and try again.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const handleAddCaptions = async (params: { clipIndex: number; styleId?: string }) => {
    try {
      // First transcribe if we don't have a transcript
      if (!transcript) {
        const msg: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: '📝 First, I need to transcribe your video. Then you can choose a caption style!',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, msg]);
        await handleTranscribeVideo({ clipIndex: params.clipIndex });
        setShowCaptionPicker(true);
        return;
      }

      // If we have transcript but no style selected, show style picker
      if (!params.styleId && !selectedCaptionStyle) {
        const msg: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: '🎨 Great! Now choose a caption style above.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, msg]);
        setShowCaptionPicker(true);
        return;
      }

      // Get caption style
      const { captionStyles } = await import('@/app/lib/ai/captionStyles');
      const style = captionStyles[params.styleId || selectedCaptionStyle || 'mrbeast'] || captionStyles.mrbeast;

      // Use segments from transcript (words might be null with current Whisper API)
      const segments = transcript.segments || [];
      
      if (!segments || segments.length === 0) {
        throw new Error('No transcript segments available. Please transcribe the video first.');
      }

      console.log('📝 Creating captions from', segments.length, 'segments');

      // Actually add captions to the timeline!
      // For 1920x1080 canvas: top=10, center=540, bottom=1000
      const getYPosition = (pos?: string) => {
        if (pos === 'top') return 10; // TRULY top!
        if (pos === 'bottom') return 1000;
        return 540; // true center
      };

      const getXPosition = (pos?: string) => {
        if (pos === 'left') return 100;
        if (pos === 'right') return 1720;
        return 960; // center
      };

      const captionElements = segments.map((seg: any, index: number) => ({
        id: `caption-${Date.now()}-${index}`,
        text: seg.text,
        positionStart: seg.start,
        positionEnd: seg.end,
        x: getXPosition(style.position?.x),
        y: getYPosition(style.position?.y),
        fontSize: style.fontSize || 48,
        font: style.fontFamily || 'Arial Black',
        color: style.color || '#FFFFFF',
        backgroundColor: style.backgroundColor,
        align: 'center' as const,
        fadeInDuration: 0.1,
        fadeOutDuration: 0.1,
      }));

      // Add to timeline using the action executor
      await executeTimelineActions(
        [{ type: 'add_multiple_text', params: { textElements: captionElements } }],
        dispatch,
        mediaFiles,
        [...textElements, ...captionElements]
      );

      const msg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `✅ Added ${segments.length} captions to your timeline! You can edit them individually or adjust their style.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, msg]);
      setShowCaptionPicker(false);
    } catch (error) {
      console.error('Caption error:', error);
      const msg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '❌ Failed to add captions. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, msg]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call AI Chat API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error('AI request failed');
      }

      const data = await response.json();

      console.log('🤖 AI Response:', data);
      console.log('📊 Actions received:', data.actions);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Execute actions
      if (data.actions && data.actions.length > 0) {
        console.log('✨ Executing', data.actions.length, 'AI action(s):', data.actions);
        for (const action of data.actions) {
          console.log('⚡ Executing action:', action.type, 'with params:', action.params);
          if (action.type === 'add_captions') {
            await handleAddCaptions(action.params);
          } else if (action.type === 'transcribe_video') {
            await handleTranscribeVideo(action.params);
          } else {
            await executeTimelineActions([action], dispatch, mediaFiles, textElements);
          }
        }
        console.log('✅ All', data.actions.length, 'action(s) executed successfully!');
      } else {
        console.warn('⚠️ NO ACTIONS RETURNED! AI just talked without doing anything.');
        console.warn('   This is the problem! AI should return actions.');
      }
    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please check your API key in Settings and try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (apiKeyStatus === 'checking') {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (apiKeyStatus === 'missing') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <Bot size={64} className="text-gray-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">API Key Required</h3>
        <p className="text-gray-400 mb-4">
          You need an OpenAI API key to use AI features.
        </p>
        <a
          href="/settings"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
        >
          Go to Settings
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black bg-opacity-20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white border-opacity-10">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-blue-400" />
          <h3 className="font-semibold text-lg">AI Assistant</h3>
        </div>
        <div className="flex gap-2">
          {transcript && (
            <button
              onClick={() => {
                setShowTranscript(!showTranscript);
                setShowCaptionPicker(false);
              }}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition"
            >
              {showTranscript ? 'Hide' : 'Show'} Transcript
            </button>
          )}
          {(transcript || textElements.length > 0) && (
            <button
              onClick={() => {
                setShowCaptionPicker(!showCaptionPicker);
                setShowTranscript(false);
              }}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition font-semibold"
            >
              🎨 Caption Style
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      {showTranscript && transcript ? (
        <div className="flex-1 overflow-y-auto p-4">
          <TranscriptPanel
            transcript={transcript}
            onEdit={(newText) => {
              dispatch(saveTranscript({ ...transcript, text: newText }));
            }}
          />
        </div>
      ) : showCaptionPicker ? (
        <div className="flex-1 overflow-y-auto p-4">
          <CaptionStylePicker
            selectedStyleId={selectedCaptionStyle}
            onSelectStyle={async (styleId) => {
              setSelectedCaptionStyle(styleId);
              
              // If captions already exist, update their style
              if (textElements.length > 0) {
                const { captionStyles } = await import('@/app/lib/ai/captionStyles');
                const style = captionStyles[styleId];
                
                if (style) {
                  // Get Y position from style
                  const getYPosition = (pos?: string) => {
                    if (pos === 'top') return 120;
                    if (pos === 'bottom') return 950;
                    return 540; // center (half of 1080)
                  };
                  
                  await executeTimelineActions(
                    [{ 
                      type: 'adjust_all_captions', 
                      params: {
                        fontSize: style.fontSize,
                        y: getYPosition(style.position?.y),
                        color: style.color,
                        backgroundColor: style.backgroundColor || undefined,
                      }
                    }],
                    dispatch,
                    mediaFiles,
                    textElements
                  );
                  
                  const msg: Message = {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: `✅ Applied ${style.name} style to all captions!`,
                    timestamp: new Date()
                  };
                  setMessages(prev => [...prev, msg]);
                }
                setShowCaptionPicker(false);
              } else {
                // No captions yet, generate them with this style
                handleAddCaptions({ clipIndex: 0, styleId });
                setShowCaptionPicker(false);
              }
            }}
            onApplyCustomSettings={async (settings) => {
              // Apply custom settings to all captions using AI action
              await executeTimelineActions(
                [{ type: 'adjust_all_captions', params: settings }],
                dispatch,
                mediaFiles,
                textElements
              );
              const msg: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: `✅ Applied custom caption settings!`,
                timestamp: new Date()
              };
              setMessages(prev => [...prev, msg]);
            }}
          />
        </div>
      ) : (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-blue-600' 
                    : 'bg-purple-600'
                }`}>
                  {message.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div className={`flex-1 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                  <div className={`inline-block px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white bg-opacity-5 border border-white border-opacity-10'
                  }`}>
                    <div className="whitespace-pre-wrap break-words text-sm">
                      {message.content}
                    </div>
                    <div className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                  <Bot size={18} />
                </div>
                <div className="flex-1">
                  <div className="inline-block px-4 py-2 rounded-lg bg-white bg-opacity-5 border border-white border-opacity-10">
                    <Loader2 className="animate-spin" size={16} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white border-opacity-10">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me to edit your video..."
                rows={2}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-white bg-opacity-5 border border-white border-opacity-20 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </>
      )}
    </div>
  );
}
