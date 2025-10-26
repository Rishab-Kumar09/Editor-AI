'use client'

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: "👋 Hi! I'm your AI video editing assistant. I can help you edit your video using natural language commands.\n\nTry saying:\n• \"Add all my videos to the timeline\"\n• \"Add a fade transition between clips\"\n• \"Speed up the second clip by 2x\"",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'valid' | 'missing'>('checking');
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
        setApiKeyStatus(data.hasKey ? 'valid' : 'missing');
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

      // If AI returns actions, execute them
      if (data.actions && data.actions.length > 0) {
        console.log('Executing AI actions:', data.actions);
        // TODO: Execute timeline actions
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
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white border-opacity-10">
        <Sparkles size={20} className="text-blue-400" />
        <h3 className="font-semibold text-lg">AI Assistant</h3>
      </div>

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
    </div>
  );
}

