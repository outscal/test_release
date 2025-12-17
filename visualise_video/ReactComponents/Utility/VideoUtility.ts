class VideoUtility {
  private static instance: VideoUtility;

  private constructor() {}

  public static getInstance(): VideoUtility {
    if (!VideoUtility.instance) {
      VideoUtility.instance = new VideoUtility();
    }
    return VideoUtility.instance;
  }

  getVideoScale(
    id: string,
    isFullscreen: boolean,
    baseWidth: number,
    baseHeight: number
  ): number {
    let scale = 1;
    const container = document.getElementById(id);
    if (!container) return 1;

    if (isFullscreen) {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Calculate scale for edge-to-edge content with breathing room
      const scaleX = viewportWidth / baseWidth;
      const scaleY = viewportHeight / baseHeight;

      const maxScale = Math.min(scaleX, scaleY);
      scale = maxScale * 0.9;
    } else {
      const containerRect = container.getBoundingClientRect();
      const containerWidth = containerRect.width || 0;
      const containerHeight = containerRect.height || 0;
      if (containerWidth > 0 && containerHeight > 0) {
        const scaleX = containerWidth / baseWidth;
        const scaleY = containerHeight / baseHeight;
        scale = Math.min(scaleX, scaleY, 3);
      } else {
        scale = Math.min(containerWidth / baseWidth, 3);
      }
    }
    return scale;
  }

  groupWordsIntoSentences(
    words: {
      word: string;
      start_ms: number;
      end_ms: number;
    }[],
    maxDuration = 4000
  ): {
    start: number;
    end: number;
    text: string;
  }[] {
    const sentences = [];
    let group = [];
    let start = 0;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];

      if (group.length === 0) start = word.start_ms;
      group.push(word);

      const duration = word.end_ms - start;

      if (duration >= maxDuration || i === words.length - 1) {
        sentences.push({
          start,
          end: word.end_ms,
          text: group.map((w) => w.word).join(" "),
        });
        group = [];
      }
    }

    return sentences;
  }
}

export default VideoUtility.getInstance();
