"use client";

import {
  MediaCaptionsButton,
  MediaControlBar,
  MediaController,
  MediaFullscreenButton,
  MediaMuteButton,
  MediaPlaybackRateButton,
  MediaPlayButton,
  MediaPosterImage,
  MediaSeekBackwardButton,
  MediaSeekForwardButton,
  MediaTimeDisplay,
  MediaTimeRange,
  MediaVolumeRange,
} from "media-chrome/react";
import type { ComponentProps, CSSProperties } from "react";
import { cn } from "../../../lib/utils";

export type VideoPlayerProps = ComponentProps<typeof MediaController>;

const variables = {
  "--media-primary-color": "hsl(var(--primary))",
  "--media-secondary-color": "hsl(var(--secondary))",
  "--media-text-color": "hsl(var(--foreground))",
  "--media-background-color": "hsl(var(--background))",
  "--media-control-background": "hsl(var(--card))",
  "--media-control-hover-background": "hsl(var(--accent))",
  "--media-font-family": "system-ui, -apple-system, sans-serif",
  "--media-font-size": "14px",
  "--media-font-weight": "400",
  "--media-button-icon-color": "hsl(var(--foreground))",
  "--media-mute-button-icon-color": "hsl(var(--foreground))",
  "--media-live-button-icon-color": "hsl(var(--muted-foreground))",
  "--media-live-button-indicator-color": "hsl(var(--destructive))",
  "--media-range-track-background": "hsl(var(--border))",
  "--media-range-track-height": "4px",
  "--media-range-thumb-background": "hsl(var(--primary))",
  "--media-range-thumb-border-color": "hsl(var(--primary))",
  "--media-range-thumb-height": "14px",
  "--media-range-thumb-width": "14px",
  "--media-time-range-buffered-color": "hsl(var(--muted))",
  "--media-time-range-track-color": "hsl(var(--primary))",
  "--media-control-bar-height": "48px",
  "--media-control-padding": "10px",
  "--media-control-radius": "var(--radius)",
  "--media-preview-background": "hsl(var(--popover) / 0.6)",
  "--media-preview-border-color": "hsl(var(--border))",
  "--media-tooltip-background": "hsl(var(--popover))",
  "--media-tooltip-color": "hsl(var(--popover-foreground))",
} as CSSProperties;

export const VideoPlayer = ({ style, ...props }: VideoPlayerProps) => (
  <MediaController
    style={{
      lineHeight:"unset",
      ...variables,
      ...style,
    }}
    {...props}
  />
);

export type VideoPlayerControlBarProps = ComponentProps<typeof MediaControlBar>;

export const VideoPlayerControlBar = (props: VideoPlayerControlBarProps) => (
  <MediaControlBar {...props} />
);

export type VideoPlayerTimeRangeProps = ComponentProps<typeof MediaTimeRange>;

export const VideoPlayerTimeRange = ({
  className,
  ...props
}: VideoPlayerTimeRangeProps) => (
  <MediaTimeRange className={cn("p-2.5", className)} {...props} />
);

export type VideoPlayerTimeDisplayProps = ComponentProps<
  typeof MediaTimeDisplay
>;

export const VideoPlayerTimeDisplay = ({
  className,
  ...props
}: VideoPlayerTimeDisplayProps) => (
  <MediaTimeDisplay className={cn("p-2.5", className)} {...props} />
);

export type VideoPlayerVolumeRangeProps = ComponentProps<
  typeof MediaVolumeRange
>;

export const VideoPlayerVolumeRange = ({
  className,
  ...props
}: VideoPlayerVolumeRangeProps) => (
  <MediaVolumeRange className={cn("p-2.5", className)} {...props} />
);

export type VideoPlayerPlayButtonProps = ComponentProps<typeof MediaPlayButton>;

export const VideoPlayerPlayButton = ({
  className,
  ...props
}: VideoPlayerPlayButtonProps) => (
  <MediaPlayButton className={cn("p-2.5", className)} {...props} />
);

export type VideoPlayerSeekBackwardButtonProps = ComponentProps<
  typeof MediaSeekBackwardButton
>;

export const VideoPlayerSeekBackwardButton = ({
  className,
  ...props
}: VideoPlayerSeekBackwardButtonProps) => (
  <MediaSeekBackwardButton className={cn("p-2.5", className)} {...props} />
);

export type VideoPlayerSeekForwardButtonProps = ComponentProps<
  typeof MediaSeekForwardButton
>;

export const VideoPlayerSeekForwardButton = ({
  className,
  ...props
}: VideoPlayerSeekForwardButtonProps) => (
  <MediaSeekForwardButton className={cn("p-2.5", className)} {...props} />
);

export type VideoPlayerMuteButtonProps = ComponentProps<typeof MediaMuteButton>;

export const VideoPlayerMuteButton = ({
  className,
  ...props
}: VideoPlayerMuteButtonProps) => (
  <MediaMuteButton className={cn("p-2.5", className)} {...props} />
);

export type VideoPlayerContentProps = ComponentProps<"video">;

export const VideoPlayerContent = ({
  className,
  ...props
}: VideoPlayerContentProps) => (
  <video className={cn("mt-0 mb-0", className)} {...props} />
);

export type VideoPlayerFullscreenButtonProps = ComponentProps<typeof MediaFullscreenButton>;

export const VideoPlayerFullscreenButton = ({
  className,
  ...props
}: VideoPlayerFullscreenButtonProps) => (
  <MediaFullscreenButton className={cn("p-2.5", className)} {...props} />
);

export type VideoPlayerPlaybackRateButtonProps = ComponentProps<typeof MediaPlaybackRateButton>;

export const VideoPlayerPlaybackRateButton = ({
  className,
  ...props
}: VideoPlayerPlaybackRateButtonProps) => (
  <MediaPlaybackRateButton className={cn("p-2.5", className)} {...props} />
);

export type VideoPlayerCaptionsButtonProps = ComponentProps<typeof MediaCaptionsButton>;

export const VideoPlayerCaptionsButton = ({
  className,
  ...props
}: VideoPlayerCaptionsButtonProps) => (
  <MediaCaptionsButton className={cn("p-2.5", className)} {...props} />
);

export type VideoPlayerPosterProps = ComponentProps<typeof MediaPosterImage>;

export const VideoPlayerPoster = ({
  className,
  ...props
}: VideoPlayerPosterProps) => (
  <MediaPosterImage className={cn("absolute inset-0 w-full h-full object-cover", className)} {...props} />
);
