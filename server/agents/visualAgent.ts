import { HfInference } from '@huggingface/inference';
import { nanoid } from 'nanoid';
import fs from 'fs/promises';
import path from 'path';
import { SceneData } from '@shared/schema';

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

export const visualAgent = {
  /**
   * Generates visual scenes for the cartoon based on script, characters, and dialogue
   */
  async generateVisuals(script: string, characters: any, dialogue: any) {
    try {
      // Extract scenes from script
      const sceneExtractionPrompt = `
        Extract 4 key scenes from this script:
        "${script}"
        
        For each scene, provide:
        1. The setting/location
        2. The characters present
        3. What is happening
        4. The mood/atmosphere
        
        Format:
        Scene 1: [detailed description]
        Scene 2: [detailed description]
        Scene 3: [detailed description]
        Scene 4: [detailed description]
      `;

      const sceneResponse = await hf.textGeneration({
        model: 'gpt2',
        inputs: sceneExtractionPrompt,
        parameters: {
          max_new_tokens: 400,
          temperature: 0.7
        }
      });

      const sceneText = sceneResponse.generated_text;
      
      // Parse scene descriptions
      const sceneRegex = /Scene (\d+): (.+?)(?=Scene \d+:|$)/gs;
      const sceneDescriptions: string[] = [];
      
      let match;
      while ((match = sceneRegex.exec(sceneText)) !== null) {
        sceneDescriptions.push(match[2].trim());
      }
      
      // If no scenes were found, create default scenes
      if (sceneDescriptions.length === 0) {
        sceneDescriptions.push(
          "Morning scene with the main character waking up and starting their day.",
          "Office or work environment with the main character interacting with colleagues.",
          "Park scene with the main character observing dogs playing and people enjoying nature.",
          "Evening reflection scene with the main character feeling content about their day."
        );
      }
      
      // Ensure we have at least 4 scenes
      while (sceneDescriptions.length < 4) {
        sceneDescriptions.push(`Additional scene with the main character continuing their day.`);
      }
      
      // Generate visuals for each scene
      const scenes: SceneData[] = [];
      const characterStyle = "cartoon style, simple, colorful, clean lines";
      
      for (let i = 0; i < sceneDescriptions.length; i++) {
        const scenePrompt = `
          Create a cartoon scene:
          ${sceneDescriptions[i]}
          
          Character design:
          ${characters.mainCharacterDescription}
          
          Style: ${characterStyle}
          Mood: Positive, uplifting
          Perspective: Wide shot showing the environment and characters
          Background: Detailed but not overwhelming
        `;

        const imageResponse = await hf.textToImage({
          model: "stabilityai/stable-diffusion-2",
          inputs: scenePrompt,
          parameters: {
            negative_prompt: "realistic, photograph, 3d, detailed, ugly, deformed, low quality, text, watermark"
          }
        });

        // Save scene image
        const sceneImageId = nanoid(8);
        const sceneImagePath = await saveBase64Image(
          Buffer.from(await imageResponse.arrayBuffer()).toString('base64'),
          `scene-${i+1}-${sceneImageId}.png`
        );

        // Use relative URLs
        scenes.push({
          imageUrl: `${sceneImagePath}`,
          description: sceneDescriptions[i]
        });
      }

      return { scenes };
    } catch (error) {
      console.error('Error in visual generation:', error);
      
      // Fallback visuals in case of API failure - using relative URLs
      return {
        scenes: [
          {
            imageUrl: `/generated/fallback-scene-1.svg`,
            description: "Morning scene with the main character waking up and starting their day."
          },
          {
            imageUrl: `/generated/fallback-scene-2.svg`,
            description: "Office or work environment with the main character interacting with colleagues."
          },
          {
            imageUrl: `/generated/fallback-scene-3.svg`,
            description: "Park scene with the main character observing dogs playing and people enjoying nature."
          },
          {
            imageUrl: `/generated/fallback-scene-4.svg`,
            description: "Evening reflection scene with the main character feeling content about their day."
          }
        ]
      };
    }
  }
};
