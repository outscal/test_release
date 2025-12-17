import React from 'react';

interface VideoListProps {
  videos: { name: string }[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

const VideoList: React.FC<VideoListProps> = ({ videos, selectedIndex, onSelect }) => {
  return (
    <div className="w-full lg:w-72 bg-gray-900 p-4 rounded-lg shadow-inner border border-gray-800 flex-shrink-0">
      <h2 className="text-xl font-bold mb-4 text-cyan-400 tracking-wider">Lessons</h2>
      <ul className="space-y-2">
        {videos.map((video, index) => (
          <li key={index}>
            <button
              onClick={() => onSelect(index)}
              className={`w-full text-left p-3 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                selectedIndex === index
                  ? 'bg-cyan-500 text-black font-bold shadow-lg'
                  : 'bg-gray-800 hover:bg-gray-700 hover:shadow-md'
              }`}
            >
              {video.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VideoList;
