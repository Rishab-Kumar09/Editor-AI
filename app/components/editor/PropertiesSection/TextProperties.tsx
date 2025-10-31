"use client";

import { useAppSelector } from '../../../store';
import { setActiveElement, setTextElements } from '../../../store/slices/projectSlice';
import { TextElement } from '../../../types';
import { useAppDispatch } from '../../../store';

export default function TextProperties() {
    const { textElements, activeElementIndex } = useAppSelector((state) => state.projectState);
    const textElement = textElements[activeElementIndex];
    const dispatch = useAppDispatch();

    const onUpdateText = (id: string, updates: Partial<TextElement>) => {
        dispatch(setTextElements(
            textElements
                .filter((t): t is TextElement => t != null && typeof t === 'object' && 'id' in t) // Safety filter
                .map(text => text.id === id ? { ...text, ...updates } : text)
        ));
    };

    const onUpdateAllCaptions = (updates: Partial<TextElement>) => {
        dispatch(setTextElements(
            textElements
                .filter((t): t is TextElement => t != null && typeof t === 'object' && 'id' in t) // Safety filter
                .map(text => ({ ...text, ...updates }))
        ));
    };

    if (!textElement) return null;

    return (
        <div className="space-y-4">
            {/* Bulk Caption Editor */}
            {textElements.length > 1 && (
                <div className="bg-blue-900 bg-opacity-20 border border-blue-500 rounded-lg p-4 space-y-3">
                    <h4 className="font-semibold text-blue-300 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                        Bulk Edit All {textElements.length} Captions
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs mb-1">Font Size</label>
                            <input
                                type="number"
                                step="2"
                                placeholder={textElement.fontSize?.toString() || "48"}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    if (val > 0) onUpdateAllCaptions({ fontSize: val });
                                }}
                                className="w-full p-2 bg-gray-800 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs mb-1">Y Position</label>
                            <input
                                type="number"
                                step="10"
                                placeholder={textElement.y?.toString() || "950"}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    onUpdateAllCaptions({ y: val });
                                }}
                                className="w-full p-2 bg-gray-800 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs mb-1">Text Color</label>
                            <input
                                type="color"
                                defaultValue={textElement.color || "#FFFFFF"}
                                onChange={(e) => onUpdateAllCaptions({ color: e.target.value })}
                                className="w-full h-9 bg-gray-800 border border-gray-600 rounded cursor-pointer"
                            />
                        </div>
                        <div>
                            <label className="block text-xs mb-1">Background</label>
                            <input
                                type="color"
                                defaultValue={textElement.backgroundColor || "#000000"}
                                onChange={(e) => onUpdateAllCaptions({ backgroundColor: e.target.value })}
                                className="w-full h-9 bg-gray-800 border border-gray-600 rounded cursor-pointer"
                            />
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            if (confirm('Reset all captions to default style?')) {
                                onUpdateAllCaptions({
                                    fontSize: 48,
                                    y: 950,
                                    color: '#FFFFFF',
                                    backgroundColor: 'rgba(0,0,0,0.7)'
                                });
                            }
                        }}
                        className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
                    >
                        Reset All to Defaults
                    </button>
                </div>
            )}

            <div className="grid grid-cols-2 gap-8">
                {/* Text Content */}
                <div className="space-y-2">
                    <h4 className="font-semibold">Text Content</h4>
                    <div>
                        <textarea
                            value={textElement.text}
                            onChange={(e) => onUpdateText(textElement.id, { text: e.target.value })}
                            className="w-full p-2 bg-darkSurfacePrimary border border-white border-opacity-10 shadow-md text-white rounded focus:outline-none focus:ring-2 focus:ring-white-500 focus:border-white-500"
                            rows={3}
                        />
                    </div>
                </div>
                {/* Timing Position */}
                <div className="space-y-2">
                    <h4 className="font-semibold">Timing Position</h4>
                    <div className="flex items-center space-x-4">
                        <div>
                            <label className="block text-sm">Start (s)</label>
                            <input
                                type="number"
                                value={textElement.positionStart}
                                min={0}
                                readOnly={true}
                                onChange={(e) => onUpdateText(textElement.id, {
                                    positionStart: Number(e.target.value),
                                    positionEnd: Number(e.target.value) + (textElement.positionEnd - textElement.positionStart)
                                })}
                                className="w-full p-2 bg-darkSurfacePrimary border border-white border-opacity-10 shadow-md text-white rounded focus:outline-none focus:ring-2 focus:ring-white-500 focus:border-white-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm">End (s)</label>
                            <input
                                type="number"
                                readOnly={true}
                                value={textElement.positionEnd}
                                min={textElement.positionStart}
                                onChange={(e) => onUpdateText(textElement.id, {
                                    positionEnd: Number(e.target.value)
                                })}
                                className="w-full p-2 bg-darkSurfacePrimary border border-white border-opacity-10 shadow-md text-white rounded focus:outline-none focus:ring-2 focus:ring-white-500 focus:border-white-500"
                            />
                        </div>
                    </div>
                </div>
                {/* Visual Properties */}
                <div className="space-y-2">
                    <h4 className="font-semibold">Visual Properties</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm">X Position</label>
                            <input
                                type="number"
                                step="10"
                                value={textElement.x || 0}
                                onChange={(e) => onUpdateText(textElement.id, { x: Number(e.target.value) })}
                                className="w-full p-2 bg-darkSurfacePrimary border border-white border-opacity-10 shadow-md text-white rounded focus:outline-none focus:ring-2 focus:ring-white-500 focus:border-white-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm">Y Position</label>
                            <input
                                type="number"
                                step="10"
                                value={textElement.y || 0}
                                onChange={(e) => onUpdateText(textElement.id, { y: Number(e.target.value) })}
                                className="w-full p-2 bg-darkSurfacePrimary border border-white border-opacity-10 shadow-md text-white rounded focus:outline-none focus:ring-2 focus:ring-white-500 focus:border-white-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm">Font Size</label>
                            <input
                                type="number"
                                step="5"
                                value={textElement.fontSize || 24}
                                onChange={(e) => onUpdateText(textElement.id, { fontSize: Number(e.target.value) })}
                                className="w-full p-2 bg-darkSurfacePrimary border border-white border-opacity-10 shadow-md text-white rounded focus:outline-none focus:ring-2 focus:ring-white-500 focus:border-white-500"
                            />
                        </div>
                        {/* TODO: add z-index */}
                        {/* <div>
                            <label className="block text-sm">Z-Index</label>
                            <input
                                type="number"
                                value={textElement.zIndex || 0}
                                onChange={(e) => onUpdateText(textElement.id, { zIndex: Number(e.target.value) })}
                                className="w-full p-2 bg-darkSurfacePrimary border border-white border-opacity-10 shadow-md text-white rounded focus:outline-none focus:ring-2 focus:ring-white-500 focus:border-white-500"
                            />
                        </div> */}
                        {/* Font Type */}
                        <div >
                            <label className="block text-sm font-medium text-white">Font Type</label>
                            <select
                                value={textElement.font}
                                onChange={(e) => onUpdateText(textElement.id, { font: e.target.value })}
                                className="w-full p-2 bg-darkSurfacePrimary border border-white border-opacity-10 shadow-md text-white rounded focus:outline-none focus:ring-2 focus:ring-white-500 focus:border-white-500"
                            >
                                <option value="Arial">Arial</option>
                                <option value="Inter">Inter</option>
                                <option value="Lato">Lato</option>
                            </select>
                        </div>
                    </div>
                </div>
                {/* Style Properties */}
                <div className="space-y-2">
                    <h4 className="font-semibold">Style Properties</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm">Text Color</label>
                            <input
                                type="color"
                                value={textElement.color || '#ffffff'}
                                onChange={(e) => onUpdateText(textElement.id, { color: e.target.value })}
                                className="w-full h-10 bg-darkSurfacePrimary border border-white border-opacity-10 shadow-md rounded focus:outline-none focus:ring-2 focus:ring-white-500 focus:border-white-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm">Opacity</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="1"
                                value={textElement.opacity}
                                onChange={(e) => onUpdateText(textElement.id, { opacity: Number(e.target.value) })}
                                className="w-full bg-darkSurfacePrimary border border-white border-opacity-10 shadow-md text-white rounded focus:outline-none focus:border-white-500"
                            />
                        </div>
                    </div>
                </div>
                <div >
                </div>
            </div>
        </div >
    );
}