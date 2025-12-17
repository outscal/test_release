import React, { useEffect, useState } from 'react';
import CustomVideoPlayer from '../CustomVideoPlayer/CustomVideoPlayer';

const VideoPageDeploy: React.FC = () => {
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [transcriptUrl, setTranscriptUrl] = useState<string>('');
  const [visualizerUrl, setVisualizerUrl] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const audio = params.get('audio');
    const transcript = params.get('transcript');
    const visualizer = params.get('visualizer');

    if (audio) setAudioUrl(decodeURIComponent(audio));
    if (transcript) setTranscriptUrl(decodeURIComponent(transcript));
    if (visualizer) setVisualizerUrl(decodeURIComponent(visualizer));
  }, []);

  if (!audioUrl || !transcriptUrl || !visualizerUrl) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading video content...
      </div>
    );
  }

  return (
    <div>
      <CustomVideoPlayer
        audioUrl={audioUrl}
        transcriptUrl={transcriptUrl}
        visualizerUrl={visualizerUrl}
      />
    </div>
  );
};

export default VideoPageDeploy;