import { useCartoon } from "@/context/CartoonContext";
import { Progress } from "@/components/ui/progress";

export default function ProgressTracker() {
  const { currentStep, stepStatuses } = useCartoon();
  
  // Calculate progress percentage
  const totalSteps = Object.keys(stepStatuses).length;
  const completedSteps = Object.values(stepStatuses).filter(status => status === 'complete').length;
  const progressPercentage = (completedSteps / totalSteps) * 100;
  
  // Step data
  const steps = [
    { id: 'user-input', label: 'Input' },
    { id: 'script', label: 'Script' },
    { id: 'characters', label: 'Characters' },
    { id: 'dialogue', label: 'Dialogue' },
    { id: 'visuals', label: 'Visuals' },
    { id: 'music', label: 'Music' },
    { id: 'compilation', label: 'Render' }
  ];

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h2 className="text-xl font-sans font-semibold text-neutral-800">Create Your Personal Cartoon</h2>
        <div className="text-sm text-neutral-500 mt-2 sm:mt-0">
          <span className="font-medium text-primary">{completedSteps} of {totalSteps}</span> steps completed
        </div>
      </div>
      
      <div className="relative">
        <Progress value={progressPercentage} className="mb-4" />
        
        <div className="flex justify-between text-xs text-neutral-500">
          {steps.map((step, index) => {
            const status = stepStatuses[step.id];
            const isComplete = status === 'complete';
            const isActive = status === 'active' || status === 'in-progress';
            
            return (
              <div key={step.id} className="w-1/7 text-center">
                <div 
                  className={`w-4 h-4 rounded-full mx-auto -mt-5 relative z-10 ${
                    isComplete || isActive ? 'bg-primary' : 'bg-neutral-300'
                  }`}
                />
                <span>{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
