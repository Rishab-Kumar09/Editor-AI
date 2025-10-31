'use client';

import { useState } from 'react';

interface ImageSettingsPickerProps {
  onApplySettings: (settings: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    opacity?: number;
  }) => void;
}

export default function ImageSettingsPicker({
  onApplySettings,
}: ImageSettingsPickerProps) {
  const [x, setX] = useState(0); // Start from top-left for full coverage
  const [y, setY] = useState(0); // Start from top-left for full coverage
  const [width, setWidth] = useState(1920); // Default to full width
  const [height, setHeight] = useState(1080); // Default to full height
  const [opacity, setOpacity] = useState(100);

  const handleApplySettings = () => {
    onApplySettings({
      x,
      y,
      width,
      height,
      opacity,
    });
  };

  return (
    <div className="space-y-6">
      {/* Position Controls */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Position</h3>
        <div className="space-y-4">
          {/* X Position */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Horizontal Position: {x}px {x === 0 && '(Full Left)'}
            </label>
            <input
              type="range"
              min="0"
              max="1920"
              step="1"
              value={x}
              onChange={(e) => setX(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Left (0)</span>
              <span>Center (960)</span>
              <span>Right (1920)</span>
            </div>
          </div>

          {/* Y Position */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Vertical Position: {y}px {y === 0 && '(Full Top)'}
            </label>
            <input
              type="range"
              min="0"
              max="1080"
              step="1"
              value={y}
              onChange={(e) => setY(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Top (0)</span>
              <span>Center (540)</span>
              <span>Bottom (1080)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Size Controls */}
      <div className="border-t border-gray-700 pt-4">
        <h3 className="text-lg font-semibold text-white mb-3">Size</h3>
        <div className="space-y-4">
          {/* Width */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Width: {width}px {width === 1920 && '✓ Full Width'}
            </label>
            <input
              type="range"
              min="100"
              max="1920"
              step="1"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          {/* Height */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Height: {height}px {height === 1080 && '✓ Full Height'}
            </label>
            <input
              type="range"
              min="100"
              max="1080"
              step="1"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          {/* Quick Size Presets */}
          <div className="flex gap-2">
            <button
              onClick={() => { setWidth(400); setHeight(300); setX(760); setY(390); }}
              className="flex-1 px-3 py-2 bg-darkSurfaceSecondary hover:bg-gray-700 rounded text-sm transition"
            >
              Small
            </button>
            <button
              onClick={() => { setWidth(600); setHeight(400); setX(660); setY(340); }}
              className="flex-1 px-3 py-2 bg-darkSurfaceSecondary hover:bg-gray-700 rounded text-sm transition"
            >
              Medium
            </button>
            <button
              onClick={() => { setWidth(960); setHeight(540); setX(480); setY(270); }}
              className="flex-1 px-3 py-2 bg-darkSurfaceSecondary hover:bg-gray-700 rounded text-sm transition"
            >
              Half Screen
            </button>
            <button
              onClick={() => { setWidth(1920); setHeight(1080); setX(0); setY(0); }}
              className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm transition font-semibold"
            >
              Full Screen ✓
            </button>
          </div>
        </div>
      </div>

      {/* Opacity Control */}
      <div className="border-t border-gray-700 pt-4">
        <h3 className="text-lg font-semibold text-white mb-3">Opacity</h3>
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Opacity: {opacity}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Transparent (0%)</span>
            <span>Opaque (100%)</span>
          </div>
        </div>
      </div>

      {/* Apply Button */}
      <button
        onClick={handleApplySettings}
        className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
      >
        Apply to All Images
      </button>

      {/* Info */}
      <div className="text-xs text-gray-500 border border-gray-700 rounded p-3">
        💡 <strong>Tip:</strong> These settings apply to ALL images in your timeline.
        <br />
        <strong>Full Screen Coverage:</strong> Set Width=1920px, Height=1080px, X=0, Y=0 (or click &quot;Full Screen ✓&quot; button)
      </div>
    </div>
  );
}

