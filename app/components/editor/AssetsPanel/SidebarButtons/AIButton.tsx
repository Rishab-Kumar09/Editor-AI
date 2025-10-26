import { Sparkles } from 'lucide-react';

interface AIButtonProps {
    onClick: () => void;
}

const AIButton: React.FC<AIButtonProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="relative flex flex-col items-center justify-center p-3 hover:bg-white hover:bg-opacity-10 rounded-lg transition group"
            title="AI Assistant"
        >
            <div className="relative">
                <Sparkles size={24} className="text-blue-400 group-hover:text-blue-300" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            </div>
            <span className="text-xs mt-1 text-gray-400 group-hover:text-white">AI</span>
        </button>
    );
};

export default AIButton;

