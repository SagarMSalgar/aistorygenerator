import { genAI, MODEL_NAME } from '../utils/ai';

interface DialogueLine {
  character: string;
  text: string;  // Changed from 'line' to 'text' to match schema
  emotion: string;
}

export const dialogueAgent = {
  /**
   * Generates dialogue for the cartoon based on the script and characters
   */
  async generateDialogue(script: string, characters: any) {
    try {
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

      const dialoguePrompt = `
        Based on this script and characters, create natural dialogue:
        
        Script: "${script}"
        
        Characters:
        Main character: ${characters.mainCharacterDescription}
        Supporting characters: ${characters.supportingCharactersDescription}

        Generate a sequence of dialogue lines that:
        1. Advances the story naturally
        2. Matches each character's personality
        3. Sounds conversational
        4. Includes emotional cues

        Format each line as:
        Character: [name]
        Line: [dialogue text]
        Emotion: [emotional state]

        Generate at least 5 lines of dialogue.
      `;

      const result = await model.generateContent(dialoguePrompt);
      const dialogueText = result.response.text();

      // Parse the dialogue lines
      const lines: DialogueLine[] = [];
      const dialogueMatches = dialogueText.matchAll(/Character:\s*([^\n]+)\nLine:\s*([^\n]+)\nEmotion:\s*([^\n]+)/g);

      for (const match of dialogueMatches) {
        lines.push({
          character: match[1].trim(),
          text: match[2].trim(),     // Changed from 'line' to 'text'
          emotion: match[3].trim()
        });
      }

      // Ensure we have at least one line
      if (lines.length === 0) {
        throw new Error('No dialogue lines were generated');
      }

      return {
        lines: lines
      };

    } catch (error) {
      console.error('Error in dialogue generation:', error);
      throw error;
    }
  }
};
