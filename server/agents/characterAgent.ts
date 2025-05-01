import { HfInference } from '@huggingface/inference';
import { nanoid } from 'nanoid';
import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || "");

// Stability API key for direct API calls
const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
const STABILITY_API_HOST = 'https://api.stability.ai';

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

// Function to save binary image
async function saveBinaryImage(imageBuffer: Buffer, fileName: string): Promise<string> {
  try {
    // Create directory if it doesn't exist
    const outputDir = path.resolve('dist/public/generated');
    await fs.mkdir(outputDir, { recursive: true });
    
    const filePath = path.join(outputDir, fileName);
    await fs.writeFile(filePath, imageBuffer);
    
    // Return the public URL
    return `/generated/${fileName}`;
  } catch (error) {
    console.error('Error saving binary image:', error);
    throw error;
  }
}

// Function to generate an image using Stability AI
async function generateStabilityImage(prompt: string, negativePrompt: string = ""): Promise<Buffer> {
  if (!STABILITY_API_KEY) {
    throw new Error("Missing Stability API key");
  }

  const engineId = "stable-diffusion-xl-1024-v1-0";
  const apiHost = STABILITY_API_HOST;

  const response = await fetch(
    `${apiHost}/v1/generation/${engineId}/text-to-image`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${STABILITY_API_KEY}`,
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: prompt,
            weight: 1.0,
          },
          {
            text: negativePrompt,
            weight: -1.0,
          },
        ],
        cfg_scale: 7.0,
        height: 1024,
        width: 1024,
        steps: 30,
        samples: 1,
        style_preset: "animation",
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Stability API error: ${response.statusText}`);
  }

  const responseJSON = await response.json() as { artifacts: Array<{ base64: string }> };
  const base64Image = responseJSON.artifacts[0].base64;
  return Buffer.from(base64Image, 'base64');
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
        model: 'gpt2',
        inputs: characterPrompt,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.7
        }
      });

      // Parse character descriptions
      const characterText = characterResponse.generated_text;
      
      // Extract main character description using basic string operations
      const mainCharStart = characterText.indexOf("Main character:");
      const supportingStart = characterText.indexOf("Supporting characters:");
      
      let mainCharDescription = "A relatable protagonist with an expressive face";
      let supportingCharactersDescription = "Various friends, colleagues, and passersby that interact with the main character";
      
      if (mainCharStart >= 0) {
        if (supportingStart >= 0) {
          mainCharDescription = characterText.substring(mainCharStart + 15, supportingStart).trim();
        } else {
          mainCharDescription = characterText.substring(mainCharStart + 15).trim();
        }
      }
      
      if (supportingStart >= 0) {
        supportingCharactersDescription = characterText.substring(supportingStart + 22).trim();
      }

      // Generate main character image using Stability AI
      const mainCharPrompt = `
        Create a cartoon character design for: ${mainCharDescription}
        Style: Friendly, modern cartoon with simple lines and vibrant colors
        Perspective: Front-facing portrait showing head and shoulders
        Background: Simple, solid color background
      `;
      
      const negativePrompt = "realistic, photograph, 3d, detailed, ugly, deformed, low quality, low resolution, bad anatomy, worst quality, text, watermark";
      
      let mainCharImagePath;
      let supportingImagePath;
      
      // Try to use Stability AI first
      try {
        console.log("Generating main character image with Stability AI...");
        
        // Generate main character image with Stability
        const mainCharImage = await generateStabilityImage(
          mainCharPrompt,
          negativePrompt
        );
        
        // Save main character image
        const mainCharImageId = nanoid(8);
        mainCharImagePath = await saveBinaryImage(
          mainCharImage,
          `main-char-${mainCharImageId}.png`
        );
        
        // Generate supporting characters image
        const supportingPrompt = `
          Create a cartoon illustration of: ${supportingCharactersDescription}
          Style: Friendly, modern cartoon with simple lines and vibrant colors
          Perspective: Group shot showing multiple characters
          Background: Simple, solid color background
        `;
        
        console.log("Generating supporting characters image with Stability AI...");
        
        // Generate supporting characters with Stability
        const supportingImage = await generateStabilityImage(
          supportingPrompt,
          negativePrompt
        );
        
        // Save supporting characters image
        const supportingImageId = nanoid(8);
        supportingImagePath = await saveBinaryImage(
          supportingImage,
          `supporting-chars-${supportingImageId}.png`
        );
      } catch (stabError) {
        console.error("Stability AI error, falling back to Hugging Face:", stabError);
        
        // Fall back to Hugging Face
        try {
          const mainCharImageResponse = await hf.textToImage({
            model: "stabilityai/stable-diffusion-2",
            inputs: mainCharPrompt,
            parameters: {
              negative_prompt: "realistic, photograph, 3d, detailed, ugly, deformed, low quality"
            }
          });
          
          // Save main character image
          const mainCharImageId = nanoid(8);
          mainCharImagePath = await saveBase64Image(
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
          supportingImagePath = await saveBase64Image(
            Buffer.from(await supportingImageResponse.arrayBuffer()).toString('base64'),
            `supporting-chars-${supportingImageId}.png`
          );
        } catch (hfError) {
          console.error("Hugging Face error, using fallback:", hfError);
          throw hfError; // Re-throw to use fallback assets
        }
      }
      
      // Return the character data
      return {
        mainCharacterUrl: mainCharImagePath,
        mainCharacterDescription: mainCharDescription,
        supportingCharactersUrl: supportingImagePath,
        supportingCharactersDescription: supportingCharactersDescription
      };
    } catch (error) {
      console.error('Error in character generation:', error);
      
      // Fallback values in case of API failure with relative URLs
      return {
        mainCharacterUrl: `/generated/fallback-main-character.svg`,
        mainCharacterDescription: "A relatable protagonist with an expressive face",
        supportingCharactersUrl: `/generated/fallback-supporting-characters.svg`,
        supportingCharactersDescription: "Various friends, colleagues, and passersby that interact with the main character"
      };
    }
  }
};