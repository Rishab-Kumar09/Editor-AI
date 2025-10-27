'use client';

import { CAPTION_STYLES, CaptionStyle, captionStyleToCSS } from '@/app/lib/ai/captionStyles';

interface CaptionStylePickerProps {
  selectedStyleId?: string;
  onSelectStyle: (styleId: string) => void;
}

export default function CaptionStylePicker({
  selectedStyleId,
  onSelectStyle,
}: CaptionStylePickerProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Choose Caption Style</h3>
      <div className="grid grid-cols-1 gap-3">
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
                <h4 className="font-semibold text-white">{style.name}</h4>
                {selectedStyleId === style.id && (
                  <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                    Selected
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400">{style.description}</p>
              {/* Preview */}
              <div className="bg-gray-900 rounded p-3 flex items-center justify-center min-h-[60px]">
                <span
                  style={{
                    ...captionStyleToCSS(style),
                    fontSize: `${style.fontSize / 2}px`, // Scaled down for preview
                    WebkitTextStroke: style.strokeWidth
                      ? `${style.strokeWidth / 2}px ${style.strokeColor}`
                      : undefined,
                  }}
                >
                  Sample Text
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

