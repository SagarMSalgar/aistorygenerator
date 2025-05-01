import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { useCartoon } from '@/context/CartoonContext';
import AnimatedScenesPlayer from './AnimatedScenesPlayer';

export default function PreviewPanel() {
  const {
    script,
    characters,
    dialogue,
    visuals,
    finalVideo,
    saveProject,
    shareProject,
    stepStatuses,
    isLoading
  } = useCartoon();
  
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [storySummary, setStorySummary] = useState<string>("Your day as a cartoon will appear here...");
  const [cartoonData, setCartoonData] = useState<any | null>(null);
  
  // Update preview image based on the current progress
  useEffect(() => {
    if (visuals && visuals.scenes && visuals.scenes.length > 0) {
      setPreviewImage(visuals.scenes[0].imageUrl);
    } else if (script) {
      setStorySummary(script.summary);
    }
  }, [script, visuals]);
  
  // Fetch cartoon data if it's a JSON file
  useEffect(() => {
    if (finalVideo?.url && finalVideo.duration === "Animated Slideshow" && finalVideo.url.endsWith('.json')) {
      fetch(finalVideo.url)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch cartoon data');
          }
          return response.json();
        })
        .then(data => {
          setCartoonData(data);
        })
        .catch(error => {
          console.error('Error fetching cartoon data:', error);
        });
    }
  }, [finalVideo]);
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="border-b p-6">
        <h3 className="text-xl font-medium text-neutral-800">Preview</h3>
        <p className="text-neutral-600 text-sm">See how your cartoon is coming together</p>
      </div>
      
      <div className="p-6">
        {/* Video Preview Container */}
        <div className="preview-container bg-neutral-900 rounded-lg overflow-hidden mb-4" style={{ minHeight: "300px" }}>
          {finalVideo?.url ? (
            finalVideo.duration === "Animated Slideshow" ? (
              // If it's an animated slideshow, use the animated player
              cartoonData ? (
                <AnimatedScenesPlayer 
                  scenes={cartoonData.scenes}
                  dialogueLines={cartoonData.dialogue.lines}
                  style={{ minHeight: "300px" }}
                />
              ) : (
                // Show loading state while fetching cartoon data
                <div className="w-full h-full flex items-center justify-center" style={{ minHeight: "300px" }}>
                  <p className="text-white">Loading cartoon scenes...</p>
                </div>
              )
            ) : finalVideo.duration === "Image Preview" ? (
              // If it's a single image preview, show the image
              <div className="w-full h-full flex items-center justify-center relative" style={{ minHeight: "300px" }}>
                <img 
                  src={finalVideo.url} 
                  alt="Final cartoon scene" 
                  className="w-full h-full object-contain"
                  style={{ maxHeight: "300px", margin: "0 auto" }}
                  onError={(e) => {
                    console.error("Final image failed to load:", finalVideo.url);
                    e.currentTarget.src = "/generated/fallback-thumbnail.svg";
                  }}
                />
              </div>
            ) : (
              // If it's a real video, use the video player
              <div className="w-full h-full flex items-center justify-center relative" style={{ minHeight: "300px" }}>
                <video 
                  src={finalVideo.url} 
                  controls 
                  poster={finalVideo.thumbnailUrl}
                  className="w-full h-full object-contain"
                />
              </div>
            )
          ) : (
            // Show scenes from visuals if available, otherwise show placeholder
            <div className="w-full h-full flex items-center justify-center relative" style={{ minHeight: "300px" }}>
              {visuals?.scenes && visuals.scenes.length > 0 ? (
                <AnimatedScenesPlayer 
                  scenes={visuals.scenes}
                  dialogueLines={dialogue?.lines || []}
                  style={{ minHeight: "300px" }}
                />
              ) : (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="64" 
                      height="64" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="text-white text-opacity-70"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <polygon points="10 8 16 12 10 16 10 8"></polygon>
                    </svg>
                  </div>
                  {previewImage ? (
                    <img 
                      src={previewImage} 
                      alt="Video preview" 
                      className="w-full h-full object-contain opacity-80"
                      style={{ maxHeight: "300px", margin: "0 auto" }}
                      onError={(e) => {
                        console.error("Image failed to load:", previewImage);
                        e.currentTarget.src = "/generated/fallback-thumbnail.svg";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-800"></div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        
        {/* Current Progress */}
        <div className="mb-6">
          <h4 className="font-medium text-neutral-800 mb-2">Current Progress</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Script</span>
              <StepStatusBadge status={stepStatuses['script']} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Characters</span>
              <StepStatusBadge status={stepStatuses['characters']} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Dialogue</span>
              <StepStatusBadge status={stepStatuses['dialogue']} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Visuals</span>
              <StepStatusBadge status={stepStatuses['visuals']} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Music</span>
              <StepStatusBadge status={stepStatuses['music']} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Final Video</span>
              <StepStatusBadge status={stepStatuses['compilation']} />
            </div>
          </div>
        </div>
        
        {/* Story Summary */}
        <div className="mb-6">
          <h4 className="font-medium text-neutral-800 mb-2">Story Summary</h4>
          <p className="text-sm text-neutral-600">
            {cartoonData?.script?.summary || storySummary}
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={saveProject}
            disabled={isLoading}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="mr-2"
            >
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            Save Project
          </Button>
          <Button 
            className="flex-1"
            onClick={shareProject}
            disabled={isLoading}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="mr-2"
            >
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
              <polyline points="16 6 12 2 8 6"></polyline>
              <line x1="12" x2="12" y1="2" y2="15"></line>
            </svg>
            Share
          </Button>
        </div>
      </div>
    </div>
  );
}

function StepStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'complete':
      return <span className="text-xs bg-success text-white rounded-full px-2 py-1">Complete</span>;
    case 'active':
      return <span className="text-xs bg-primary text-white rounded-full px-2 py-1">Active</span>;
    case 'in-progress':
      return <span className="text-xs bg-warning text-white rounded-full px-2 py-1">In Progress</span>;
    default:
      return <span className="text-xs bg-neutral-400 text-white rounded-full px-2 py-1">Pending</span>;
  }
}