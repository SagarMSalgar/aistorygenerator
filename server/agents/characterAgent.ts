import { HfInference } from '@huggingface/inference';
import { nanoid } from 'nanoid';
import fs from 'fs/promises';
import path from 'path';

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || "");

// Function to save base64 image
async function saveBase64Image(base64String: string, fileName: string): Promise<string> {
  try {
    // Remove data:image/jpeg;base64, part if present
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
    
    // Create directory if it doesn't exist
    const outputDir = path.resolve('dist/public/generated');
    await fs.mkdir(outputDir, { recursive: true });
    
    const filePath = path.join(outputDir, fileName);
    await fs.writeFile(filePath, base64Data, { encoding: 'base64' });
    
    // Return the public URL
    return `/generated/${fileName}`;
  } catch (error) {
    console.error('Error saving image:', error);
    throw error;
  }
}

export const characterAgent = {
  /**
   * Generates cartoon character designs based on the script
   */
  async generateCharacters(script: string) {
    try {
      // Extract character descriptions from script
      const characterPrompt = `
        Based on this script:
        "${script}"
        
        Extract a detailed description of:
        1. The main character (appearance, personality, style)
        2. Any supporting characters (appearance, personality, style)
        
        Format as:
        Main character: [description]
        Supporting characters: [description]
      `;

      const characterResponse = await hf.textGeneration({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        inputs: characterPrompt,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.7
        }
      });

      // Parse character descriptions
      const characterText = characterResponse.generated_text;
      
      // Extract main character description
      const mainCharMatch = characterText.match(/Main character:(.+?)(?:Supporting characters:|$)/s);
      const mainCharDescription = mainCharMatch 
        ? mainCharMatch[1].trim() 
        : "A relatable protagonist with an expressive face";
      
      // Extract supporting characters description
      const supportingMatch = characterText.match(/Supporting characters:(.+?)$/s);
      const supportingCharactersDescription = supportingMatch 
        ? supportingMatch[1].trim() 
        : "Various friends, colleagues, and passersby that interact with the main character";

      // Generate main character image
      const mainCharPrompt = `
        Create a cartoon character design for: ${mainCharDescription}
        Style: Friendly, modern cartoon with simple lines and vibrant colors
        Perspective: Front-facing portrait showing head and shoulders
        Background: Simple, solid color background
      `;

      const mainCharImageResponse = await hf.textToImage({
        model: "stabilityai/stable-diffusion-2",
        inputs: mainCharPrompt,
        parameters: {
          negative_prompt: "realistic, photograph, 3d, detailed, ugly, deformed, low quality"
        }
      });

      // Save main character image
      const mainCharImageId = nanoid(8);
      const mainCharImagePath = await saveBase64Image(
        Buffer.from(await mainCharImageResponse.arrayBuffer()).toString('base64'),
        `main-char-${mainCharImageId}.png`
      );

      // Generate supporting characters image
      const supportingPrompt = `
        Create a cartoon illustration of: ${supportingCharactersDescription}
        Style: Friendly, modern cartoon with simple lines and vibrant colors
        Perspective: Group shot showing multiple characters
        Background: Simple, solid color background
      `;

      const supportingImageResponse = await hf.textToImage({
        model: "stabilityai/stable-diffusion-2",
        inputs: supportingPrompt,
        parameters: {
          negative_prompt: "realistic, photograph, 3d, detailed, ugly, deformed, low quality"
        }
      });

      // Save supporting characters image
      const supportingImageId = nanoid(8);
      const supportingImagePath = await saveBase64Image(
        Buffer.from(await supportingImageResponse.arrayBuffer()).toString('base64'),
        `supporting-chars-${supportingImageId}.png`
      );

      // Prepare domain for complete URLs
      const domain = process.env.REPLIT_DOMAINS 
        ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` 
        : 'http://localhost:5000';

      return {
        mainCharacterUrl: `${domain}${mainCharImagePath}`,
        mainCharacterDescription: mainCharDescription,
        supportingCharactersUrl: `${domain}${supportingImagePath}`,
        supportingCharactersDescription: supportingCharactersDescription
      };
    } catch (error) {
      console.error('Error in character generation:', error);
      
      // Fallback values in case of API failure
      const domain = process.env.REPLIT_DOMAINS 
        ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` 
        : 'http://localhost:5000';
        
      return {
        mainCharacterUrl: `${domain}/generated/fallback-main-character.svg`,
        mainCharacterDescription: "A relatable protagonist with an expressive face",
        supportingCharactersUrl: `${domain}/generated/fallback-supporting-characters.svg`,
        supportingCharactersDescription: "Various friends, colleagues, and passersby that interact with the main character"
      };
    }
  }
};
