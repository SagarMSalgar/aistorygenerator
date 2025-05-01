import { Button } from "@/components/ui/button";
import { useCartoon } from "@/context/CartoonContext";

export default function CharacterCreationStep() {
  const { 
    stepStatuses, 
    characters,
    generateCharacters,
    regenerateCharacters,
    acceptCharacters,
    isLoading
  } = useCartoon();
  
  const isActive = stepStatuses['characters'] === 'active';
  const isComplete = stepStatuses['characters'] === 'complete';
  const isInProgress = stepStatuses['characters'] === 'in-progress';
  const isWaiting = stepStatuses['characters'] === 'waiting';
  
  const handleRegenerate = async () => {
    await regenerateCharacters();
  };

  const handleAccept = async () => {
    await acceptCharacters();
  };

  if (isWaiting) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border-2 border-neutral-300 step-waiting">
        <div className="flex items-start mb-4">
          <div className="agent-avatar bg-neutral-200 rounded-full flex items-center justify-center">
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
              className="text-neutral-500 text-2xl"
            >
              <path d="M9 21c0-5 4-9 9-9"></path>
              <path d="M6.3 21a9 9 0 0 1 13.2-13.2"></path>
              <path d="M9 21c0-4 3-8 8-9"></path>
              <rect width="12" height="12" x="2" y="2" rx="2"></rect>
            </svg>
            <div className="agent-status bg-neutral-400"></div>
          </div>
          <div className="ml-4">
            <h3 className="font-sans font-semibold text-lg text-neutral-800">Character Designer</h3>
            <p className="text-neutral-600 text-sm">Creating characters for your story</p>
          </div>
        </div>
        
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
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <p className="text-neutral-500">Waiting for previous steps to complete</p>
          </div>
        </div>
      </div>
    );
  }

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
            <path d="M9 21c0-5 4-9 9-9"></path>
            <path d="M6.3 21a9 9 0 0 1 13.2-13.2"></path>
            <path d="M9 21c0-4 3-8 8-9"></path>
            <rect width="12" height="12" x="2" y="2" rx="2"></rect>
          </svg>
          <div className={`agent-status ${
            isActive ? 'bg-warning' : 
            isComplete ? 'bg-success' : 
            isInProgress ? 'bg-warning' :
            'bg-neutral-400'
          }`}></div>
        </div>
        <div className="ml-4">
          <h3 className="font-sans font-semibold text-lg text-neutral-800">Character Designer</h3>
          <p className="text-neutral-600 text-sm">Creating characters for your story</p>
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
            <p className="text-neutral-600">Generating characters...</p>
          </div>
        </div>
      ) : characters ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-neutral-200 rounded-lg p-3 bg-neutral-50">
            <div className="aspect-square rounded-lg bg-neutral-200 overflow-hidden">
              <img 
                src={characters.mainCharacterUrl} 
                alt="Main character design" 
                className="w-full h-full object-cover"
              />
            </div>
            <h4 className="font-medium text-neutral-700 mt-2">Main Character</h4>
            <p className="text-xs text-neutral-500">{characters.mainCharacterDescription}</p>
          </div>
          
          <div className="border border-neutral-200 rounded-lg p-3 bg-neutral-50">
            <div className="aspect-square rounded-lg bg-neutral-200 overflow-hidden">
              <img 
                src={characters.supportingCharactersUrl} 
                alt="Supporting characters" 
                className="w-full h-full object-cover"
              />
            </div>
            <h4 className="font-medium text-neutral-700 mt-2">Supporting Characters</h4>
            <p className="text-xs text-neutral-500">{characters.supportingCharactersDescription}</p>
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
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <p className="text-neutral-500">No characters generated yet</p>
          </div>
        </div>
      )}
      
      <div className="flex justify-end mt-4">
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
          disabled={!characters || isLoading || isInProgress || isWaiting || isComplete}
          className={`${isComplete ? 'bg-success hover:bg-success' : ''}`}
        >
          {isComplete ? 'Completed' : 'Accept Characters'}
        </Button>
      </div>
    </div>
  );
}
