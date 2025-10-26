import { ExportConfig } from "@/app/types";

// Function to get FFmpeg parameters based on settings
export const extractConfigs = (config: ExportConfig) => {
    // Resolution settings
    let scale = "";
    switch (config.resolution) {
        case "480p":
            scale = "scale=854:480";
            break;
        case "720p":
            scale = "scale=1280:720";
            break;
        case "1080p":
            scale = "scale=1920:1080";
            break;
        case "2K":
            scale = "scale=2048:1080";
            break;
        case "4K":
            scale = "scale=3840:2160";
            break;
        default:
            scale = "scale=1920:1080";
    }

    // Quality settings - OPTIMIZED FOR SPEED!
    // FFmpeg WASM is slow, so we prioritize speed over quality
    let crf;
    let videoBitrate;
    let audioBitrate;
    let preset;
    
    switch (config.quality) {
        case "medium":
            // Fastest possible - for quick previews
            crf = 28;
            preset = "ultrafast";
            videoBitrate = "2M";
            audioBitrate = "128k";
            break;
        case "high":
            // Fast with good quality (RECOMMENDED)
            crf = 23;
            preset = "ultrafast";
            videoBitrate = "4M";
            audioBitrate = "192k";
            break;
        case "ultra":
            // Best quality, slower (for final export)
            crf = 18;
            preset = "veryfast";
            videoBitrate = "8M";
            audioBitrate = "256k";
            break;
        default:
            crf = 23;
            preset = "ultrafast";
            videoBitrate = "4M";
            audioBitrate = "192k";
    }

    return {
        scale,
        crf,
        preset,
        videoBitrate,
        audioBitrate
    };
};