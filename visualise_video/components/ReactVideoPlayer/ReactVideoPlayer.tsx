
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Transcript from './Transcript/Transcript';
import { Word } from './Transcript/TranscriptWord';
import Controls from './Controls/Controls';
import { ReactVideo } from './Video/ReactVideo';
import FullScreenControls from './Controls/FullScreenControls';

export interface ReactVideoProps {
    audioUrl: string;
    transcript: Word[];
    scene_debug?: boolean;
    Visualizer: React.FC<{ currentTime: number }>;
    className?: string;
    videoKey?: string; // e.g., "Lesson-1-Material-6-v1"
}

const ReactVideoPlayer: React.FC<ReactVideoProps> = ({ audioUrl, transcript, Visualizer, className, videoKey, scene_debug }) => {
    let sceneDebug = scene_debug == undefined ? true : scene_debug;
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
    const [isSubtitleOn, setSubtitleOn] = useState<boolean>(true);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    const [isReady, setIsReady] = useState<boolean>(false);
    const [speed, setSpeed] = useState(1);
    const [sceneMetadata, setSceneMetadata] = useState<Array<{start: number, end: number, importPath: string, sceneNumber: number}>>([]);
    const [currentScenePath, setCurrentScenePath] = useState<string>('');
    const [hideControls, setHideControls] = useState<boolean>(false);

    const audioRef = useRef<HTMLAudioElement>(null);

    // Parse video TSX file to extract scene metadata
    useEffect(() => {
        if (!videoKey) return;

        const parseVideoFile = async () => {
            try {
                // Parse videoKey to get file path
                // Format: "Lesson-X-Material-Y-vZ" -> Try multiple path patterns
                const match = videoKey.match(/Lesson-(\d+)-Material-(\d+)-v(\d+(?:\.\d+)?)/);
                if (!match) return;

                const lessonNum = match[1];
                const materialNum = match[2];
                const version = match[3];

                // Try both possible paths (relative to visualise_video directory)
                const videoPathWithSubdir = `../Outputs/Video/Lesson-${lessonNum}/Material-${materialNum}/v${version}/Video-${videoKey}.tsx`;
                const videoPathNoSubdir = `../Outputs/Video/Lesson-${lessonNum}/Material-${materialNum}/Video-${videoKey}.tsx`;

                console.log('Trying video path 1:', videoPathWithSubdir);
                let response = await fetch(videoPathWithSubdir);

                if (!response.ok) {
                    console.log('Path 1 failed, trying path 2:', videoPathNoSubdir);
                    response = await fetch(videoPathNoSubdir);
                }

                if (!response.ok) {
                    console.error('Both paths failed');
                    return;
                }

                const code = await response.text();
                console.log('Video file fetched, length:', code.length);

                // Determine base directory from the matched path
                const basePath = response.url.includes(`/v${version}/`)
                    ? `../Outputs/Video/Lesson-${lessonNum}/Material-${materialNum}/v${version}`
                    : `../Outputs/Video/Lesson-${lessonNum}/Material-${materialNum}`;

                console.log('Base path determined:', basePath);

                // Parse import statements: import Scene0 from './latest_lesson_X_material_Y_scene_0_video_output';
                const importRegex = /import\s+Scene(\d+)\s+from\s+['"](.+?)['"]/g;
                const imports: Map<number, string> = new Map();
                let importMatch;
                while ((importMatch = importRegex.exec(code)) !== null) {
                    const sceneNum = parseInt(importMatch[1]);
                    const importPath = importMatch[2];
                    imports.set(sceneNum, importPath);
                }

                console.log('Imports found:', Array.from(imports.entries()));

                // Parse scenes array: { start: 0, end: 9508, Component: Scene0}
                const scenesArrayMatch = code.match(/const scenes = \[([\s\S]*?)\];/);
                if (!scenesArrayMatch) return;

                const scenesArrayContent = scenesArrayMatch[1];
                const sceneRegex = /\{\s*start:\s*(\d+),\s*end:\s*(\d+),\s*Component:\s*Scene(\d+)\s*\}/g;

                const metadata: Array<{start: number, end: number, importPath: string, sceneNumber: number}> = [];
                let sceneMatch;
                while ((sceneMatch = sceneRegex.exec(scenesArrayContent)) !== null) {
                    const start = parseInt(sceneMatch[1]);
                    const end = parseInt(sceneMatch[2]);
                    const sceneNum = parseInt(sceneMatch[3]);
                    let importPath = imports.get(sceneNum);

                    if (importPath) {
                        // Check if importPath is already an absolute path (starts with Outputs/ or /Outputs/)
                        if (importPath.includes('Outputs/')) {
                            // Already absolute, ensure it has ../ prefix and .tsx extension
                            let fullPath = importPath;
                            if (!fullPath.startsWith('../')) {
                                fullPath = fullPath.replace(/^\//, ''); // Remove leading slash
                                fullPath = '../' + fullPath;
                            }
                            if (!fullPath.endsWith('.tsx')) {
                                fullPath += '.tsx';
                            }
                            metadata.push({ start, end, importPath: fullPath, sceneNumber: sceneNum });
                        } else {
                            // Relative path, construct full path
                            let cleanPath = importPath.replace('./', '');
                            if (!cleanPath.endsWith('.tsx')) {
                                cleanPath += '.tsx';
                            }
                            const fullPath = `${basePath}/${cleanPath}`;
                            metadata.push({ start, end, importPath: fullPath, sceneNumber: sceneNum });
                        }
                    }
                }

                console.log('Parsed scene metadata:', metadata);
                setSceneMetadata(metadata);
            } catch (error) {
                console.error('Error parsing video file:', error);
            }
        };

        parseVideoFile();
    }, [videoKey]);

    // Update current scene path based on currentTime
    useEffect(() => {
        if (sceneMetadata.length === 0) return;

        const activeScene = sceneMetadata.find(
            scene => currentTime >= scene.start && currentTime < scene.end
        );

        if (activeScene) {
            console.log('Active scene:', activeScene);
            setCurrentScenePath(activeScene.importPath);
        }
    }, [currentTime, sceneMetadata]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        setIsPlaying(false);
        setIsReady(false);
        setCurrentTime(0);
        // A new audio element is created, so we should wait for its metadata
        setDuration(0);

        const handleLoadedMetadata = () => {
            setDuration(audio.duration * 1000);
            setIsReady(true);
        };
        const handleTimeUpdate = () => setCurrentTime(audio.currentTime * 1000);
        const handlePlay = () => setIsPlaying(true);
        const handlePauseOrEnd = () => setIsPlaying(false);

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePauseOrEnd);
        audio.addEventListener('ended', handlePauseOrEnd);

        if (audio.readyState > 0) {
            handleLoadedMetadata();
        }

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePauseOrEnd);
            audio.removeEventListener('ended', handlePauseOrEnd);
        };
    }, [audioUrl]);

    // Listen for toggle UI visibility event from Vite plugin
    useEffect(() => {
        const handleToggleUIVisibility = (e: Event) => {
            const customEvent = e as CustomEvent;
            setHideControls(customEvent.detail.hidden);
        };

        window.addEventListener('toggleUIVisibility', handleToggleUIVisibility);

        return () => {
            window.removeEventListener('toggleUIVisibility', handleToggleUIVisibility);
        };
    }, []);

    const handlePlayPause = useCallback(() => {
        if (isPlaying) {
            audioRef.current?.pause();
        } else {
            audioRef.current?.play().catch(e => console.error("Error playing audio:", e));
        }
    }, [isPlaying]);

    const handleSeek = useCallback((time_ms: number) => {
        if (audioRef.current && isReady) {
            audioRef.current.currentTime = time_ms / 1000;
        }
    }, [isReady]);

    const handleMuteToggle = useCallback(() => {
        setIsMuted(prev => !prev);
    }, []);

    const handleSpeedChange = useCallback((newSpeed: number) => {
        setSpeed(newSpeed);
        if (audioRef.current) {
            audioRef.current.playbackRate = newSpeed;
        }
    }, []);

    return (
        <>
            <div className={`w-[100vw] h-[100vh] bg-black absolute top-0 left-0 right-0 bottom-0 ${isFullScreen ? "block" : "hidden"}`} />

            <div className={`${isFullScreen ? "max-w-[100vw] fixed top-0 left-0 right-0 bottom-0 w-[calc(100vh*16/9)] m-auto" : "sm:max-w-2xl max-w-full p-4"} m-auto text-gray-500 flex flex-col items-center justify-center selection:bg-cyan-400 selection:text-black ${className}`}>
                <audio
                    key={audioUrl}
                    ref={audioRef}
                    src={audioUrl}
                    preload="metadata"
                    muted={isMuted}
                />

                <div className={`${isFullScreen ? "" : "max-w-2xl"} w-full flex flex-col`}>
                    <main id="main-video-container" className="flex-grow w-full flex flex-col relative">
                        <FullScreenControls
                            currentTime={currentTime}
                            isPlaying={isPlaying}
                            onPlayPause={handlePlayPause}
                            onSeek={handleSeek}
                        />
                        <div className="w-full aspect-video">
                            <ReactVideo sceneDebug={sceneDebug} isFullScreen={isFullScreen} currentTime={currentTime} Visualizer={Visualizer} />
                        </div>
                        {isSubtitleOn && <div className="w-full h-fit absolute bottom-1 left-0 right-0">
                            <Transcript isFullScreen={isFullScreen} words={transcript} currentTime={currentTime} />
                        </div>}
                    </main>
                    {!hideControls && (
                        <div className={`${isFullScreen ? "sm:fixed sm:bottom-0 sm:left-0 sm:right-0 z-50" : ""}`}>
                            <Controls
                                isSubtitleOn={isSubtitleOn}
                                setSubtitleOn={setSubtitleOn}
                                setFullScreen={setIsFullScreen}
                                isFullScreen={isFullScreen}
                                isPlaying={isPlaying}
                                onPlayPause={handlePlayPause}
                                currentTime={currentTime}
                                duration={duration}
                                onSeek={handleSeek}
                                isReady={isReady}
                                isMuted={isMuted}
                                onMuteToggle={handleMuteToggle}
                                onSpeedChange={handleSpeedChange}
                                currentSpeed={speed}
                            />
                        </div>
                    )}
                    {/* Scene Path Button - Debug Version */}
                    <div className={`mt-2 p-2 bg-gray-800 rounded ${isFullScreen ? "hidden" : ""}`}>
                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                onClick={() => {
                                    if (currentScenePath) {
                                        // Convert currentTime (ms) to MM:SS format
                                        const totalSeconds = Math.floor(currentTime / 1000);
                                        const minutes = Math.floor(totalSeconds / 60);
                                        const seconds = totalSeconds % 60;
                                        const timestamp = `${minutes}:${seconds.toString().padStart(2, '0')}`;

                                        const formattedText = `Scene File Path: "${currentScenePath}"\nTimestamp in minutes: "${timestamp}"`;
                                        navigator.clipboard.writeText(formattedText);
                                        alert('Scene info copied to clipboard!\n\n' + formattedText);
                                    } else {
                                        alert('No scene path available yet. Check console for debug info.');
                                    }
                                }}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                                title="Click to copy scene file path"
                            >
                                📁 Copy Scene Path
                            </button>
                            {currentScenePath && (
                                <a
                                    href="#"
                                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                                    title="Open in Cursor"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        // Get the project root path dynamically
                                        // Since currentScenePath is relative like "../Outputs/...", we need to resolve it
                                        const projectRoot = window.location.origin; // This gives us the base URL

                                        // Convert relative path to absolute by removing ../ prefix
                                        let cleanPath = currentScenePath.replace(/^\.\.\//, '');

                                        // For local development, construct file path
                                        // Note: This assumes the project is at C:\Outscal\course-workflow
                                        // You may need to adjust this path for your system
                                        const absolutePath = `C:\\Outscal\\course-workflow\\${cleanPath.replace(/\//g, '\\')}`;

                                        console.log('currentScenePath:', currentScenePath);
                                        console.log('Constructed absolute path:', absolutePath);

                                        // Use cursor:// protocol
                                        const cursorUrl = `cursor://file/${absolutePath.replace(/\\/g, '/')}`;
                                        console.log('Opening URL:', cursorUrl);
                                        window.location.href = cursorUrl;
                                    }}
                                >
                                    🖊️ Open in Cursor
                                </a>
                            )}
                            <span className="text-xs text-gray-300 truncate max-w-md" title={currentScenePath || 'No scene detected'}>
                                {currentScenePath
                                    ? currentScenePath.split('/').pop()
                                    : sceneMetadata.length === 0
                                        ? 'No separate scene files (inline video)'
                                        : `Waiting... (${sceneMetadata.length} scenes loaded)`
                                }
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ReactVideoPlayer;
