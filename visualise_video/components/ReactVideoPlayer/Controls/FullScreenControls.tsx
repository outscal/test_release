  import React, { useEffect, useState } from 'react';
import {
  PlayIcon,
  PauseIcon,
  SeekBackwardIcon,
  SeekForwardIcon,
} from './Icons';

interface FullscreenControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onSeek: (timeInMs: number) => void;
  currentTime: number;
}

type ControlType = 'play' | 'pause' | 'forward' | 'back' | null;

const FullscreenControls: React.FC<FullscreenControlsProps> = ({
  isPlaying,
  currentTime,
  onPlayPause,
  onSeek,
}) => {
  const [visibleControl, setVisibleControl] = useState<ControlType>(null);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (visibleControl) {
      setFade(true); // fade in
      const hideTimer = setTimeout(() => {
        setFade(false); // start fade out
        setTimeout(() => setVisibleControl(null), 300); // after fade out
      }, 500); // show duration

      return () => clearTimeout(hideTimer);
    }
  }, [visibleControl]);

  const handleBackward = () => {
    setVisibleControl('back');
    onSeek(currentTime - 10000);
  };

  const handleForward = () => {
    setVisibleControl('forward');
    onSeek(currentTime + 10000);
  };

  const handlePlayPause = () => {
    setVisibleControl(isPlaying ? 'pause' : 'play');
    onPlayPause();
  };

  const renderIcon = () => {
    switch (visibleControl) {
      case 'back':
        return (
          <div className="flex items-center gap-1 text-white text-xl">
            <SeekBackwardIcon className="w-8 h-8" />
            <span>10s</span>
          </div>
        );
      case 'forward':
        return (
          <div className="flex items-center gap-1 text-white text-xl">
            <span>10s</span>
            <SeekForwardIcon className="w-8 h-8" />
          </div>
        );
      case 'play':
        return <PlayIcon className="w-12 h-12 text-white" />;
      case 'pause':
        return <PauseIcon className="w-12 h-12 text-white" />;
      default:
        return null;
    }
  };

  const getIconPosition = () => {
    switch (visibleControl) {
      case 'back':
        return 'left-10';
      case 'forward':
        return 'right-10';
      case 'play':
      case 'pause':
        return 'left-1/2 -translate-x-1/2';
      default:
        return 'hidden';
    }
  };

  return (
    <div className="absolute inset-0 z-50">
      {/* Clickable zones */}
      <div className="flex h-full w-full">
        {/* Left - Backward */}
        <div
          onClick={handleBackward}
          className="w-1/3 h-full flex items-center justify-center"
        ></div>

        {/* Center - Play/Pause */}
        <div
          onClick={handlePlayPause}
          className="w-1/3 h-full flex items-center justify-center"
        ></div>

        {/* Right - Forward */}
        <div
          onClick={handleForward}
          className="w-1/3 h-full flex items-center justify-center"
        ></div>
      </div>

      {/* Feedback Icon */}
      {visibleControl && (
        <div
          className={`absolute top-1/2 transform -translate-y-1/2 ${getIconPosition()} 
            transition-opacity duration-300 pointer-events-none 
            ${fade ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="bg-black/70 p-4 rounded-full">{renderIcon()}</div>
        </div>
      )}
    </div>
  );
};

export default FullscreenControls;
