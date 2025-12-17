"use client";

import React from "react";
import { cn } from "../../lib/utils";
import { FaClosedCaptioning, FaRegClosedCaptioning } from "react-icons/fa6";
import {
  VideoPlayerTimeDisplay,
  VideoPlayerMuteButton,
  VideoPlayerPlayButton,
  VideoPlayerSeekBackwardButton,
  VideoPlayerSeekForwardButton,
  VideoPlayerTimeRange,
  VideoPlayerControlBar,
  VideoPlayerFullscreenButton,
  VideoPlayerPlaybackRateButton,
  VideoPlayerVolumeRange,
} from "../Molecules/ui/video-player";

interface VideoControlsProps {
  captionsEnabled: boolean;
  onCaptionsToggle: () => void;
  mode?: "landscape" | "portrait";
}

const VideoControls: React.FC<VideoControlsProps> = ({
  captionsEnabled,
  onCaptionsToggle,
  mode = "landscape",
}) => {
  const isPortrait = mode === "portrait";

  if (isPortrait) {
    return (
      <VideoPlayerControlBar className="z-[99]">
        <VideoPlayerPlayButton className="p-0" />
        <VideoPlayerTimeRange className="flex-1 min-w-0 px-1" />
        <VideoPlayerTimeDisplay showDuration className="text-[10px] px-0.5" />
        <VideoPlayerPlaybackRateButton rates={[1, 1.5, 2]} className="p-0" />
        <VideoPlayerMuteButton className="p-0" />
        <VideoPlayerFullscreenButton className="p-0" />
      </VideoPlayerControlBar>
    );
  }

  return (
    <VideoPlayerControlBar className="z-[99]">
      <VideoPlayerPlayButton className="p-1 md:p-2.5" />
      <VideoPlayerSeekBackwardButton seekOffset={10} className="p-1 md:p-2.5" />
      <VideoPlayerSeekForwardButton seekOffset={10} className="p-1 md:p-2.5" />
      <VideoPlayerTimeRange className="p-1 md:p-2.5" />
      <VideoPlayerTimeDisplay showDuration />
      <VideoPlayerPlaybackRateButton rates={[0.8, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]} className="p-1 md:p-2.5" />
      <button
        onClick={onCaptionsToggle}
        className={cn(
          "hidden md:block p-1 md:p-2.5 transition-colors cursor-pointer bg-background",
          captionsEnabled ? "" : "dark:hover:bg-white/10 hover:bg-white"
        )}
        title={captionsEnabled ? "Hide captions" : "Show captions"}
      >
        {captionsEnabled ? (
          <FaClosedCaptioning className="h-5 w-5" />
        ) : (
          <FaRegClosedCaptioning className="h-5 w-5" />
        )}
      </button>
      <VideoPlayerMuteButton className="p-1 md:p-2.5 hidden sm:block" />
      <VideoPlayerVolumeRange className="p-1 md:p-2.5 hidden sm:block w-20" />
      <VideoPlayerFullscreenButton className="p-1 md:p-2.5" />
    </VideoPlayerControlBar>
  );
};

export default VideoControls;
