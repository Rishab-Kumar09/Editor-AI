'use client'

import { useRef, useEffect, useState } from 'react';
import { PreviewPlayer } from './remotion/Player';
import Moveable from 'react-moveable';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { setMediaFiles } from '@/app/store/slices/projectSlice';
import { MediaFile } from '@/app/types';

/**
 * Interactive Preview with KineMaster-style controls
 * - Select images from timeline
 * - Drag to reposition in preview
 * - Resize with corner handles
 * - Rotate with handle
 * - Real-time visual feedback
 */
export default function InteractivePreview() {
  const dispatch = useAppDispatch();
  const { mediaFiles, activeElement, activeElementIndex, currentTime } = useAppSelector(
    (state) => state.projectState
  );
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedImageRef, setSelectedImageRef] = useState<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 1920, height: 1080 });

  // Get currently selected image at current time
  const selectedImage = activeElement === 'media' 
    ? mediaFiles.find((m, i) => 
        i === activeElementIndex && 
        m.type === 'image' && 
        currentTime >= m.positionStart && 
        currentTime <= m.positionEnd
      )
    : null;

  // Update container size for proper scaling
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateSize = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Scale factor from composition (1920x1080) to actual display size
  const scaleX = containerSize.width / 1920;
  const scaleY = containerSize.height / 1080;

  const handleImageUpdate = (id: string, updates: Partial<MediaFile>) => {
    dispatch(setMediaFiles(
      mediaFiles.map((m) => (m.id === id ? { ...m, ...updates } : m))
    ));
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black">
      {/* Remotion Player (non-interactive) */}
      <PreviewPlayer />

      {/* Interactive Overlay for selected image */}
      {selectedImage && (
        <>
          {/* Invisible target div for Moveable to track */}
          <div
            ref={setSelectedImageRef}
            className="absolute pointer-events-none"
            style={{
              left: (selectedImage.x || 0) * scaleX,
              top: (selectedImage.y || 0) * scaleY,
              width: (selectedImage.width || 1920) * scaleX,
              height: (selectedImage.height || 1080) * scaleY,
              transform: `rotate(${selectedImage.rotation || 0}deg)`,
              transformOrigin: 'center center',
              border: '2px solid #3b82f6',
              zIndex: 9999,
            }}
          >
            <div className="absolute top-0 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded">
              {selectedImage.fileName}
            </div>
          </div>

          {/* Moveable Controls */}
          {selectedImageRef && (
            <Moveable
              target={selectedImageRef}
              draggable={true}
              resizable={true}
              rotatable={true}
              keepRatio={false}
              throttleDrag={0}
              throttleResize={0}
              throttleRotate={0}
              origin={false}
              renderDirections={['nw', 'ne', 'sw', 'se', 'n', 'e', 's', 'w']}
              onDrag={(e) => {
                e.target.style.transform = e.transform;
                const newX = e.left / scaleX;
                const newY = e.top / scaleY;
                handleImageUpdate(selectedImage.id, { x: newX, y: newY });
              }}
              onResize={(e) => {
                e.target.style.width = `${e.width}px`;
                e.target.style.height = `${e.height}px`;
                e.target.style.transform = e.drag.transform;
                
                const newWidth = e.width / scaleX;
                const newHeight = e.height / scaleY;
                const newX = e.drag.left / scaleX;
                const newY = e.drag.top / scaleY;
                
                handleImageUpdate(selectedImage.id, {
                  width: newWidth,
                  height: newHeight,
                  x: newX,
                  y: newY,
                });
              }}
              onRotate={(e) => {
                e.target.style.transform = e.drag.transform;
                const rotation = e.rotate;
                handleImageUpdate(selectedImage.id, { rotation });
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

