"use client";

import { getFile, useAppDispatch, useAppSelector } from "../../../../store";
import { setMediaFiles } from "../../../../store/slices/projectSlice";
import { storeFile } from "../../../../store";
import { categorizeFile } from "../../../../utils/utils";
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function AddMedia({ fileId }: { fileId: string }) {
    const { mediaFiles } = useAppSelector((state) => state.projectState);
    const dispatch = useAppDispatch();

    const handleFileChange = async () => {
        const updatedMedia = [...mediaFiles];

        const file = await getFile(fileId);
        const mediaId = crypto.randomUUID();

        if (fileId) {
            const relevantClips = mediaFiles.filter(clip => clip.type === categorizeFile(file.type));
            const lastEnd = relevantClips.length > 0
                ? Math.max(...relevantClips.map(f => f.positionEnd))
                : 0;

            const fileType = categorizeFile(file.type);
            const src = URL.createObjectURL(file);
            
            // Get actual duration for video/audio files
            let actualDuration = 30; // default for images
            
            if (fileType === 'video' || fileType === 'audio') {
                try {
                    actualDuration = await new Promise<number>((resolve) => {
                        const media = document.createElement(fileType) as HTMLVideoElement | HTMLAudioElement;
                        media.preload = 'metadata';
                        media.onloadedmetadata = () => {
                            // Don't revoke the URL - it's still needed for playback
                            resolve(media.duration || 30);
                            media.remove(); // Clean up the temp element
                        };
                        media.onerror = () => {
                            console.error('Error loading media metadata');
                            resolve(30); // fallback
                            media.remove(); // Clean up the temp element
                        };
                        media.src = src;
                    });
                } catch (error) {
                    console.error('Error getting media duration:', error);
                    actualDuration = 30;
                }
            }

            updatedMedia.push({
                id: mediaId,
                fileName: file.name,
                fileId: fileId,
                startTime: 0,
                endTime: actualDuration,
                src: src,
                positionStart: lastEnd,
                positionEnd: lastEnd + actualDuration,
                includeInMerge: true,
                x: 0,
                y: 0,
                width: 1920,
                height: 1080,
                rotation: 0,
                opacity: 100,
                crop: { x: 0, y: 0, width: 1920, height: 1080 },
                playbackSpeed: 1,
                volume: 100,
                type: fileType,
                zIndex: 0,
            });
        }
        dispatch(setMediaFiles(updatedMedia));
        toast.success('Media added successfully.');
    };

    return (
        <div
        >
            <label
                className="cursor-pointer rounded-full bg-white border border-solid border-transparent transition-colors flex flex-col items-center justify-center text-gray-800 hover:bg-[#ccc] dark:hover:bg-[#ccc] font-medium sm:text-base py-2 px-2"
            >
                <Image
                    alt="Add Project"
                    className="Black"
                    height={12}
                    width={12}
                    src="https://www.svgrepo.com/show/513803/add.svg"
                />
                {/* <span className="text-xs">Add Media</span> */}
                <button
                    onClick={handleFileChange}
                >
                </button>
            </label>
        </div>
    );
}
