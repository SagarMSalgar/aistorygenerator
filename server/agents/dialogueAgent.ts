import { HfInference } from '@huggingface/inference';
import { DialogueLine } from '@shared/schema';

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || "");

export const dialogueAgent = {
  /**
   * Generates dialogue for the cartoon based on the script and characters
   */
  async generateDialogue(script: string, characters: any) {
    try {
      // Create a dialogue prompt based on script and characters
      const dialoguePrompt = `
        Based on this script:
        "${script}"
        
        And these characters:
        Main character: ${characters.mainCharacterDescription}
        Supporting characters: ${characters.supportingCharactersDescription}
        
        Write a natural, conversational dialogue for a 1-minute cartoon (about 10-15 lines total).
        Include:
        - Character speech that reveals personality
        - A mix of questions, statements, and reactions
        - Natural flow between speakers
        - A narrator voice if needed
        
        Format each line as:
        CHARACTER NAME: "Dialogue text"
        
        For example:
        MAIN CHARACTER: "What a beautiful day!"
        FRIEND: "It sure is! How have you been?"
      `;

      const dialogueResponse = await hf.textGeneration({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        inputs: dialoguePrompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.9,
          repetition_penalty: 1.1
        }
      });

      // Process the dialogue text into structured format
      const dialogueText = dialogueResponse.generated_text;
      
      // Parse dialogue lines
      const dialogueRegex = /([A-Z\s]+):(?:\s+)"([^"]+)"/g;
      const lines: DialogueLine[] = [];
      
      let match;
      while ((match = dialogueRegex.exec(dialogueText)) !== null) {
        lines.push({
          character: match[1].trim(),
          text: match[2].trim()
        });
      }
      
      // If no lines were parsed correctly, create a fallback
      if (lines.length === 0) {
        // Attempt a simpler parsing approach
        const simpleSplit = dialogueText.split('\n')
          .filter(line => line.includes(':'))
          .map(line => {
            const [character, text] = line.split(':', 2);
            return {
              character: character.trim().replace(/[^A-Za-z\s]/g, ''),
              text: text.trim().replace(/^["']|["']$/g, '')
            };
          })
          .filter(line => line.character && line.text);
          
        if (simpleSplit.length > 0) {
          return { lines: simpleSplit };
        }
          
        // If still no lines, use fallback
        return {
          lines: [
            { character: "MAIN CHARACTER", text: "Today started out so ordinary, but it turned into something special." },
            { character: "FRIEND", text: "How so? What happened?" },
            { character: "MAIN CHARACTER", text: "It's the little things that made the difference." },
            { character: "BOSS", text: "Your ideas in the meeting today were exactly what we needed." },
            { character: "MAIN CHARACTER", text: "Thanks! I've been thinking about that problem for a while." },
            { character: "STRANGER", text: "Those dogs are so playful! They always live in the moment." },
            { character: "MAIN CHARACTER", text: "That's what I need to learn from them - appreciating the present." },
            { character: "NARRATOR", text: "And sometimes, the smallest victories are the ones worth celebrating the most." }
          ]
        };
      }

      return { lines };
    } catch (error) {
      console.error('Error in dialogue generation:', error);
      
      // Fallback dialogue in case of API failure
      return {
        lines: [
          { character: "MAIN CHARACTER", text: "Today started out so ordinary, but it turned into something special." },
          { character: "FRIEND", text: "How so? What happened?" },
          { character: "MAIN CHARACTER", text: "It's the little things that made the difference." },
          { character: "BOSS", text: "Your ideas in the meeting today were exactly what we needed." },
          { character: "MAIN CHARACTER", text: "Thanks! I've been thinking about that problem for a while." },
          { character: "STRANGER", text: "Those dogs are so playful! They always live in the moment." },
          { character: "MAIN CHARACTER", text: "That's what I need to learn from them - appreciating the present." },
          { character: "NARRATOR", text: "And sometimes, the smallest victories are the ones worth celebrating the most." }
        ]
      };
    }
  }
};
