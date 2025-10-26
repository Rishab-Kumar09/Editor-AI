'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Key, Save, ArrowLeft } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Load existing API key (masked)
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        if (data.apiKey) {
          // Show masked version
          setApiKey('•'.repeat(20) + data.apiKey.slice(-4));
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSave = async () => {
    if (!apiKey || apiKey.length < 20) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
      return;
    }

    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey })
      });

      if (response.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-darkSurfacePrimary">
      {/* Header */}
      <header className="h-16 border-b border-white border-opacity-10 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="p-2 hover:bg-white hover:bg-opacity-5 rounded transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Settings size={24} />
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* API Key Section */}
          <div className="bg-white bg-opacity-5 rounded-lg p-6 border border-white border-opacity-10">
            <div className="flex items-center gap-2 mb-4">
              <Key size={20} />
              <h2 className="text-xl font-semibold">OpenAI API Key</h2>
            </div>
            
            <p className="text-sm text-gray-400 mb-4">
              Your API key is required for AI features like chat-based editing and transcription.
              Get your key from{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                OpenAI Platform
              </a>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-4 py-3 bg-black bg-opacity-30 border border-white border-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition font-semibold"
                >
                  <Save size={18} />
                  {isSaving ? 'Saving...' : 'Save API Key'}
                </button>

                {saveStatus === 'success' && (
                  <span className="text-green-400 text-sm font-medium">
                    ✓ Saved successfully!
                  </span>
                )}
                {saveStatus === 'error' && (
                  <span className="text-red-400 text-sm font-medium">
                    ✗ Invalid API key
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-yellow-900 bg-opacity-20 border border-yellow-600 border-opacity-30 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-200 mb-2">🔐 Privacy & Security</h3>
            <ul className="text-sm text-yellow-100 space-y-1">
              <li>• Your API key is stored locally on your computer</li>
              <li>• It's encrypted and never sent to our servers</li>
              <li>• Only you have access to your key</li>
              <li>• API calls go directly to OpenAI</li>
            </ul>
          </div>

          {/* Usage Information */}
          <div className="bg-white bg-opacity-5 rounded-lg p-6 border border-white border-opacity-10">
            <h3 className="font-semibold mb-3">💡 How AI Features Work</h3>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>• <strong>Chat Commands:</strong> Use GPT-4o to control the editor with natural language</li>
              <li>• <strong>Transcription:</strong> Whisper API converts speech to text with timestamps</li>
              <li>• <strong>Auto-Sync:</strong> AI matches your media to narration automatically</li>
              <li>• <strong>Style Learning:</strong> Analyze reference videos to mimic their editing style</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

