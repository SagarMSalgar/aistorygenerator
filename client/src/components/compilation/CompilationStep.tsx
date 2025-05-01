import { Button } from "@/components/ui/button";
import { useCartoon } from "@/context/CartoonContext";

export default function CompilationStep() {
  const { 
    stepStatuses, 
    finalVideo,
    compileVideo,
    isLoading
  } = useCartoon();
  
  const isActive = stepStatuses['compilation'] === 'active';
  const isComplete = stepStatuses['compilation'] === 'complete';
  const isInProgress = stepStatuses['compilation'] === 'in-progress';
  const isWaiting = stepStatuses['compilation'] === 'waiting';
  
  const handleCompile = async () => {
    await compileVideo();
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
            <path d="m17 2 4 4-4 4"></path>
            <path d="M3 11v-1a4 4 0 0 1 4-4h14"></path>
            <path d="m7 22-4-4 4-4"></path>
            <path d="M21 13v1a4 4 0 0 1-4 4H3"></path>
          </svg>
          <div className={`agent-status ${
            isActive ? 'bg-warning' : 
            isComplete ? 'bg-success' : 
            isInProgress ? 'bg-warning' :
            'bg-neutral-400'
          }`}></div>
        </div>
        <div className="ml-4">
          <h3 className="font-sans font-semibold text-lg text-neutral-800">Video Composer</h3>
          <p className="text-neutral-600 text-sm">Assembling your one-minute cartoon</p>
        </div>
      </div>
      
      {isInProgress ? (
        <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50 h-48 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-neutral-600">Compiling your cartoon video...</p>
            <p className="text-xs text-neutral-500 mt-2">This may take a minute or two.</p>
          </div>
        </div>
      ) : finalVideo ? (
        <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
          <h4 className="font-medium text-neutral-800 mb-2">Video Ready!</h4>
          <div className="aspect-video rounded-lg bg-neutral-900 overflow-hidden mb-3">
            {finalVideo.url && (
              <video 
                src={finalVideo.url} 
                controls 
                poster={finalVideo.thumbnailUrl}
                className="w-full h-full object-contain"
              />
            )}
          </div>
          <div className="flex justify-between items-center">
            <div className="text-sm text-neutral-600">
              <span className="font-medium">Duration: </span>{finalVideo.duration}
            </div>
            <a 
              href={finalVideo.url} 
              download="my-cartoon.mp4"
              className="text-primary hover:text-primary-dark text-sm"
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
                className="inline-block mr-1"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" x2="12" y1="15" y2="3"></line>
              </svg>
              Download
            </a>
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
              <path d="m17 2 4 4-4 4"></path>
              <path d="M3 11v-1a4 4 0 0 1 4-4h14"></path>
              <path d="m7 22-4-4 4-4"></path>
              <path d="M21 13v1a4 4 0 0 1-4 4H3"></path>
            </svg>
            {isWaiting ? (
              <p className="text-neutral-500">Waiting for all assets to be ready</p>
            ) : (
              <p className="text-neutral-500">Ready to compile your video</p>
            )}
          </div>
        </div>
      )}
      
      <div className="flex justify-end mt-4">
        <Button 
          onClick={handleCompile}
          disabled={isLoading || isInProgress || isWaiting || isComplete}
          className={`
            ${isComplete ? 'bg-success hover:bg-success' : ''} 
            ${isWaiting ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed' : ''}
          `}
        >
          {isComplete ? 'Completed' : 'Compile Video'}
        </Button>
      </div>
    </div>
  );
}
