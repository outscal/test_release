"use client";

import React, { useEffect, useState } from "react";
import { cn } from "../../lib/utils";
import { VideoPlayer } from "../Molecules/ui/video-player";
import { useRemoteComponent } from "../Utility/useRemoteComponent";
import VisualizerLayer from "./VisualizerLayer";
import VideoControls from "./VideoControls";
import VideoUtility from "../Utility/VideoUtility";
import { PlayButton } from "../Molecules/ui/Buttons/PlayButton";
import { useOrientation } from "../useOrientation";

interface CustomVideoPlayerProps {
  audioUrl: string;
  transcriptUrl?: string;
  visualizerUrl?: string;
  videoClassName?: string;
  thumbnailUrl?: string;
  mode?: "landscape" | "portrait";
  sceneDebug?: boolean;
  Visualizer?: React.FC<{ currentTime: number }>;
  transcript?:
    | Array<{ start: number; end: number; text: string }>
    | Array<{ word: string; start_ms: number; end_ms: number }>;

  scenes?: Array<{ start: number; end: number; duration?: number }>;
  currentSceneIndex?: number;
  onSceneSetup?: (
    sceneData: Array<{ start: number; end: number; duration?: number }>
  ) => void;
  onSceneChange?: (sceneIndex: number) => void;
}

interface CustomVideoPlayerRef {
  onUserSceneSelect: (sceneIndex: number, startTime: number) => void;
}

const CustomVideoPlayer = React.forwardRef<
  CustomVideoPlayerRef,
  CustomVideoPlayerProps
