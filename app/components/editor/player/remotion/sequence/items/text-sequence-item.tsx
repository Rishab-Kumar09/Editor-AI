import { TextElement } from "@/app/types";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { setTextElements } from "@/app/store/slices/projectSlice";
import { Sequence } from "remotion";

const REMOTION_SAFE_FRAME = 0;

interface SequenceItemOptions {
    handleTextChange?: (id: string, text: string) => void;
    fps: number;
    editableTextId?: string | null;
    currentTime?: number;
}

const calculateFrames = (
    display: { from: number; to: number },
    fps: number
) => {
    const from = display.from * fps;
    const to = display.to * fps;
    const durationInFrames = Math.max(1, to - from);
    return { from, durationInFrames };
};

export const TextSequenceItem: React.FC<{ item: TextElement; options: SequenceItemOptions }> = ({ item, options }) => {
    const { handleTextChange, fps, editableTextId } = options;
    const dispatch = useAppDispatch();
    const { textElements, resolution } = useAppSelector((state) => state.projectState);

    // Safety check: return null if item is invalid (AFTER hooks!)
    if (!item || !item.id) {
        console.warn('TextSequenceItem: Invalid item', item);
        return null;
    }

    const { from, durationInFrames } = calculateFrames(
        {
            from: item.positionStart,
            to: item.positionEnd
        },
        fps
    );

    const onUpdateText = (id: string, updates: Partial<TextElement>) => {
        dispatch(setTextElements(textElements.map(text =>
            text.id === id ? { ...text, ...updates } : text
        )));
    };

    // TODO: Extract this logic to be reusable for other draggable items
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        const startX = e.clientX;
        const startY = e.clientY;

        // TODO: This needs a more reliable way to get the scaled container
        const container = document.querySelector('.__remotion-player') as HTMLElement; 
        const rect = container.getBoundingClientRect();
        const scaleX = rect.width / container.offsetWidth;
        const scaleY = rect.height / container.offsetHeight;

        const handleMouseMove = (e: MouseEvent) => {
            const diffX = e.clientX - startX;
            const diffY = e.clientY - startY;
            onUpdateText(item.id, { x: item.x + diffX / scaleX, y: item.y + diffY / scaleY});
            
            // handleTextChange fonksiyonu varsa pozisyon güncellemesini bildir
            if (handleTextChange) {
                // Burada pozisyon değişikliğini parent component'e bildirebiliriz
                // handleTextChange(item.id, `position:${newX},${newY}`);
            }
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    // TODO: add more options for text
    return (
        <Sequence
            className={`designcombo-scene-item id-${item.id} designcombo-scene-item-type-text `}
            key={item.id}
            from={from}
            durationInFrames={durationInFrames + REMOTION_SAFE_FRAME}
            data-track-item="transition-element"
            style={{
                position: "absolute",
                width: "fit-content",
                maxWidth: "90%", // Don't let captions stretch too wide
                height: "auto",
                fontSize: item.fontSize || "16px",
                top: item.y,
                left: "50%",
                transform: "translateX(-50%)", // Center horizontally
                color: item.color || "#000000",
                zIndex: 1000,
                opacity: item.opacity! / 100,
                fontFamily: item.font || "Arial",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <div
                data-text-id={item.id}
                style={{
                    boxShadow: "none",
                    outline: "none",
                    whiteSpace: "nowrap", // Keep text on one line (or change to "normal" for multi-line)
                    backgroundColor: item.backgroundColor || "transparent",
                    padding: item.backgroundColor ? "8px 16px" : "0", // Add padding if background exists
                    borderRadius: item.backgroundColor ? "8px" : "0",
                    cursor:"move",
                    display: "inline-block",
                }}
                onMouseDown={handleMouseDown}
                // onMouseMove={handleMouseMove}
                // onMouseUp={handleMouseUp}
                dangerouslySetInnerHTML={{ __html: item.text }}
                className="designcombo_textLayer"
            />
        </Sequence>
    );
};