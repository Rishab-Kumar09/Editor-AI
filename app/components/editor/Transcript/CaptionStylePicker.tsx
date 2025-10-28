'use client';

import { useState } from 'react';
import { CAPTION_STYLES, CaptionStyle, captionStyleToCSS } from '@/app/lib/ai/captionStyles';

interface CaptionStylePickerProps {
  selectedStyleId?: string;
  onSelectStyle: (styleId: string) => void;
  onApplyCustomSettings?: (settings: {
    y?: number;
    backgroundColor?: string;
    fontSize?: number;
  }) => void;
}

export default function CaptionStylePicker({
  selectedStyleId,
  onSelectStyle,
  onApplyCustomSettings,
}: CaptionStylePickerProps) {
  const [yPosition, setYPosition] = useState(950); // Default bottom position
  const [bgColor, setBgColor] = useState('#000000');
  const [bgOpacity, setBgOpacity] = useState(70);
  const [fontSize, setFontSize] = useState(48);

  const handleApplySettings = () => {
    if (onApplyCustomSettings) {
      const alphaHex = Math.round((bgOpacity / 100) * 255).toString(16).padStart(2, '0');
      onApplyCustomSettings({
        y: yPosition,
        backgroundColor: `${bgColor}${alphaHex}`,
        fontSize: fontSize,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Style Presets */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Choose Caption Style</h3>
        <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2">
          {CAPTION_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => onSelectStyle(style.id)}
              className={`p-4 rounded-lg border-2 transition text-left ${
                selectedStyleId === style.id
                  ? 'border-blue-500 bg-blue-900 bg-opacity-20'
                  : 'border-gray-700 bg-darkSurfacePrimary hover:border-gray-600'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white text-sm">{style.name}</h4>
                  {selectedStyleId === style.id && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">{style.description}</p>
                {/* Preview */}
                <div className="bg-gray-900 rounded p-2 flex items-center justify-center min-h-[50px]">
                  <span
                    style={{
                      ...captionStyleToCSS(style),
                      fontSize: `${style.fontSize / 3}px`, // Scaled down for preview
                      WebkitTextStroke: style.strokeWidth
                        ? `${style.strokeWidth / 3}px ${style.strokeColor}`
                        : undefined,
                    }}
                  >
                    Sample
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Manual Controls */}
      <div className="border-t border-gray-700 pt-4">
        <h3 className="text-lg font-semibold text-white mb-3">Fine-tune Settings</h3>
        <div className="space-y-4">
          {/* Y Position */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Vertical Position: {yPosition <= 150 ? 'Top' : yPosition >= 900 ? 'Bottom' : 'Center'}
            </label>
            <input
              type="range"
              min="120"
              max="950"
              step="10"
              value={yPosition}
              onChange={(e) => setYPosition(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Top</span>
              <span>Center</span>
              <span>Bottom</span>
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Font Size: {fontSize}px
            </label>
            <input
              type="range"
              min="24"
              max="96"
              step="4"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          {/* Background Color */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Background Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-16 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="flex-1 px-3 py-2 bg-darkSurfaceSecondary border border-gray-600 rounded text-white text-sm"
                placeholder="#000000"
              />
            </div>
          </div>

          {/* Background Opacity */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Background Opacity: {bgOpacity}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={bgOpacity}
              onChange={(e) => setBgOpacity(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          {/* Apply Button */}
          <button
            onClick={handleApplySettings}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            Apply Custom Settings
          </button>
        </div>
      </div>
    </div>
  );
}

