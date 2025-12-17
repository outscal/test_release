import React, { useState, useRef } from "react";
import CustomVideoPlayer from "../CustomVideoPlayer/CustomVideoPlayer";
import videos, { AssembledVideoData, defaultVideoMode } from "../../src/asset-assembler";

const VideoPage: React.FC = () => {
  const videoKeys = Object.keys(videos);

  const topics = Array.from(new Set(videoKeys.map(key => key.split(':')[0])));
  const [selectedTopic, setSelectedTopic] = useState<string>(topics[0] || "");

  const versionsForTopic = videoKeys.filter(key => key.startsWith(`${selectedTopic}:`));
  const [selectedVideoKey, setSelectedVideoKey] = useState<string>(
    versionsForTopic[versionsForTopic.length - 1] || ""
  );
  const [videoMode, setVideoMode] = useState<"landscape" | "portrait">(
    defaultVideoMode
  );

  const [scenes, setScenes] = useState<
    Array<{ start: number; end: number; duration?: number }>
  >([]);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);

  const playerRef = useRef<any>(null);

  if (videoKeys.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-8 bg-gray-100 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            No Videos Found
          </h1>
          <p className="text-gray-600">
            The asset assembler could not find any matching video, audio, and
            transcript files.
          </p>
          <p className="text-gray-600 mt-2">
            Please ensure your generated assets are in the <code>/Outputs</code>{" "}
            directory and follow the correct naming convention.
          </p>
        </div>
      </div>
    );
  }

  const selectedVideo: AssembledVideoData = videos[selectedVideoKey];
  const { Visualizer, audioUrl, transcript } = selectedVideo;

  const handleSceneSetup = (
    sceneData: Array<{ start: number; end: number; duration?: number }>
  ) => {
    if (sceneData && sceneData.length > 0) {
      setScenes(sceneData);
    }
  };

  const handleSceneChange = (sceneIndex: number) => {
    if (
      sceneIndex !== currentSceneIndex &&
      sceneIndex >= 0 &&
      sceneIndex < scenes.length
    ) {
      setCurrentSceneIndex(sceneIndex);
    }
  };

  const handleSceneSelect = (sceneIndex: number, startTime: number) => {
    if (sceneIndex >= 0 && sceneIndex < scenes.length) {
      setCurrentSceneIndex(sceneIndex);

      if (playerRef.current?.onUserSceneSelect) {
        playerRef.current.onUserSceneSelect(sceneIndex, startTime);
      }
    }
  };

  return (
    <div className="text-black flex flex-col w-full items-center justify-center m-auto overflow-auto h-fit gap-4 p-4">
      <div className="w-full max-w-4xl flex gap-4">
        <div>
          <label
            htmlFor="topic-selector"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select Topic:
          </label>
          <select
            id="topic-selector"
            value={selectedTopic}
            onChange={(e) => {
              const newTopic = e.target.value;
              setSelectedTopic(newTopic);
              const newVersions = videoKeys.filter(key => key.startsWith(`${newTopic}:`));
              setSelectedVideoKey(newVersions[newVersions.length - 1] || "");
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="video-selector"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select Version:
          </label>
          <select
            id="video-selector"
            value={selectedVideoKey}
            onChange={(e) => setSelectedVideoKey(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {versionsForTopic.map((key) => (
              <option key={key} value={key}>
                {key.split(':')[1]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="mode-selector"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Video Mode:
          </label>
          <select
            id="mode-selector"
            value={videoMode}
            onChange={(e) =>
              setVideoMode(e.target.value as "landscape" | "portrait")
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="landscape">Landscape (16:9)</option>
            <option value="portrait">Portrait (9:16)</option>
          </select>
        </div>

        {scenes.length > 0 && (
          <div className="">
            <label
              htmlFor="scene-selector"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Scene:
            </label>
            <select
              id="scene-selector"
              value={currentSceneIndex}
              onChange={(e) => {
                const selectedSceneIndex = parseInt(e.target.value);
                if (
                  selectedSceneIndex >= 0 &&
                  selectedSceneIndex < scenes.length
                ) {
                  handleSceneSelect(
                    selectedSceneIndex,
                    scenes[selectedSceneIndex].start
                  );
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {scenes.map((scene, index) => (
                <option key={index} value={index}>
                  Scene {index + 1}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div
        className={`w-full ${
          videoMode === "portrait" ? "max-w-sm" : "max-w-4xl"
        }`}
      >
        <CustomVideoPlayer
          ref={playerRef}
          audioUrl={audioUrl}
          transcript={transcript}
          Visualizer={Visualizer}
          mode={videoMode}
          scenes={scenes}
          currentSceneIndex={currentSceneIndex}
          onSceneSetup={handleSceneSetup}
          onSceneChange={handleSceneChange}
          sceneDebug={true}
        />
      </div>
    </div>
  );
};

export default VideoPage;
