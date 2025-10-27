'use client'

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store';
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
  const { mediaFiles, textElements } = useAppSelector(state => state.projectState);
  
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
  const [transcript, setTranscript] = useState<any>(null);
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

  const handleTranscribeVideo = async (params: { clipIndex: number }) => {
    try {
      const targetClip = mediaFiles[params.clipIndex];
      if (!targetClip) {
        throw new Error('Clip not found');
      }

      // Get the file data
      const file = await getFile(targetClip.id);
      if (!file) {
        throw new Error('File data not found');
      }

      // Convert to audio-only for Whisper
      const formData = new FormData();
      formData.append('audio', file);

      const msg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '🎤 Transcribing your video with Whisper... This may take a moment!',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, msg]);

      const response = await fetch('/api/ai/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const transcriptData = await response.json();
      setTranscript(transcriptData);
      setShowTranscript(true);

      const successMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '✅ Transcription complete! You can view, edit, and download it above.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, successMsg]);
    } catch (error) {
      console.error('Transcription error:', error);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '❌ Failed to transcribe video. Please check your API key and try again.',
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

      // Generate captions from transcript
      const response = await fetch('/api/ai/captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          words: transcript.words,
          maxWordsPerLine: 3,
        }),
      });

      if (!response.ok) {
        throw new Error('Caption generation failed');
      }

      const { segments } = await response.json();

      const msg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `✅ Generated ${segments.length} caption segments! (Note: Adding captions to timeline is coming soon - for now you can see the transcript above!)`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, msg]);

      // TODO: Add each caption segment as a text element with the selected style
      console.log('Caption segments:', segments);
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

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Execute actions
      if (data.actions && data.actions.length > 0) {
        console.log('✨ Executing AI actions:', data.actions);
        for (const action of data.actions) {
          if (action.type === 'add_captions') {
            await handleAddCaptions(action.params);
          } else if (action.type === 'transcribe_video') {
            await handleTranscribeVideo(action.params);
          } else {
            await executeTimelineActions([action], dispatch, mediaFiles, textElements);
          }
        }
        console.log('✅ Actions executed successfully!');
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
      </div>

      {/* Content Area */}
      {showTranscript && transcript ? (
        <div className="flex-1 overflow-y-auto p-4">
          <TranscriptPanel
            transcript={transcript}
            onEdit={(newText) => {
              setTranscript({ ...transcript, text: newText });
            }}
          />
        </div>
      ) : showCaptionPicker ? (
        <div className="flex-1 overflow-y-auto p-4">
          <CaptionStylePicker
            selectedStyleId={selectedCaptionStyle}
            onSelectStyle={(styleId) => {
              setSelectedCaptionStyle(styleId);
              handleAddCaptions({ clipIndex: 0, styleId });
              setShowCaptionPicker(false);
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
