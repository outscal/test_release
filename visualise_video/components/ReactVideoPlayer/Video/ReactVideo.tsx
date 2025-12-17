import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const ReactVideo = ({ currentTime, Visualizer, isFullScreen, sceneDebug=true }: { currentTime: number, Visualizer: React.ComponentType<{ currentTime: number, sceneDebug: boolean }>, isFullScreen: boolean, sceneDebug: boolean }) => {
    const [scale, setScale] = useState(1);
    const baseWidth = 1280;
    const baseHeight = 720;
    const id = "video-container";

    useEffect(() => {
        const updateScale = () => {
            const viewportWidth = window.document.getElementById(id)?.getBoundingClientRect().width || 0;
            const newScale = Math.min(viewportWidth / baseWidth, 3); // prevents upscaling
            console.log(newScale, viewportWidth, baseWidth)
            setScale(newScale);
        };

        setTimeout(() => {
            updateScale();
        }, 100);
    }, [isFullScreen]);

    return (
        <div id="video-container" className={`${isFullScreen ? "aspect-video w-[calc(100vh*16/9)] inset-0 m-auto absolute" : "rounded-t-lg"} w-full bg-[#111827] aspect-video overflow-hidden shadow-2xl shadow-cyan-500/10 border border-gray-800`}>

            <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                style={{
                    width: `${baseWidth}px`,
                    height: `${baseHeight}px`,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                }}
            >
                <Visualizer currentTime={currentTime} sceneDebug={sceneDebug}/>
            </motion.div>
        </div>
    );
};