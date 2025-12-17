import { ComponentType } from 'react';

export interface SceneMetadata {
  id: string;
  name: string;
  path: string;
  duration?: number; // Scene duration in milliseconds
  startTime?: number; // Scene start time in global video time (milliseconds)
  component?: ComponentType<SceneProps>;
}

export interface SceneProps {
  currentTime: number;
}

export interface EditedScene {
  cssProperties?: {
    backgroundColor?: string;
    color?: string;
    fontSize?: string;
    fontFamily?: string;
    padding?: string;
    margin?: string;
    width?: string;
    height?: string;
    borderRadius?: string;
    border?: string;
    boxShadow?: string;
    opacity?: string;
  };
  textContent?: Record<string, string>; // key: element selector, value: text content
  textProperties?: {
    fontSize?: Record<string, string>;
    color?: Record<string, string>;
    fontWeight?: Record<string, string>;
    textAlign?: Record<string, string>;
  };
  positioning?: {
    position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
    transform?: string;
    display?: 'block' | 'flex' | 'grid' | 'none';
    justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';
    alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
    flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  };
  animations?: {
    duration?: Record<string, string>;
    delay?: Record<string, string>;
    ease?: Record<string, string>;
    keyframes?: Record<string, any>;
  };
}