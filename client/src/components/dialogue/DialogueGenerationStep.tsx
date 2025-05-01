import { Button } from "@/components/ui/button";
import { useCartoon } from "@/context/CartoonContext";

export default function DialogueGenerationStep() {
  const { 
    stepStatuses, 
    dialogue,
    generateDialogue,
    regenerateDialogue,
    acceptDialogue,
    isLoading
  } = useCartoon();
  
  const isActive = stepStatuses['dialogue'] === 'active';
  const isComplete = stepStatuses['dialogue'] === 'complete';
  const isInProgress = stepStatuses['dialogue'] === 'in-progress';
  const isWaiting = stepStatuses['dialogue'] === 'waiting';
  
  const handleRegenerate = async () => {
    await regenerateDialogue();
  };

  const handleAccept = async () => {
    await acceptDialogue();
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
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <div className="agent-status bg-neutral-400"></div>
          </div>
          <div className="ml-4">
            <h3 className="font-sans font-semibold text-lg text-neutral-800">Dialogue Writer</h3>
            <p className="text-neutral-600 text-sm">Crafting conversations for your characters</p>
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
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
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
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <div className={`agent-status ${
            isActive ? 'bg-warning' : 
            isComplete ? 'bg-success' : 
            isInProgress ? 'bg-warning' :
            'bg-neutral-400'
          }`}></div>
        </div>
        <div className="ml-4">
          <h3 className="font-sans font-semibold text-lg text-neutral-800">Dialogue Writer</h3>
          <p className="text-neutral-600 text-sm">Crafting conversations for your characters</p>
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
            <p className="text-neutral-600">Generating dialogue...</p>
          </div>
        </div>
      ) : dialogue ? (
        <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
          <h4 className="font-medium text-neutral-800 mb-2">Dialogue Sample</h4>
          <div className="text-sm text-neutral-700 space-y-3">
            {dialogue.lines.map((line, index) => (
              <p key={index}>
                <span className="font-medium">{line.character}:</span> "{line.text}"
              </p>
            ))}
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
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <p className="text-neutral-500">No dialogue generated yet</p>
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
          disabled={!dialogue || isLoading || isInProgress || isWaiting || isComplete}
          className={`${isComplete ? 'bg-success hover:bg-success' : ''}`}
        >
          {isComplete ? 'Completed' : 'Accept Dialogue'}
        </Button>
      </div>
    </div>
  );
}
