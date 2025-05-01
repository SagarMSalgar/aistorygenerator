import { useState, useEffect } from 'react';
import { SceneData } from '@shared/schema';

interface AnimatedScenesPlayerProps {
  scenes: SceneData[];
  dialogueLines?: {character: string; text: string}[];
  autoPlay?: boolean;
  interval?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function AnimatedScenesPlayer({ 
  scenes, 
  dialogueLines = [], 
  autoPlay = true, 
  interval = 5000, 
  className = "",
  style = {}
}: AnimatedScenesPlayerProps) {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [fallbackImage, setFallbackImage] = useState<string | null>(null);

  const nextScene = () => {
    setCurrentSceneIndex((prevIndex) => (prevIndex + 1) % scenes.length);
  };

  const prevScene = () => {
    setCurrentSceneIndex((prevIndex) => (prevIndex - 1 + scenes.length) % scenes.length);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Handle automatic scene transitions
  useEffect(() => {
    let timer: number | undefined;
    
    if (isPlaying && scenes.length > 1) {
      timer = window.setInterval(() => {
        nextScene();
      }, interval);
    }
    
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isPlaying, interval, scenes.length]);

  // Reset to first scene if scenes array changes
  useEffect(() => {
    setCurrentSceneIndex(0);
  }, [scenes]);

  if (!scenes || scenes.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-neutral-900 rounded-lg ${className}`} style={{ minHeight: "300px", ...style }}>
        <p className="text-white">No scenes available</p>
      </div>
    );
  }

  const currentScene = scenes[currentSceneIndex];
  const currentDialogue = dialogueLines[currentSceneIndex] || null;

  const handleImageError = () => {
    // Use fallback image if the current scene image fails to load
    if (!fallbackImage) {
      setFallbackImage('/generated/fallback-thumbnail.svg');
    }
  };

  return (
    <div className={`relative bg-neutral-900 rounded-lg overflow-hidden flex flex-col ${className}`} style={{ minHeight: "300px", ...style }}>
      {/* Scene Image */}
      <div className="flex-grow flex items-center justify-center">
        <img 
          src={fallbackImage || currentScene.imageUrl} 
          alt={currentScene.description}
          className="w-full h-full object-contain"
          style={{ maxHeight: "240px", margin: "0 auto" }}
          onError={handleImageError}
        />
      </div>
      
      {/* Scene Description & Caption */}
      <div className="bg-black bg-opacity-70 text-white p-2 text-center">
        <p className="text-sm">{currentScene.description}</p>
        {currentDialogue && (
          <div className="mt-1 font-bold text-xs">
            <span className="text-primary">{currentDialogue.character}:</span> {currentDialogue.text}
          </div>
        )}
      </div>
      
      {/* Controls */}
      {scenes.length > 1 && (
        <div className="flex items-center justify-center space-x-4 bg-black bg-opacity-70 p-2">
          <button 
            onClick={prevScene}
            className="text-white hover:text-primary"
            aria-label="Previous scene"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          
          <button 
            onClick={togglePlayPause}
            className="text-white hover:text-primary"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>
          
          <button 
            onClick={nextScene}
            className="text-white hover:text-primary"
            aria-label="Next scene"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          
          {/* Scene Counter */}
          <div className="text-white text-xs">
            {currentSceneIndex + 1} / {scenes.length}
          </div>
        </div>
      )}
    </div>
  );
}

export default AnimatedScenesPlayer;