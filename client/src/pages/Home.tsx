import Header from "@/components/Header";
import ProgressTracker from "@/components/ProgressTracker";
import UserInputStep from "@/components/user-input/UserInputStep";
import ScriptGenerationStep from "@/components/script/ScriptGenerationStep";
import CharacterCreationStep from "@/components/character/CharacterCreationStep";
import DialogueGenerationStep from "@/components/dialogue/DialogueGenerationStep";
import VisualCreationStep from "@/components/visual/VisualCreationStep";
import MusicSelectionStep from "@/components/music/MusicSelectionStep";
import CompilationStep from "@/components/compilation/CompilationStep";
import PreviewPanel from "@/components/PreviewPanel";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <ProgressTracker />
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column: Steps */}
          <div className="lg:w-7/12 space-y-6">
            <UserInputStep />
            <ScriptGenerationStep />
            <CharacterCreationStep />
            <DialogueGenerationStep />
            <VisualCreationStep />
            <MusicSelectionStep />
            <CompilationStep />
          </div>
          
          {/* Right Column: Preview */}
          <div className="lg:w-5/12">
            <PreviewPanel />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
