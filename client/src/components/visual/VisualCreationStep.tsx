import { Button } from "@/components/ui/button";
import { useCartoon } from "@/context/CartoonContext";

export default function VisualCreationStep() {
  const { 
    stepStatuses, 
    visuals,
    generateVisuals,
    regenerateVisuals,
    acceptVisuals,
    isLoading
  } = useCartoon();
  
  const isActive = stepStatuses['visuals'] === 'active';
  const isComplete = stepStatuses['visuals'] === 'complete';
  const isInProgress = stepStatuses['visuals'] === 'in-progress';
  const isWaiting = stepStatuses['visuals'] === 'waiting';
  
  const handleGenerate = async () => {
    await generateVisuals();
  };

  const handleRegenerate = async () => {
    await regenerateVisuals();
  };

  const handleAccept = async () => {
    await acceptVisuals();
  };

  return (
    <div className={`bg-white rounded-xl shadow-md p-6 border-2 ${
      isActive ? 'border-primary step-active' : 
      isComplete ? 'border-success step-complete' : 
      'border-neutral-300 step-waiting'
    }`}>
      <div className="flex items-start mb-4">
        <div className={`agent-avatar ${
          isActive || isComplete ? 'bg-primary-light' : 'bg-neutral-200'
        } rounded-full flex items-center justify-center`}>
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
            className={isActive || isComplete ? "text-primary text-2xl" : "text-neutral-500 text-2xl"}
          >
            <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"></path>
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
            <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"></path>
            <path d="M2 7h20"></path>
            <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"></path>
          </svg>
          <div className={`agent-status ${
            isActive ? 'bg-warning' : 
            isComplete ? 'bg-success' : 
            isInProgress ? 'bg-warning' :
            'bg-neutral-400'
          }`}></div>
        </div>
        <div className="ml-4">
          <h3 className="font-sans font-semibold text-lg text-neutral-800">Visual Artist</h3>
          <p className="text-neutral-600 text-sm">Creating cartoon visuals for your story</p>
        </div>
        {(isActive || isComplete) && (
          <div className="ml-auto">
            <button className="text-primary hover:text-primary-dark">
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
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                <path d="m15 5 4 4"></path>
              </svg>
            </button>
          </div>
        )}
      </div>
      
      {isInProgress ? (
        <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50 h-48 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-neutral-600">Generating visuals...</p>
          </div>
        </div>
      ) : visuals ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {visuals.scenes.map((scene, index) => (
            <div key={index} className="border border-neutral-200 rounded-lg p-3 bg-neutral-50">
              <div className="aspect-video rounded-lg bg-neutral-200 overflow-hidden">
                <img 
                  src={scene.imageUrl} 
                  alt={`Scene ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="font-medium text-neutral-700 mt-2">Scene {index + 1}</h4>
              <p className="text-xs text-neutral-500">{scene.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-40 border border-dashed border-neutral-300 rounded-lg bg-neutral-50">
          <div className="text-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="32" 
              height="32" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-neutral-400 mx-auto mb-2"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
              <circle cx="9" cy="9" r="2"></circle>
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
            </svg>
            {isWaiting ? (
              <p className="text-neutral-500">Waiting for previous steps to complete</p>
            ) : (
              <p className="text-neutral-500">No visuals generated yet</p>
            )}
          </div>
        </div>
      )}
      
      <div className="flex justify-end mt-4">
        {visuals ? (
          <>
            <Button 
              variant="outline" 
              className="mr-2"
              onClick={handleRegenerate}
              disabled={isLoading || isInProgress || isWaiting || isComplete}
            >
              Regenerate
            </Button>
            <Button 
              onClick={handleAccept}
              disabled={isLoading || isInProgress || isWaiting || isComplete}
              className={`${isComplete ? 'bg-success hover:bg-success' : ''}`}
            >
              {isComplete ? 'Completed' : 'Accept Visuals'}
            </Button>
          </>
        ) : (
          <Button 
            onClick={handleGenerate}
            disabled={isLoading || isInProgress || isWaiting}
            className={isWaiting ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed' : ''}
          >
            Start Generating
          </Button>
        )}
      </div>
    </div>
  );
}