>(
  (
    {
      audioUrl,
      visualizerUrl,
      videoClassName,
      transcriptUrl,
      thumbnailUrl,
      mode = "landscape",
      Visualizer: VisualizerComponent,
      transcript: transcriptData,
      sceneDebug = false,
      scenes,
      currentSceneIndex,
      onSceneSetup,
      onSceneChange,
    },
    ref
  ) => {
    const { Component } = useRemoteComponent(visualizerUrl || "", "video");
    const { orientation } = useOrientation();
    const audioRef = React.useRef<HTMLAudioElement>(null);
    const scaled = React.useRef<boolean>(false);
    const [sentences, setSentences] = useState<
      {
        start: number;
        end: number;
        text: string;
      }[]
    >([]);

    const [captionsEnabled, setCaptionsEnabled] = useState(false);
    const playerRef = React.useRef<any>(null);
    const [scale, setScale] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(true);

    const scenesForUse = scenes || [];

    const onUserSceneSelect = React.useCallback(
      (sceneIndex: number, startTime: number) => {
        if (sceneIndex >= 0 && sceneIndex < scenesForUse.length) {
          const sceneStartTimeSec = startTime / 1000;
          if (audioRef.current) {
            audioRef.current.currentTime = sceneStartTimeSec;
          }
        }
      },
      [scenesForUse]
    );

    React.useImperativeHandle(
      ref,
      () => ({
        onUserSceneSelect,
      }),
      [onUserSceneSelect]
    );

    const baseWidth = mode === "portrait" ? 1080 : 1920;
    const baseHeight = mode === "portrait" ? 1920 : 1080;
    const aspectRatio = mode === "portrait" ? "9/16" : "16/9";

    const id = "video-container";

    const [currentTime, setCurrentTime] = React.useState(0);
    const [hasPlayed, setHasPlayed] = React.useState(false);

    useEffect(() => {
      if (transcriptData && transcriptData.length > 0) {
        const isWordFormat = "word" in transcriptData[0];

        if (isWordFormat) {
          const words = transcriptData as Array<{
            word: string;
            start_ms: number;
            end_ms: number;
          }>;
          setSentences(VideoUtility.groupWordsIntoSentences(words));
        } else {
          setSentences(
            transcriptData as Array<{
              start: number;
              end: number;
              text: string;
            }>
          );
        }
        return;
      }

      // Otherwise, fetch from URL
      if (!transcriptUrl) {
        console.warn("No transcript data or URL provided");
        return;
      }

      const fetchTranscript = async () => {
        try {
          const res = await fetch(transcriptUrl);
          const data = await res.json();
          const words = data || [];

          setSentences(VideoUtility.groupWordsIntoSentences(words));
        } catch (err) {
          console.error("Failed to load transcript:", err);
        }
      };

      fetchTranscript();
    }, [transcriptUrl, transcriptData]);

    React.useEffect(() => {
      let animationFrameId: number;

      const updateTime = () => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
        animationFrameId = requestAnimationFrame(updateTime);
      };

      animationFrameId = requestAnimationFrame(updateTime);

      return () => cancelAnimationFrame(animationFrameId);
    }, []);

    // Use directly provided Visualizer component, or extract from remote component
    const Visualizer = VisualizerComponent || (Component as any)?.Visualizer;

    const updateScale = React.useCallback(() => {
      const container = document.getElementById(id);
      if (!container) return;

      const scale = VideoUtility.getVideoScale(
        id,
        isFullscreen,
        baseWidth,
        baseHeight
      );

      setScale(scale);
    }, [baseWidth, baseHeight, id, isFullscreen]);

    useEffect(() => {
      if (currentTime > 0.01 && !scaled.current) {
        scaled.current = true;
        setTimeout(() => {
          updateScale();
        }, 10);
      }
    }, [currentTime]);

    useEffect(() => {
      scaled.current = true;
      setTimeout(() => {
        updateScale();
      }, 10);
    }, [isFullscreen]);

    useEffect(() => {
      const handleFullscreenChange = () => {
        const fullscreenElement =
          document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).mozFullScreenElement ||
          (document as any).msFullscreenElement;

        const isEnteringFullscreen = !!fullscreenElement;
        setIsFullscreen(isEnteringFullscreen);

        if (isEnteringFullscreen) {
          setTimeout(() => {
            if (screen && screen.orientation && "lock" in screen.orientation) {
              const lockOrientation =
                mode === "portrait" ? "portrait" : "landscape";
              (screen.orientation as any).lock(lockOrientation).catch(() => {});
            }
          }, 100);
        } else {
          setTimeout(() => {
            if (
              screen &&
              screen.orientation &&
              "unlock" in screen.orientation
            ) {
              (screen.orientation as any).unlock();
            }
            setTimeout(() => {
              updateScale();
            }, 200);
          }, 100);
        }
      };

      document.addEventListener("fullscreenchange", handleFullscreenChange);
      document.addEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.addEventListener("mozfullscreenchange", handleFullscreenChange);
      document.addEventListener("MSFullscreenChange", handleFullscreenChange);

      return () => {
        document.removeEventListener(
          "fullscreenchange",
          handleFullscreenChange
        );
        document.removeEventListener(
          "webkitfullscreenchange",
          handleFullscreenChange
        );
        document.removeEventListener(
          "mozfullscreenchange",
          handleFullscreenChange
        );
        document.removeEventListener(
          "MSFullscreenChange",
          handleFullscreenChange
        );
      };
    }, []);

    useEffect(() => {
      if (Component) {
        setTimeout(() => {
          updateScale();
        }, 100);
      }
    }, [Component, updateScale, isFullscreen, orientation]);

    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.ctrlKey && event.key === "h") {
          event.preventDefault();
          if (audioRef.current) {
            audioRef.current.play();
          }
          setControlsVisible((prev) => !prev);
        }
      };

      window.addEventListener("keydown", handleKeyDown);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }, []);

    const currentSentence = sentences.find(
      (s) => currentTime * 1000 >= s.start && currentTime * 1000 <= s.end
    );


    return (
      <>
        <VideoPlayer
          ref={playerRef}
          className={cn(
            "overflow-hidden rounded-lg border mx-auto w-full relative",
            videoClassName
          )}
          style={{ aspectRatio }}
          autohide="3"
          tabIndex={0}
        >
          <audio
            ref={audioRef}
            slot="media"
            src={audioUrl}
            onPlay={() => setHasPlayed(true)}
          />
          {thumbnailUrl && currentTime === 0 && !hasPlayed && (
            <div
              className="absolute inset-0 z-20 w-full h-full flex items-center justify-center"
              style={{
                aspectRatio,
                backgroundImage: `url(${thumbnailUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <PlayButton
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.play();
                  }
                }}
                size="md"
              />
            </div>
          )}

          {Visualizer && (
            <VisualizerLayer
              sceneDebug={sceneDebug}
              Visualizer={Visualizer}
              currentTime={currentTime}
              scale={scale}
              isFullscreen={isFullscreen}
              baseWidth={baseWidth}
              baseHeight={baseHeight}
              captionsEnabled={captionsEnabled}
              currentSentence={currentSentence}
              containerId={id}
              sceneInfo={{
                currentSceneIndex: currentSceneIndex || 0,
                totalScenes: scenesForUse.length,
              }}
              onScenesSetUp={onSceneSetup}
              onSceneChange={onSceneChange}
            />
          )}

          {controlsVisible && (
            <VideoControls
              captionsEnabled={captionsEnabled}
              onCaptionsToggle={() => setCaptionsEnabled((prev) => !prev)}
              mode={mode}
            />
          )}
        </VideoPlayer>
      </>
    );
  }
);

export default CustomVideoPlayer;
