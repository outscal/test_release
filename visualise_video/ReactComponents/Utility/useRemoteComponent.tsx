"use client";

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as FramerMotion from "framer-motion";
import { useState, useEffect } from "react";

declare global {
  interface Window {
    React: any;
    ReactDOM: any;
    FramerMotion: any;
    process: any;
  }
}

if (typeof window !== "undefined") {
  window.React = {
    ...React,
    jsx: React.createElement,
    jsxs: React.createElement,
    Fragment: React.Fragment,
  };
  window.ReactDOM = ReactDOM;
  window.FramerMotion = FramerMotion;

  if (!window.process) {
    window.process = { env: { NODE_ENV: "production" } } as any;
  }

  if (!(window as any).__remoteComponents) {
    (window as any).__remoteComponents = new Map();
  }
}

export function useRemoteComponent(url: string, compName?: string) {
  const [Component, setComponent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setComponentWithVisualizer = (component: any) => {
    if (Object.keys(component).includes("Visualizer")) {
      setComponent(() => component);
    } else {
      setComponent(() => ({ Visualizer: component }));
    }
  };

  const checkAndSetComponentIsLoaded = async (): Promise<Map<string, any> | null> => {
    const componentCache = (window as any).__remoteComponents;
    if (componentCache.has(url)) {
      const cachedComponent = componentCache.get(url);
      if (cachedComponent) {
        setComponentWithVisualizer(cachedComponent);
        setLoading(false);
        return componentCache;
      }
    }
    return null;
  }

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }

    const loadComponent = async () => {
      try {
        setLoading(true);
        setError(null);

        const componentName =
          compName || url.match(/\/([^/]+)\.js$/)?.[1] || "RemoteComponent";

        if (!window.React) {
          await new Promise((resolve) => {
            const checkReact = setInterval(() => {
              if (window.React) {
                clearInterval(checkReact);
                resolve(true);
              }
            }, 50);
          });
        }

        const isComponentLoaded = await checkAndSetComponentIsLoaded()
        if (isComponentLoaded) {
          return;
        }

        const existingScript = document.querySelector(`script[src="${url}"]`);
        if (existingScript) {
          return new Promise((resolve) => {
            const checkComponent = setInterval(async () => {
              const isComponentLoaded = await checkAndSetComponentIsLoaded()
              if (isComponentLoaded) {
                clearInterval(checkComponent);
                resolve(isComponentLoaded);
              }
            }, 200);
          });
        }

        const script = document.createElement("script");
        script.src = url;

        const loadPromise = new Promise<React.ComponentType<any>>(
          (resolve, reject) => {
            script.onload = () => {
              setTimeout(() => {
                let loadedComponent = (window as any)[componentName as any];

                if (!loadedComponent) {
                  loadedComponent = (window as any)[componentName as any];
                }

                if (loadedComponent) {
                  const componentCache = (window as any).__remoteComponents;
                  componentCache.set(url, loadedComponent);

                  setComponentWithVisualizer(loadedComponent);
                  resolve(loadedComponent);
                } else {
                  reject(new Error(`Component not found after loading ${url}`));
                }
                document.head.removeChild(script);
              }, 1000);
            };

            script.onerror = () => {
              reject(new Error(`Failed to load script: ${url}`));
              if (document.head.contains(script)) {
                document.head.removeChild(script);
              }
            };
          }
        );

        document.head.appendChild(script);

        await loadPromise;
      } catch (err) {
        console.error("Failed to load remote component:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load component"
        );
      } finally {
        setLoading(false);
      }
    };

    loadComponent();
  }, [url]);

  return { Component, loading, error };
}
