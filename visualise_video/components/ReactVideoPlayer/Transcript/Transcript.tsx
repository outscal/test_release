import React, { useMemo } from 'react';
import TranscriptContainer from './TranscriptContainer';
import { Word } from './TranscriptWord';
import { Sentence } from './TranscriptLine';

interface TranscriptProps {
    words: Word[];
    currentTime: number;
    isFullScreen: boolean;
}

const Transcript: React.FC<TranscriptProps> = ({ words, currentTime, isFullScreen }) => {
    const sentences: Sentence[] = useMemo(() => {
        const result: Sentence[] = [];
        let currentSentence: Word[] = [];
        const WORDS_PER_SENTENCE = isFullScreen ? 12 : 10;
        words.forEach((word) => {
            currentSentence.push(word);

            if (currentSentence.length === WORDS_PER_SENTENCE) {
                result.push({
                    words: currentSentence,
                    start_ms: currentSentence[0].start_ms,
                    end_ms: currentSentence[currentSentence.length - 1].end_ms,
                });
                currentSentence = [];
            }
        });

        // Push the last sentence if it exists and was not added
        if (currentSentence.length > 0) {
            result.push({
                words: currentSentence,
                start_ms: currentSentence[0].start_ms,
                end_ms: currentSentence[currentSentence.length - 1].end_ms,
            });
        }

        return result;
    }, [words, isFullScreen]);

    const currentSentenceIndex = sentences.findIndex(
        (s) => currentTime >= s.start_ms && currentTime < s.end_ms + 200
    );

    return (
        <div
            style={{
                '--transcript-text-color': '#ffffff',
                '--transcript-highlight-color': '#ffffff33',
            } as React.CSSProperties}
            className={`w-full`}
        >
            <TranscriptContainer

                sentences={sentences}
                currentTime={currentTime}
                currentSentenceIndex={currentSentenceIndex}
            />
        </div>
    );
};

export default Transcript;
