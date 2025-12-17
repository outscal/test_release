import React, { useMemo } from 'react';
import { Word } from './ReactVideoPlayer/Transcript/TranscriptWord';
import { Sentence } from './ReactVideoPlayer/Transcript/TranscriptLine';

interface TranscriptProps {
  words: Word[];
  currentTime: number;
}

const Transcript: React.FC<TranscriptProps> = ({ words, currentTime }) => {
  const sentences = useMemo(() => {
    const result: Sentence[] = [];
    let currentSentence: Word[] = [];

    words.forEach((word) => {
      currentSentence.push(word);
      if (/[.?!]/.test(word.word) && currentSentence.length > 0) {
        result.push({
          words: currentSentence,
          start_ms: currentSentence[0].start_ms,
          end_ms: currentSentence[currentSentence.length - 1].end_ms,
        });
        currentSentence = [];
      }
    });

    if (currentSentence.length > 0) {
      result.push({
        words: currentSentence,
        start_ms: currentSentence[0].start_ms,
        end_ms: currentSentence[currentSentence.length - 1].end_ms,
      });
    }

    return result;
  }, [words]);

  const currentSentence = sentences.find(s => currentTime >= s.start_ms && currentTime < s.end_ms + 200);

  const wordSpans = currentSentence?.words.map((word, index) => (
    <span
      key={`${index}-${word.start_ms}`}
      className={`transition-colors duration-150 ${currentTime >= word.start_ms && currentTime < word.end_ms
        ? 'text-cyan-300'
        : ''
        }`}
    >
      {word.word}
    </span>
  ));

  const spacedElements = wordSpans?.reduce((acc, curr, index) => {
    if (index === 0) return [curr];
    const prevWord = currentSentence?.words[index - 1];
    const currentWord = currentSentence?.words[index];

    if (currentWord && prevWord && !/^[.,'?!]/.test(currentWord.word) && prevWord.word !== "'") {
      return [...acc, ' ', curr];
    }
    return [...acc, curr];
  }, [] as React.ReactNode[]);


  return (
    <div className="min-h-[3.5rem] flex items-center justify-center text-center px-4">
      <p className="text-xl text-gray-400 transition-opacity duration-300 max-w-3xl truncate">
        {spacedElements || <span>&nbsp;</span>}
      </p>
    </div>
  );
};

export default Transcript;
