"use client";

import React from "react";
import { cn } from "../../lib/utils";
import { motion } from "framer-motion";

interface VisualizerProps {
  currentTime: number;
  onScenesSetUp?: (
    sceneData: Array<{ start: number; end: number; duration?: number }>
  ) => void;
  onSceneChange?: (sceneIndex: number) => void;
}

interface VisualizerLayerProps {
  Visualizer: React.ComponentType<VisualizerProps>;
  currentTime: number;
  scale: number;
  isFullscreen: boolean;
  baseWidth: number;
  baseHeight: number;
  captionsEnabled: boolean;
  sceneDebug: boolean;
  currentSentence?: {
    text: string;
  };
  containerId: string;
  sceneInfo: {
    currentSceneIndex: number;
    totalScenes: number;
  };
  onScenesSetUp?: (
    sceneData: Array<{ start: number; end: number; duration?: number }>
  ) => void;
  onSceneChange?: (sceneIndex: number) => void;
}

const VisualizerLayer: React.FC<VisualizerLayerProps> = ({
  Visualizer,
  currentTime,
  scale,
  isFullscreen,
  baseWidth,
  baseHeight,
  captionsEnabled,
  currentSentence,
  containerId,
  sceneDebug = false,
  sceneInfo,
  onScenesSetUp,
  onSceneChange,
}) => {
  return (
    <div
      id={containerId}
      className={cn(
        "absolute bg-black inset-0 z-10 pointer-events-none",
        isFullscreen && "flex items-center justify-center"
      )}
      slot="media"
    >
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        style={{
          aspectRatio: `${baseWidth}/${baseHeight}`,
          width: `${baseWidth}px`,
          height: `${baseHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: isFullscreen ? "center" : "top left",
        }}
      >
        <Visualizer
          currentTime={currentTime * 1000}
          onScenesSetUp={onScenesSetUp}
          onSceneChange={onSceneChange}
        />
      </motion.div>

      {sceneInfo && sceneDebug && (
        <div className="absolute top-4 right-4 text-white text-sm bg-black/60 px-3 py-1 rounded-md">
          Scene {sceneInfo.currentSceneIndex + 1} / {sceneInfo.totalScenes}
        </div>
      )}

      {captionsEnabled && currentSentence && (
        <div className="absolute bottom-10 w-full text-center" slot="media">
          <div className="inline-block bg-black/60 text-white text-lg px-4 py-2 rounded-md">
            {currentSentence.text}
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualizerLayer;
