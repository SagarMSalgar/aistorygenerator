import { 
  createContext, 
  useContext, 
  useState, 
  ReactNode, 
  useCallback 
} from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  CartoonProject, 
  StepStatus,
  ProjectStatus, 
  ScriptData, 
  CharacterData, 
  DialogueData, 
  VisualData, 
  MusicData, 
  VideoData 
} from "@shared/schema";

type CartoonContextType = {
  currentStep: number;
  stepStatuses: Record<string, StepStatus>;
  userDayDescription: string;
  setUserDayDescription: (description: string) => void;
  script: ScriptData | null;
  characters: CharacterData | null;
  dialogue: DialogueData | null;
  visuals: VisualData | null;
  music: MusicData | null;
  finalVideo: VideoData | null;
  projectId: number | null;
  isLoading: boolean;
  submitDay: () => Promise<void>;
  generateScript: () => Promise<void>;
  regenerateScript: () => Promise<void>;
  acceptScript: () => Promise<void>;
  generateCharacters: () => Promise<void>;
  regenerateCharacters: () => Promise<void>;
  acceptCharacters: () => Promise<void>;
  generateDialogue: () => Promise<void>;
  regenerateDialogue: () => Promise<void>;
  acceptDialogue: () => Promise<void>;
  generateVisuals: () => Promise<void>;
  regenerateVisuals: () => Promise<void>;
  acceptVisuals: () => Promise<void>;
  selectMusic: () => Promise<void>;
  regenerateMusic: () => Promise<void>;
  acceptMusic: () => Promise<void>;
  compileVideo: () => Promise<void>;
  saveProject: () => Promise<void>;
  shareProject: () => Promise<void>;
};

const CartoonContext = createContext<CartoonContextType | undefined>(undefined);

type CartoonProviderProps = {
  children: ReactNode;
};

