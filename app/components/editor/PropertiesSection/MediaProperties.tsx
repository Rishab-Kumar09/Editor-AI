"use client";

import { useAppSelector } from '../../../store';
import { setActiveElement, setMediaFiles, setTextElements } from '../../../store/slices/projectSlice';
import { MediaFile } from '../../../types';
import { useAppDispatch } from '../../../store';

export default function MediaProperties() {
    const { mediaFiles, activeElementIndex } = useAppSelector((state) => state.projectState);
    const mediaFile = mediaFiles[activeElementIndex];
    const dispatch = useAppDispatch();
    const onUpdateMedia = (id: string, updates: Partial<MediaFile>) => {
        dispatch(setMediaFiles(mediaFiles.map(media =>
            media.id === id ? { ...media, ...updates } : media
        )));
    };

    if (!mediaFile) return null;

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-8">
                {/* Source Video */}
                <div className="space-y-2">
                    <h4 className="font-semibold">Source Video</h4>
                    <div className="flex items-center space-x-4">
                        <div>
                            <label className="block text-sm">Start (s)</label>
                            <input
                                type="number"
                                readOnly={true}
                                value={mediaFile.startTime}
                                min={0}
                                onChange={(e) => onUpdateMedia(mediaFile.id, {
                                    startTime: Number(e.target.value),
                                    endTime: mediaFile.endTime
                                })}
                                className="w-full p-2 bg-darkSurfacePrimary border border-white border-opacity-10 shadow-md text-white rounded focus:outline-none focus:ring-2 focus:ring-white-500 focus:border-white-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm">End (s)</label>
                            <input
                                type="number"
                                readOnly={true}
                                value={mediaFile.endTime}
                                min={mediaFile.startTime}
                                onChange={(e) => onUpdateMedia(mediaFile.id, {
                                    startTime: mediaFile.startTime,
                                    endTime: Number(e.target.value)
                                })}
                                className="w-full p-2 bg-darkSurfacePrimary border border-white border-opacity-10 shadow-md text-white rounded focus:outline-none focus:ring-2 focus:ring-white-500 focus:border-white-500"
                            />
                        </div>
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
                                readOnly={true}
                                value={mediaFile.positionStart}
                                min={0}
                                onChange={(e) => onUpdateMedia(mediaFile.id, {
                                    positionStart: Number(e.target.value),
                                    positionEnd: Number(e.target.value) + (mediaFile.positionEnd - mediaFile.positionStart)
                                })}
                                className="w-full p-2 bg-darkSurfacePrimary border border-white border-opacity-10 shadow-md text-white rounded focus:outline-none focus:ring-2 focus:ring-white-500 focus:border-white-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm">End (s)</label>
                            <input
                                type="number"
                                readOnly={true}
                                value={mediaFile.positionEnd}
                                min={mediaFile.positionStart}
                                onChange={(e) => onUpdateMedia(mediaFile.id, {
                                    positionEnd: Number(e.target.value)
                                })}
                                className="w-full p-2 bg-darkSurfacePrimary border border-white border-opacity-10 shadow-md text-white rounded focus:outline-none focus:ring-2 focus:ring-white-500 focus:border-white-500"
                            />
                        </div>
                    </div>
                </div>
                {/* Visual Properties */}
                <div className="space-y-6">
                    <h4 className="font-semibold">Visual Properties</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm">X Position</label>
                            <input
                                type="number"
                                step="10"
                                value={mediaFile.x || 0}
                                onChange={(e) => onUpdateMedia(mediaFile.id, { x: Number(e.target.value) })}
                                className="w-full p-2 bg-darkSurfacePrimary border border-white border-opacity-10 shadow-md text-white rounded focus:outline-none focus:ring-2 focus:ring-white-500 focus:border-white-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm">Y Position</label>
                            <input
                                type="number"
                                step="10"
                                value={mediaFile.y || 0}
                                onChange={(e) => onUpdateMedia(mediaFile.id, { y: Number(e.target.value) })}
                                className="w-full p-2 bg-darkSurfacePrimary border border-white border-opacity-10 shadow-md text-white rounded focus:outline-none focus:ring-2 focus:ring-white-500 focus:border-white-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm">Width</label>
                            <input
                                type="number"
                                step="10"
                                value={mediaFile.width || 100}
                                onChange={(e) => onUpdateMedia(mediaFile.id, { width: Number(e.target.value) })}
                                className="w-full p-2 bg-darkSurfacePrimary border border-white border-opacity-10 shadow-md text-white rounded focus:outline-none focus:ring-2 focus:ring-white-500 focus:border-white-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm">Height</label>
                            <input
                                type="number"
                                step="10"
                                value={mediaFile.height || 100}
                                onChange={(e) => onUpdateMedia(mediaFile.id, { height: Number(e.target.value) })}
                                className="w-full p-2 bg-darkSurfacePrimary border border-white border-opacity-10 shadow-md text-white rounded focus:outline-none focus:ring-2 focus:ring-white-500 focus:border-white-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm">Rotation (°)</label>
                            <input
                                type="number"
                                step="1"
                                value={mediaFile.rotation || 0}
                                onChange={(e) => onUpdateMedia(mediaFile.id, { rotation: Number(e.target.value) })}
                                className="w-full p-2 bg-darkSurfacePrimary border border-white border-opacity-10 shadow-md text-white rounded focus:outline-none focus:ring-2 focus:ring-white-500 focus:border-white-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm">Z-Index (Layer)</label>
                            <input
                                type="number"
                                value={mediaFile.zIndex || 0}
                                onChange={(e) => onUpdateMedia(mediaFile.id, { zIndex: Number(e.target.value) })}
                                className="w-full p-2 bg-darkSurfacePrimary border border-white border-opacity-10 shadow-md text-white rounded focus:outline-none focus:ring-2 focus:ring-white-500 focus:border-white-500"
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm mb-2">Opacity: {mediaFile.opacity || 100}%</label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={mediaFile.opacity || 100}
                            onChange={(e) => onUpdateMedia(mediaFile.id, { opacity: Number(e.target.value) })}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>
                </div>
                {/* Delete Button */}
                <div className="space-y-2">
                    <button
                        onClick={() => {
                            if (confirm(`Delete ${mediaFile.fileName}?`)) {
                                dispatch(setMediaFiles(mediaFiles.filter(m => m.id !== mediaFile.id)));
                            }
                        }}
                        className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Element
                    </button>
                    <p className="text-xs text-gray-400 text-center">Or press Delete key</p>
                </div>
            </div>

            {/* Audio Properties */}
            {(mediaFile.type === "video" || mediaFile.type === "audio") && (
                <div className="space-y-2 mt-4">
                    <h4 className="font-semibold">Audio Properties</h4>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm mb-2 text-white">Volume: {mediaFile.volume}%</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="1"
                                value={mediaFile.volume}
                                onChange={(e) => onUpdateMedia(mediaFile.id, { volume: Number(e.target.value) })}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}