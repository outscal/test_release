"use client";
import { useEffect, useState } from "react";

// Define enum for orientation
export enum Orientation {
  LANDSCAPE = "LANDSCAPE",
  PORTRAIT = "PORTRAIT",
}

export function useOrientation(
  getHeightWidth: boolean = false
): { orientation: Orientation | null; dimensions: { height: number; width: number } | null } {
  const [orientation, setOrientation] = useState<Orientation | null>(null);
  const [dimensions, setDimensions] = useState<{
    height: number;
    width: number;
  } | null>(null);

  useEffect(() => {
    const getOrientation = (): Orientation =>
      window.matchMedia("(orientation: landscape)").matches
        ? Orientation.LANDSCAPE
        : Orientation.PORTRAIT;
    const getDimensions = () => {
      return {
        height: window.innerHeight,
        width: window.innerWidth,
      };
    };
    if (getHeightWidth) {
      setDimensions(getDimensions());
    }
    setOrientation(getOrientation());

    const mediaQuery = window.matchMedia("(orientation: landscape)");

    const dimensionsHandler = () => {
      setDimensions(getDimensions());
    };
    const handler = (e: MediaQueryListEvent) => {
      setOrientation(e.matches ? Orientation.LANDSCAPE : Orientation.PORTRAIT);
    };

    mediaQuery.addEventListener("change", handler);
    if (getHeightWidth) {
      window.addEventListener("resize", dimensionsHandler);
    }

    return () => {
      mediaQuery.removeEventListener("change", handler);
      if (getHeightWidth) {
        window.removeEventListener("resize", dimensionsHandler);
      }
    };
  }, []);

  return { orientation, dimensions };
}
