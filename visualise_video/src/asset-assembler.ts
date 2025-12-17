import { Word } from '../components/ReactVideoPlayer/Transcript/TranscriptWord';

export interface AssembledVideoData {
    Visualizer: React.FC<{ currentTime: number }>;
    audioUrl: string;
    transcript: Word[];
    topic: string;
}

// 1. Use glob to find all possible assets from topics
const videoModules = import.meta.glob('../../Outputs/*/Video/v*/*.tsx');
const audioModules = import.meta.glob('../../Outputs/*/Audio/**/*.mp3');
const transcriptModules = import.meta.glob('../../Outputs/*/Transcript/**/*.json');
const manifestModules = import.meta.glob('../../Outputs/*/manifest.json', { eager: true });

// 2. Build audio map from Audio folder (Outputs/{topic}/Audio/vN/Audio-vN.mp3)
const audioMap: Record<string, string> = {};

for (const path in audioModules) {
    const audioMatch = path.match(/\/Outputs\/([^/]+)\/Audio\/v(\d+(?:\.\d+)?)\/Audio-v(\d+(?:\.\d+)?)\.mp3$/);
    if (audioMatch) {
        const topic = audioMatch[1];
        const version = audioMatch[2];
        audioMap[`${topic}:v${version}`] = path;
    }
}

// 3. Build transcript map from Transcript folder (Outputs/{topic}/Transcript/vN/Transcript-vN.json)
const transcriptMap: Record<string, string> = {};

for (const path in transcriptModules) {
    const transcriptMatch = path.match(/\/Outputs\/([^/]+)\/Transcript\/v(\d+(?:\.\d+)?)\/Transcript-v(\d+(?:\.\d+)?)\.json$/);
    if (transcriptMatch) {
        const topic = transcriptMatch[1];
        const version = transcriptMatch[2];
        transcriptMap[`${topic}:v${version}`] = path;
    }
}

// 4. Assemble videos from Outputs/{topic}/Video/vN/Video-vN.tsx structure
const videoPromises: Record<string, Promise<AssembledVideoData>> = {};

// Parse video path from Outputs/{topic}/Video/vN/Video-vN.tsx
const parseVideoPath = (path: string) => {
    const match = path.match(/\/Outputs\/([^/]+)\/Video\/v(\d+(?:\.\d+)?)\/Video-v(\d+(?:\.\d+)?)\.tsx$/);
    if (!match) return null;
    const topic = match[1];
    const version = match[2];
    return { topic, version };
};

// Get the latest audio version for a topic
const getLatestAudioVersion = (topic: string) => {
    const versions = Object.keys(audioMap).filter(k => k.startsWith(`${topic}:`));
    if (versions.length === 0) return null;
    return versions.sort((a, b) => {
        const vA = parseFloat(a.split(':v')[1]);
        const vB = parseFloat(b.split(':v')[1]);
        return vB - vA;
    })[0];
};

// Get the latest transcript version for a topic
const getLatestTranscriptVersion = (topic: string) => {
    const versions = Object.keys(transcriptMap).filter(k => k.startsWith(`${topic}:`));
    if (versions.length === 0) return null;
    return versions.sort((a, b) => {
        const vA = parseFloat(a.split(':v')[1]);
        const vB = parseFloat(b.split(':v')[1]);
        return vB - vA;
    })[0];
};

const audioUrlModules = import.meta.glob('../../Outputs/*/Audio/**/*.mp3', { as: 'url', eager: true });

for (const path in videoModules) {
    const videoInfo = parseVideoPath(path);
    if (videoInfo) {
        const { topic, version } = videoInfo;
        const fullId = `${topic}:v${version}`;

        // Use the latest available audio (or matching version if available)
        const audioVersion = audioMap[fullId] ? fullId : getLatestAudioVersion(topic);
        const transcriptVersion = transcriptMap[fullId] ? fullId : getLatestTranscriptVersion(topic);

        const audioPath = audioVersion ? audioMap[audioVersion] : null;
        const transcriptPath = transcriptVersion ? transcriptMap[transcriptVersion] : null;
        const audioUrl = audioPath ? audioUrlModules[audioPath] : null;

        const videoLoader = videoModules[path];

        videoPromises[fullId] = (async () => {
            const videoModule = await videoLoader();

            let transcriptData: Word[] = [];
            if (transcriptPath && transcriptModules[transcriptPath]) {
                const transcriptModule = await transcriptModules[transcriptPath]();
                transcriptData = (transcriptModule as any).default || transcriptModule;
                if (!Array.isArray(transcriptData)) {
                    console.error('Transcript is not an array:', transcriptPath, transcriptData);
                    transcriptData = [];
                }
            }

            return {
                Visualizer: (videoModule as any).default,
                audioUrl: audioUrl || '',
                transcript: transcriptData,
                topic: topic,
            };
        })();
    }
}

const videos = Object.fromEntries(
    (await Promise.all(
        Object.entries(videoPromises).map(async ([key, promise]) => [key, await promise])
    )).sort((a, b) => {
        const keyA = a[0] as string;
        const keyB = b[0] as string;
        const vA = parseFloat(keyA.split(':v')[1] || '0');
        const vB = parseFloat(keyB.split(':v')[1] || '0');
        return vA - vB;
    })
);

// Load manifest to get video_ratio (use first available manifest)
const firstManifest = Object.values(manifestModules)[0];
const manifest = firstManifest ? ((firstManifest as any).default || firstManifest) : null;
export const defaultVideoMode: 'landscape' | 'portrait' = manifest?.metadata?.video_ratio === 'portrait' ? 'portrait' : 'landscape';

export default videos;