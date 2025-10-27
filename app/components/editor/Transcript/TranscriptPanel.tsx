'use client';

import { useState } from 'react';
import { Download, Edit2, Copy, FileText } from 'lucide-react';

interface Word {
  word: string;
  start: number;
  end: number;
}

interface Segment {
  text: string;
  start: number;
  end: number;
}

interface TranscriptPanelProps {
  transcript: {
    text: string;
    words?: Word[];
    segments?: Segment[];
    language?: string;
  };
  onEdit?: (newText: string) => void;
  onDownload?: (format: 'txt' | 'srt') => void;
}

export default function TranscriptPanel({
  transcript,
  onEdit,
  onDownload,
}: TranscriptPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(transcript.text);

  const handleSave = () => {
    if (onEdit) {
      onEdit(editedText);
    }
    setIsEditing(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript.text);
    alert('Transcript copied to clipboard!');
  };

  const downloadAsTxt = () => {
    const blob = new Blob([transcript.text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcript.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAsSRT = () => {
    if (!transcript.segments || transcript.segments.length === 0) {
      alert('No segments available for SRT export');
      return;
    }

    let srtContent = '';
    transcript.segments.forEach((segment, index) => {
      const startTime = formatSRTTime(segment.start);
      const endTime = formatSRTTime(segment.end);
      srtContent += `${index + 1}\n${startTime} --> ${endTime}\n${segment.text}\n\n`;
    });

    const blob = new Blob([srtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'captions.srt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatSRTTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-darkSurfaceSecondary rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Transcript</h3>
          {transcript.language && (
            <span className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded">
              {transcript.language.toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-gray-700 rounded-lg transition"
            title="Copy transcript"
          >
            <Copy className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 hover:bg-gray-700 rounded-lg transition"
            title="Edit transcript"
          >
            <Edit2 className="w-4 h-4 text-gray-400" />
          </button>
          <div className="relative group">
            <button
              className="p-2 hover:bg-gray-700 rounded-lg transition"
              title="Download transcript"
            >
              <Download className="w-4 h-4 text-gray-400" />
            </button>
            <div className="absolute right-0 mt-2 w-32 bg-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition z-10">
              <button
                onClick={downloadAsTxt}
                className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700 rounded-t-lg"
              >
                As .TXT
              </button>
              <button
                onClick={downloadAsSRT}
                className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700 rounded-b-lg"
              >
                As .SRT
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-grow overflow-y-auto">
        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full h-64 bg-darkSurfacePrimary text-white p-4 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setEditedText(transcript.text);
                  setIsEditing(false);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Full text */}
            <div className="bg-darkSurfacePrimary rounded-lg p-4">
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {transcript.text}
              </p>
            </div>

            {/* Timestamped segments */}
            {transcript.segments && transcript.segments.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-400 uppercase">
                  Timestamped Segments
                </h4>
                {transcript.segments.map((segment, index) => (
                  <div
                    key={index}
                    className="bg-darkSurfacePrimary rounded-lg p-3 hover:bg-gray-800 transition cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xs text-blue-400 font-mono min-w-[60px]">
                        {formatTimestamp(segment.start)}
                      </span>
                      <p className="text-sm text-gray-300">{segment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

