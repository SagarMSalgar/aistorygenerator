import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCartoon } from "@/context/CartoonContext";

export default function UserInputStep() {
  const { 
    stepStatuses, 
    userDayDescription,
    setUserDayDescription,
    submitDay,
    isLoading
  } = useCartoon();
  
  const isActive = stepStatuses['user-input'] === 'active';
  const isComplete = stepStatuses['user-input'] === 'complete';
  
  const handleSubmit = async () => {
    await submitDay();
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
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <div className={`agent-status ${
            isActive ? 'bg-warning' : 
            isComplete ? 'bg-success' : 
            'bg-neutral-400'
          }`}></div>
        </div>
        <div className="ml-4">
          <h3 className="font-sans font-semibold text-lg text-neutral-800">Tell us about your day</h3>
          <p className="text-neutral-600 text-sm">Share the highlights of your day and how you felt.</p>
        </div>
      </div>
      
      <Textarea 
        value={userDayDescription}
        onChange={(e) => setUserDayDescription(e.target.value)}
        disabled={isComplete || isLoading}
        className="w-full border border-neutral-300 rounded-lg p-4 h-32 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        placeholder="Today, I woke up feeling energetic. I had a productive meeting at work where my ideas were appreciated. Later, I went for a walk in the park and saw some cute dogs playing. Overall, it was a positive day with small wins!"
      />
      
      <div className="flex justify-between mt-4">
        <div className="text-neutral-500 text-sm">
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
            className="inline-block mr-1 cursor-pointer hover:text-primary"
            title="Record your day"
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" x2="12" y1="19" y2="22"></line>
          </svg>
          <span>or use voice input</span>
        </div>
        <Button 
          onClick={handleSubmit}
          disabled={!userDayDescription.trim() || isComplete || isLoading}
          className={`${isComplete ? 'bg-success hover:bg-success' : ''}`}
        >
          {isLoading ? 'Processing...' : isComplete ? 'Completed' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}
