import React, { useEffect, useRef } from 'react';
import { Word } from '../../../types';
import TranscriptLine from './TranscriptLine';

interface Sentence {
    words: Word[];
    start_ms: number;
    end_ms: number;
}

interface TranscriptContainerProps {
    sentences: Sentence[];
    currentTime: number;
    currentSentenceIndex: number;
}

const TranscriptContainer: React.FC<TranscriptContainerProps> = ({
    sentences,
    currentTime,
    currentSentenceIndex,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sentenceRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const el = sentenceRefs.current[currentSentenceIndex];
        if (el && containerRef.current) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [currentSentenceIndex]);

    return (
        <div
            ref={containerRef}
            className="sm:h-8 h-4 overflow-hidden text-center "
        >
            <div className="flex flex-col gap-1 items-center">
                {sentences.map((sentence, index) => (
                    <TranscriptLine
                        key={index}
                        ref={(el) => {
                            if (el) {
                                sentenceRefs.current[index] = el;
                            }
                        }}
                        sentence={sentence}
                        currentTime={currentTime}
                        isActive={index === currentSentenceIndex}
                    />
                ))}
            </div>
        </div>
    );
};

export default TranscriptContainer;
