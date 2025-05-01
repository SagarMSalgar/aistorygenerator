import { HfInference } from '@huggingface/inference';
import { nanoid } from 'nanoid';
import fs from 'fs/promises';
import path from 'path';
import { SceneData } from '@shared/schema';
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
      const negativePrompt = "realistic, photograph, 3d, detailed, ugly, deformed, low quality, low resolution, bad anatomy, worst quality, text, watermark";
      
      // Try to use Stability AI first
      try {
        console.log("Generating scene images with Stability AI...");
        
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
          
          // Generate scene image with Stability AI
          console.log(`Generating scene ${i+1} with Stability AI...`);
          const sceneImage = await generateStabilityImage(
            scenePrompt,
            negativePrompt
          );
          
          // Save scene image
          const sceneImageId = nanoid(8);
          const sceneImagePath = await saveBinaryImage(
            sceneImage,
            `scene-${i+1}-${sceneImageId}.png`
          );
          
          // Add scene to collection
          scenes.push({
            imageUrl: sceneImagePath,
            description: sceneDescriptions[i]
          });
        }
        
        return { scenes };
      } catch (stabError) {
        console.error("Stability AI error, falling back to Hugging Face:", stabError);
        
        // Clear scenes array to start fresh with Hugging Face
        scenes.length = 0;
        
        // Fall back to Hugging Face for scene generation
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
          
          // Add scene to collection
          scenes.push({
            imageUrl: sceneImagePath,
            description: sceneDescriptions[i]
          });
        }
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
