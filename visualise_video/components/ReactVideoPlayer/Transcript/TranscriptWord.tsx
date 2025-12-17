import React from 'react';


export interface Word {
    word: string;
    start_ms: number;
    end_ms: number;
}

interface TranscriptWordProps {
    word: Word;
    currentTime: number;
}

const TranscriptWord: React.FC<TranscriptWordProps> = ({ word, currentTime }) => {
    const isCurrent = currentTime >= word.start_ms && currentTime < word.end_ms;
    const isPast = currentTime >= word.end_ms;

    const className = `transition-colors duration-150 ${isCurrent
        ? 'text-[var(--transcript-text-color)] rounded-md'
        : isPast
            ? 'text-[var(--transcript-text-color)]'
            : 'text-gray-500'
        }`;

    const style = isCurrent ? { backgroundColor: 'var(--transcript-highlight-color)' } : undefined;

    return (
        <span className={className} style={style}>
            {word.word}
        </span>
    );
};

export default TranscriptWord;
