import { HfInference } from '@huggingface/inference';
import { ScriptData } from '@shared/schema';

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || "");

export const scriptAgent = {
  /**
   * Generates a script based on the user's day description
   * @param dayDescription - The user's description of their day
   * @returns A script object containing the content and summary
   */
  async generateScript(dayDescription: string): Promise<ScriptData> {
    try {
      // Prompt for script generation
      const prompt = `
        Create a short one-minute animated cartoon script based on this person's day: 
        "${dayDescription}"
        
        The script should have:
        1. A title related to the day's events or mood
        2. 4-5 brief scenes that capture key moments
        3. Clear scene transitions
        4. A beginning, middle, and end structure
        5. A positive or meaningful ending
        
        Format the script with scene headings and brief descriptions of what happens in each scene.
        Also provide a one paragraph summary of the story.
        
        SCRIPT:
      `;

      // Generate script with AI model
      const response = await hf.textGeneration({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.9,
          top_k: 50,
          repetition_penalty: 1.2
        }
      });

      // Extract script content
      const scriptText = response.generated_text;

      // Generate a summary if not already included
      let summary = "";
      
      // Extract summary if it exists
      const summaryMatch = scriptText.match(/Summary:(.+?)(?:\n\n|\n$|$)/s);
      if (summaryMatch && summaryMatch[1]) {
        summary = summaryMatch[1].trim();
      } else {
        // Generate a summary if not found
        const summaryPrompt = `
          Summarize this script in one paragraph:
          "${scriptText}"
        `;

        const summaryResponse = await hf.textGeneration({
          model: 'mistralai/Mistral-7B-Instruct-v0.2',
          inputs: summaryPrompt,
          parameters: {
            max_new_tokens: 150,
            temperature: 0.5
          }
        });

        summary = summaryResponse.generated_text.trim();
      }

      return {
        content: scriptText,
        summary: summary
      };
    } catch (error) {
      console.error('Error in script generation:', error);
      
      // Fallback script in case of API failure
      return {
        content: `Title: "A Day's Journey"\n\nScene 1: Morning Light\nThe day begins with soft sunlight streaming through the window.\n\nScene 2: Daily Challenge\nOur protagonist faces and overcomes a small obstacle.\n\nScene 3: Moment of Joy\nA highlight of the day brings a smile.\n\nScene 4: Reflection\nThe day winds down with a moment of quiet reflection.\n\nScene 5: Tomorrow Awaits\nThe scene closes with anticipation for tomorrow.`,
        summary: "A brief journey through the highs and lows of a single day, celebrating small victories and finding meaning in everyday moments."
      };
    }
  }
};
