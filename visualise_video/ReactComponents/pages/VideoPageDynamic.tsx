import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CustomVideoPlayer from '../CustomVideoPlayer/CustomVideoPlayer';
import videos, { defaultVideoMode } from '../../src/asset-assembler';

const VideoPageDynamic: React.FC = () => {
  const { version, mode } = useParams<{ version: string; mode?: string }>();
  const navigate = useNavigate();

  // Parse mode parameter (p = portrait, l = landscape), fall back to manifest default
  const videoMode = mode === 'p' ? 'portrait' : mode === 'l' ? 'landscape' : defaultVideoMode;

  // Construct the video key from URL parameters (just version number)
  const videoKey = `v${version}`;
  const selectedVideo = videos[videoKey];


  useEffect(() => {

  const refreshBtn = document.getElementById('vite-refresh-button');
  if (refreshBtn) {
    refreshBtn.remove();
  }
  }, []);

  // If video not found, show error
  if (!selectedVideo) {
    const availableVideos = Object.keys(videos);
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center p-8 bg-gray-800 rounded-lg shadow-lg max-w-2xl">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Video Not Found</h1>
          <p className="text-gray-300 mb-2">
            Could not find video: <code className="bg-gray-700 px-2 py-1 rounded">{videoKey}</code>
          </p>
          <p className="text-gray-400 mb-4">
            URL pattern: <code className="bg-gray-700 px-2 py-1 rounded">/version</code>
          </p>

          {availableVideos.length > 0 ? (
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-200 mb-3">Available Videos:</h2>
              <div className="max-h-64 overflow-y-auto">
                <ul className="text-left space-y-2">
                  {availableVideos.map((key) => {
                    // Parse the key to create a URL (key is just vN)
                    const match = key.match(/v(\d+(?:\.\d+)?)/);
                    if (match) {
                      const [, v] = match;
                      const url = `/${v}`;
                      return (
                        <li key={key}>
                          <button
                            onClick={() => navigate(url)}
                            className="text-blue-400 hover:text-blue-300 underline text-sm font-mono"
                          >
                            {url}
                          </button>
                          <span className="text-gray-500 ml-2">({key})</span>
                        </li>
                      );
                    }
                    return null;
                  })}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 mt-4">No videos available in the system.</p>
          )}

          <button
            onClick={() => navigate('/')}
            className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            Go to Home Page
          </button>
        </div>
      </div>
    );
  }

  const { Visualizer, audioUrl, transcript } = selectedVideo;

  return (
    <div className='text-black flex flex-col w-full items-center justify-center m-auto overflow-auto h-screen bg-gray-900'>
      <div id="video-player-recording" className="w-[600px] h-full flex items-center justify-center">
        <CustomVideoPlayer
          audioUrl={audioUrl}
          transcript={transcript}
          Visualizer={Visualizer}
          mode={videoMode}
        />
      </div>
    </div>
  );
};

export default VideoPageDynamic;
