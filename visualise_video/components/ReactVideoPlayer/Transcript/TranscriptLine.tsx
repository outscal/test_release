import React from 'react';
import { Word } from '../../../types';
import TranscriptWord from './TranscriptWord';


export interface Sentence {
    words: Word[];
    start_ms: number;
    end_ms: number;
}

interface TranscriptLineProps {
    sentence: Sentence;
    currentTime: number;
    isActive: boolean;
}

const TranscriptLine = React.forwardRef<HTMLDivElement, TranscriptLineProps>(
    ({ sentence, currentTime, isActive }, ref) => {
        const spacedElements = sentence.words.reduce<React.ReactNode[]>((acc, word, index) => {
            const wordNode = <TranscriptWord key={`${index}-${word.start_ms}`} word={word} currentTime={currentTime} />;

            if (index === 0) return [wordNode];

            const prevWord = sentence.words[index - 1];
            const needsSpace =
                !/^[.,'?!]/.test(word.word) && prevWord?.word !== "'";

            return [...acc, needsSpace ? ' ' : null, wordNode];
        }, []);

        return (
            <div
                ref={ref}
                className={`transition-opacity opacity-100 duration-300 px-2 ${isActive
                    ? 'text-[12px] sm:text-[18px]'
                    : 'opacity-70 text-[8px] sm:text-[11px] '
                    }`}
            >
                {spacedElements}
            </div>
        );
    }
);

export default TranscriptLine;