export function CartoonProvider({ children }: CartoonProviderProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [userDayDescription, setUserDayDescription] = useState("");
  const [projectId, setProjectId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Generated content
  const [script, setScript] = useState<ScriptData | null>(null);
  const [characters, setCharacters] = useState<CharacterData | null>(null);
  const [dialogue, setDialogue] = useState<DialogueData | null>(null);
  const [visuals, setVisuals] = useState<VisualData | null>(null);
  const [music, setMusic] = useState<MusicData | null>(null);
  const [finalVideo, setFinalVideo] = useState<VideoData | null>(null);
  
  // Step statuses
  const [stepStatuses, setStepStatuses] = useState<Record<string, StepStatus>>({
    'user-input': 'active',
    'script': 'waiting',
    'characters': 'waiting',
    'dialogue': 'waiting',
    'visuals': 'waiting',
    'music': 'waiting',
    'compilation': 'waiting'
  });

  const updateStepStatus = useCallback((stepId: string, status: StepStatus) => {
    setStepStatuses(prev => ({
      ...prev,
      [stepId]: status
    }));
  }, []);

  const advanceToNextStep = useCallback(() => {
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    
    // Update statuses
    const stepIds = Object.keys(stepStatuses);
    
    // Mark current step as complete
    if (currentStep <= stepIds.length) {
      updateStepStatus(stepIds[currentStep - 1], 'complete');
    }
    
    // Mark next step as active if it exists
    if (nextStep <= stepIds.length) {
      updateStepStatus(stepIds[nextStep - 1], 'active');
    }
  }, [currentStep, stepStatuses, updateStepStatus]);

  // Step 1: Submit user's day description
  const submitDay = async () => {
    if (!userDayDescription.trim()) {
      toast({
        title: "Error",
        description: "Please describe your day before continuing.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Create a new project
      const res = await apiRequest('POST', '/api/projects', { 
        dayDescription: userDayDescription,
        status: 'in_progress' as ProjectStatus
      });
      
      const data = await res.json();
      setProjectId(data.id);
      
      updateStepStatus('user-input', 'complete');
      updateStepStatus('script', 'active');
      setCurrentStep(2);
      
      // Auto-generate script
      await generateScript();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit your day description. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Generate script
  const generateScript = async () => {
    if (!projectId) return;
    
    try {
      setIsLoading(true);
      updateStepStatus('script', 'in-progress');
      
      const res = await apiRequest('POST', `/api/projects/${projectId}/script`, {
        dayDescription: userDayDescription
      });
      
      const scriptData = await res.json();
      setScript(scriptData);
      
      updateStepStatus('script', 'active');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate script. Please try again.",
        variant: "destructive"
      });
      updateStepStatus('script', 'active');
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateScript = async () => {
    await generateScript();
  };

  const acceptScript = async () => {
    if (!script) {
      toast({
        title: "Error",
        description: "No script to accept. Please generate one first.",
        variant: "destructive"
      });
      return;
    }

    advanceToNextStep();
    generateCharacters();
  };

  // Step 3: Generate characters
  const generateCharacters = async () => {
    if (!projectId || !script) return;
    
    try {
      setIsLoading(true);
      updateStepStatus('characters', 'in-progress');
      
      const res = await apiRequest('POST', `/api/projects/${projectId}/characters`, {
        script: script.content
      });
      
      const characterData = await res.json();
      setCharacters(characterData);
      
      updateStepStatus('characters', 'active');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate characters. Please try again.",
        variant: "destructive"
      });
      updateStepStatus('characters', 'active');
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateCharacters = async () => {
    await generateCharacters();
  };

  const acceptCharacters = async () => {
    if (!characters) {
      toast({
        title: "Error",
        description: "No characters to accept. Please generate them first.",
        variant: "destructive"
      });
      return;
    }

    advanceToNextStep();
    generateDialogue();
  };

  // Step 4: Generate dialogue
  const generateDialogue = async () => {
    if (!projectId || !script || !characters) return;
    
    try {
      setIsLoading(true);
      updateStepStatus('dialogue', 'in-progress');
      
      const res = await apiRequest('POST', `/api/projects/${projectId}/dialogue`, {
        script: script.content,
        characters: characters
      });
      
      const dialogueData = await res.json();
      setDialogue(dialogueData);
      
      updateStepStatus('dialogue', 'active');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate dialogue. Please try again.",
        variant: "destructive"
      });
      updateStepStatus('dialogue', 'active');
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateDialogue = async () => {
    await generateDialogue();
  };

  const acceptDialogue = async () => {
    if (!dialogue) {
      toast({
        title: "Error",
        description: "No dialogue to accept. Please generate it first.",
        variant: "destructive"
      });
      return;
    }

    advanceToNextStep();
    generateVisuals();
  };

  // Step 5: Generate visuals
  const generateVisuals = async () => {
    if (!projectId || !script || !characters || !dialogue) return;
    
    try {
      setIsLoading(true);
      updateStepStatus('visuals', 'in-progress');
      
      const res = await apiRequest('POST', `/api/projects/${projectId}/visuals`, {
        script: script.content,
        characters: characters,
        dialogue: dialogue
      });
      
      const visualData = await res.json();
      setVisuals(visualData);
      
      updateStepStatus('visuals', 'active');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate visuals. Please try again.",
        variant: "destructive"
      });
      updateStepStatus('visuals', 'active');
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateVisuals = async () => {
    await generateVisuals();
  };

  const acceptVisuals = async () => {
    if (!visuals) {
      toast({
        title: "Error",
        description: "No visuals to accept. Please generate them first.",
        variant: "destructive"
      });
      return;
    }

    advanceToNextStep();
    selectMusic();
  };

  // Step 6: Select music
  const selectMusic = async () => {
    if (!projectId || !script) return;
    
    try {
      setIsLoading(true);
      updateStepStatus('music', 'in-progress');
      
      const res = await apiRequest('POST', `/api/projects/${projectId}/music`, {
        script: script.content
      });
      
      const musicData = await res.json();
      setMusic(musicData);
      
      updateStepStatus('music', 'active');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to select music. Please try again.",
        variant: "destructive"
      });
      updateStepStatus('music', 'active');
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateMusic = async () => {
    await selectMusic();
  };

  const acceptMusic = async () => {
    if (!music) {
      toast({
        title: "Error",
        description: "No music to accept. Please select it first.",
        variant: "destructive"
      });
      return;
    }

    advanceToNextStep();
    compileVideo();
  };

  // Step 7: Compile final video
  const compileVideo = async () => {
    if (!projectId || !script || !characters || !dialogue || !visuals || !music) return;
    
    try {
      setIsLoading(true);
      updateStepStatus('compilation', 'in-progress');
      
      const res = await apiRequest('POST', `/api/projects/${projectId}/video`, {
        script: script,
        characters: characters,
        dialogue: dialogue,
        visuals: visuals,
        music: music
      });
      
      const videoData = await res.json();
      setFinalVideo(videoData);
      
      updateStepStatus('compilation', 'complete');
      
      // Update project status
      await apiRequest('PATCH', `/api/projects/${projectId}`, {
        status: 'completed' as ProjectStatus
      });
      
      toast({
        title: "Success",
        description: "Your cartoon has been created successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to compile video. Please try again.",
        variant: "destructive"
      });
      updateStepStatus('compilation', 'active');
    } finally {
      setIsLoading(false);
    }
  };

  // Save project
  const saveProject = async () => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "No project to save. Please start by describing your day.",
        variant: "destructive"
      });
      return;
    }

    try {
      await apiRequest('PATCH', `/api/projects/${projectId}`, {
        status: 'saved' as ProjectStatus
      });
      
      toast({
        title: "Success",
        description: "Your project has been saved successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save project. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Share project
  const shareProject = async () => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "No project to share. Please start by describing your day.",
        variant: "destructive"
      });
      return;
    }

    try {
      await apiRequest('PATCH', `/api/projects/${projectId}`, {
        isPublic: true
      });
      
      // Get shareable link
      const res = await apiRequest('GET', `/api/projects/${projectId}/share`, {});
      const { shareUrl } = await res.json();
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      
      toast({
        title: "Success",
        description: "Share link copied to clipboard!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share project. Please try again.",
        variant: "destructive"
      });
    }
  };

  const value = {
    currentStep,
    stepStatuses,
    userDayDescription,
    setUserDayDescription,
    script,
    characters,
    dialogue,
    visuals,
    music,
    finalVideo,
    projectId,
    isLoading,
    submitDay,
    generateScript,
    regenerateScript,
    acceptScript,
    generateCharacters,
    regenerateCharacters,
    acceptCharacters,
    generateDialogue,
    regenerateDialogue,
    acceptDialogue,
    generateVisuals,
    regenerateVisuals,
    acceptVisuals,
    selectMusic,
    regenerateMusic,
    acceptMusic,
    compileVideo,
    saveProject,
    shareProject
  };

  return (
    <CartoonContext.Provider value={value}>
      {children}
    </CartoonContext.Provider>
  );
}

export function useCartoon() {
  const context = useContext(CartoonContext);
  if (context === undefined) {
    throw new Error("useCartoon must be used within a CartoonProvider");
  }
  return context;
}
