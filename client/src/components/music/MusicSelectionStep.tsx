import { Button } from "@/components/ui/button";
import { useCartoon } from "@/context/CartoonContext";

export default function MusicSelectionStep() {
  const { 
    stepStatuses, 
    music,
    selectMusic,
    regenerateMusic,
    acceptMusic,
    isLoading
  } = useCartoon();
  
  const isActive = stepStatuses['music'] === 'active';
  const isComplete = stepStatuses['music'] === 'complete';
  const isInProgress = stepStatuses['music'] === 'in-progress';
  const isWaiting = stepStatuses['music'] === 'waiting';
  
  const handleSelect = async () => {
    await selectMusic();
  };

  const handleRegenerate = async () => {
    await regenerateMusic();
  };

  const handleAccept = async () => {
    await acceptMusic();
  };

  const playAudioPreview = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play();
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
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
          <div className={`agent-status ${
            isActive ? 'bg-warning' : 
            isComplete ? 'bg-success' : 
            isInProgress ? 'bg-warning' :
            'bg-neutral-400'
          }`}></div>
        </div>
        <div className="ml-4">
          <h3 className="font-sans font-semibold text-lg text-neutral-800">Music Selector</h3>
          <p className="text-neutral-600 text-sm">Finding the perfect soundtrack</p>
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
            <p className="text-neutral-600">Finding the perfect music...</p>
          </div>
        </div>
      ) : music ? (
        <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
          <h4 className="font-medium text-neutral-800 mb-4">Selected Music</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg bg-white">
              <div>
                <h5 className="font-medium text-neutral-800">{music.title}</h5>
                <p className="text-xs text-neutral-500">{music.artist}</p>
              </div>
              <button 
                onClick={() => playAudioPreview(music.previewUrl)}
                className="text-primary hover:text-primary-dark"
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
                  <circle cx="12" cy="12" r="10"></circle>
                  <polygon points="10 8 16 12 10 16 10 8"></polygon>
                </svg>
              </button>
            </div>
            <div className="text-sm text-neutral-600">
              <span className="font-medium">Genre: </span>{music.genre}
            </div>
            <div className="text-sm text-neutral-600">
              <span className="font-medium">Mood: </span>{music.mood}
            </div>
            <div className="text-sm text-neutral-600">
              <span className="font-medium">License: </span>{music.license}
            </div>
          </div>
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
              <path d="M9 18V5l12-2v13"></path>
              <circle cx="6" cy="18" r="3"></circle>
              <circle cx="18" cy="16" r="3"></circle>
            </svg>
            {isWaiting ? (
              <p className="text-neutral-500">Waiting for previous steps to complete</p>
            ) : (
              <p className="text-neutral-500">No music selected yet</p>
            )}
          </div>
        </div>
      )}
      
      <div className="flex justify-end mt-4">
        {music ? (
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
              {isComplete ? 'Completed' : 'Accept Music'}
            </Button>
          </>
        ) : (
          <Button 
            onClick={handleSelect}
            disabled={isLoading || isInProgress || isWaiting}
            className={isWaiting ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed' : ''}
          >
            Begin Selection
          </Button>
        )}
      </div>
    </div>
  );
}
