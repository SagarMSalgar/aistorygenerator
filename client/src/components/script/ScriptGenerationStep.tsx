import { Button } from "@/components/ui/button";
import { useCartoon } from "@/context/CartoonContext";

export default function ScriptGenerationStep() {
  const { 
    stepStatuses, 
    script,
    regenerateScript,
    acceptScript,
    isLoading
  } = useCartoon();
  
  const isActive = stepStatuses['script'] === 'active';
  const isComplete = stepStatuses['script'] === 'complete';
  const isInProgress = stepStatuses['script'] === 'in-progress';
  const isWaiting = stepStatuses['script'] === 'waiting';
  
  const handleRegenerate = async () => {
    await regenerateScript();
  };

  const handleAccept = async () => {
    await acceptScript();
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
              <path d="M17 22h-1a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h1"></path>
              <path d="M7 22h1a4 4 0 0 0 4-4v-1"></path>
              <path d="M7 2h1a4 4 0 0 1 4 4v1"></path>
              <circle cx="17" cy="17" r="1"></circle>
              <circle cx="7" cy="17" r="1"></circle>
              <circle cx="7" cy="7" r="1"></circle>
            </svg>
            <div className="agent-status bg-neutral-400"></div>
          </div>
          <div className="ml-4">
            <h3 className="font-sans font-semibold text-lg text-neutral-800">Script Generator</h3>
            <p className="text-neutral-600 text-sm">Creating a storyline based on your day</p>
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
              <path d="M17 22h-1a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h1"></path>
              <path d="M7 22h1a4 4 0 0 0 4-4v-1"></path>
              <path d="M7 2h1a4 4 0 0 1 4 4v1"></path>
              <circle cx="17" cy="17" r="1"></circle>
              <circle cx="7" cy="17" r="1"></circle>
              <circle cx="7" cy="7" r="1"></circle>
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
            <path d="M17 22h-1a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h1"></path>
            <path d="M7 22h1a4 4 0 0 0 4-4v-1"></path>
            <path d="M7 2h1a4 4 0 0 1 4 4v1"></path>
            <circle cx="17" cy="17" r="1"></circle>
            <circle cx="7" cy="17" r="1"></circle>
            <circle cx="7" cy="7" r="1"></circle>
          </svg>
          <div className={`agent-status ${
            isActive ? 'bg-warning' : 
            isComplete ? 'bg-success' : 
            isInProgress ? 'bg-warning' :
            'bg-neutral-400'
          }`}></div>
        </div>
        <div className="ml-4">
          <h3 className="font-sans font-semibold text-lg text-neutral-800">Script Generator</h3>
          <p className="text-neutral-600 text-sm">Creating a storyline based on your day</p>
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
            <p className="text-neutral-600">Generating script...</p>
          </div>
        </div>
      ) : script ? (
        <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
          <h4 className="font-medium text-neutral-800 mb-2">Generated Script</h4>
          <div className="text-sm text-neutral-700 whitespace-pre-line">
            {script.content}
          </div>
        </div>
      ) : (
        <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50 h-48 flex items-center justify-center">
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
              <path d="M17 22h-1a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h1"></path>
              <path d="M7 22h1a4 4 0 0 0 4-4v-1"></path>
              <path d="M7 2h1a4 4 0 0 1 4 4v1"></path>
              <circle cx="17" cy="17" r="1"></circle>
              <circle cx="7" cy="17" r="1"></circle>
              <circle cx="7" cy="7" r="1"></circle>
            </svg>
            <p className="text-neutral-500">No script generated yet</p>
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
          disabled={!script || isLoading || isInProgress || isWaiting || isComplete}
          className={`${isComplete ? 'bg-success hover:bg-success' : ''}`}
        >
          {isComplete ? 'Completed' : 'Accept Script'}
        </Button>
      </div>
    </div>
  );
}
