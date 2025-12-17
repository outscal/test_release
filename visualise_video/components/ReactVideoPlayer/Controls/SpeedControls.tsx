
import React from 'react';

interface SpeedControlsProps {
    onSpeedChange: (speed: number) => void;
    currentSpeed: number;
}

const SpeedControls: React.FC<SpeedControlsProps> = ({ onSpeedChange, currentSpeed }) => {
    const speeds = [1, 1.5, 2, 2.5, 3];

    const handleSpeedChange = (increment: boolean) => {
        const currentIndex = speeds.indexOf(currentSpeed);
        let newIndex;

        if (increment) {
            newIndex = Math.min(currentIndex + 1, speeds.length - 1);
        } else {
            newIndex = Math.max(currentIndex - 1, 0);
        }

        onSpeedChange(speeds[newIndex]);
    };

    return (
        <div className="flex items-center gap-1">
            <button
                onClick={() => handleSpeedChange(false)}
                className="px-2 py-1 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700"
                disabled={currentSpeed === speeds[0]}
            >
                &lt;
            </button>
            <span className="px-2 py-1 text-sm font-medium text-white bg-gray-800 rounded-md">
                {currentSpeed}x
            </span>
            <button
                onClick={() => handleSpeedChange(true)}
                className="px-2 py-1 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700"
                disabled={currentSpeed === speeds[speeds.length - 1]}
            >
                &gt;
            </button>
        </div>
    );
};

export default SpeedControls;
