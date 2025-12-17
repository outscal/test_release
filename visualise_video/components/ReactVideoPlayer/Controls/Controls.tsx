import React, { useCallback, useEffect, useRef, useState } from 'react';
import SpeedControls from './SpeedControls';
import {
  PlayIcon,
  PauseIcon,
  MuteIcon,
  UnmuteIcon,
  FullscreenIcon,
  ExitFullscreenIcon,
  SubtitleOnIcon,
  SubtitleOffIcon,
} from './Icons';

interface ControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  currentTime: number;
  duration: number;
  onSeek: (t: number) => void;
  isReady: boolean;
  isMuted: boolean;
  onMuteToggle: () => void;
  setFullScreen: (f: boolean) => void;
  isFullScreen: boolean;
  isSubtitleOn: boolean;
  setSubtitleOn: (s: boolean) => void;
  onSpeedChange: (s: number) => void;
  currentSpeed: number;
}

const formatTime = (ms: number) =>
  `${Math.floor(ms / 60000)}:${`${Math.floor(ms / 1000) % 60}`.padStart(2, '0')}`;

const Controls: React.FC<ControlsProps> = ({
  isPlaying,
  onPlayPause,
  currentTime,
  duration,
  onSeek,
  isReady,
  isMuted,
  onMuteToggle,
  setFullScreen,
  isSubtitleOn,
  setSubtitleOn,
  isFullScreen,
  onSpeedChange,
  currentSpeed,
}) => {
  /* ---------- auto-hide ---------- */
  const [visible, setVisible] = useState(true);
  const hideT = useRef<NodeJS.Timeout | null>(null);

  const resetHideTimer = useCallback(() => {
    if (!isFullScreen) return;
    if (hideT.current) clearTimeout(hideT.current);
    setVisible(true);
    hideT.current = setTimeout(() => setVisible(false), 3000);
  }, [isFullScreen]);

  /* attach listeners only while in fullscreen */
  useEffect(() => {
    if (!isFullScreen) {
      setVisible(true);
      return;
    }
    const show = () => resetHideTimer();
    window.addEventListener('mousemove', show);
    window.addEventListener('touchstart', show);
    resetHideTimer();

    return () => {
      if (hideT.current) clearTimeout(hideT.current);
      window.removeEventListener('mousemove', show);
      window.removeEventListener('touchstart', show);
    };
  }, [isFullScreen, resetHideTimer]);

  /* ---------- scrub bar ---------- */
  const progress = duration ? (currentTime / duration) * 100 : 0;

  const seek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!duration) return;
      const { left, width } = e.currentTarget.getBoundingClientRect();
      onSeek(((e.clientX - left) / width) * duration);
    },
    [duration, onSeek],
  );

  return (
    <div
      className={`w-full transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
    >
      <div className="bg-gray-900/50 border border-gray-800 rounded-b-lg sm:p-3 p-1 flex items-center gap-4 shadow-lg w-full backdrop-blur-sm">
        {/* play/pause */}
        <button
          onClick={onPlayPause}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="bg-gray-700 text-white rounded-full sm:w-10 sm:h-10 w-6 h-6 flex items-center justify-center hover:bg-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
        </button>

        {/* timeline */}
        <div className="flex-grow flex items-center gap-3">
          <span className="sm:text-xl text-sm text-white w-12 text-center">
            {formatTime(currentTime)}
          </span>
          <div className="w-full h-2 bg-gray-700 rounded-full cursor-pointer group" onClick={seek}>
            <div className="h-full bg-yellow-500 rounded-full relative" style={{ width: `${progress}%` }}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform" />
            </div>
          </div>
          <span className="sm:text-xl text-sm text-white w-12 text-center">
            {isReady ? formatTime(duration) : '0:00'}
          </span>
        </div>

        {/* mute / fullscreen */}
        <div className="flex items-center sm:gap-1">
          <SpeedControls
            onSpeedChange={onSpeedChange}
            currentSpeed={currentSpeed}
          />
          <button
            onClick={onMuteToggle}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full p-1"
          >
            {isMuted ? <MuteIcon className="sm:w-5 sm:h-5 w-4 h-4" /> : <UnmuteIcon className="sm:w-5 sm:h-5 w-4 h-4" />}
          </button>
          <button
            onClick={() => setFullScreen(!isFullScreen)}
            aria-label={isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full p-1"
          >
            {isFullScreen ? (
              <ExitFullscreenIcon className="sm:w-5 sm:h-5 w-4 h-4" />
            ) : (
              <FullscreenIcon className="sm:w-5 sm:h-5 w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setSubtitleOn(!isSubtitleOn)}
            aria-label={isSubtitleOn ? 'Subtitle Off' : 'Subtitle On'}
            className="text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full p-1"
          >
            {isSubtitleOn ? (
              <SubtitleOnIcon className="sm:w-5 sm:h-5 w-4 h-4" />
            ) : (
              <SubtitleOffIcon className="sm:w-5 sm:h-5 w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Controls;

