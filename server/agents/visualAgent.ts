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
      // Parse the script to identify key scenes
      const sceneAnalysisPrompt = `
        Based on this script:
        "${script}"
        
        And these character descriptions:
        Main character: ${characters.mainCharacterDescription}
        Supporting characters: ${characters.supportingCharactersDescription}
        
        Extract 4 key scenes that would make good visuals for a cartoon.
        For each scene, provide:
        1. A brief description
        2. The setting
        3. The characters present
        4. The mood/tone
        
        Format the output as:
        Scene 1: [description]
        Setting: [setting]
        Characters: [characters]
        Mood: [mood]
        
        Scene 2: ...
      `;

      // Generate scene descriptions using Hugging Face
      const sceneResponse = await hf.textGeneration({
        model: 'gpt2',
        inputs: sceneAnalysisPrompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7
        }
      });

      // Parse scene descriptions
      const sceneText = sceneResponse.generated_text;
      
      // Extract scenes using basic string parsing
      const sceneBlocks = sceneText.split(/Scene \d+:/);
      
      // Process scenes (skip first element if it's empty)
      const scenes = [];
      const startIndex = sceneBlocks[0].trim() === '' ? 1 : 0;
      
      // Create 4 scenes (or less if not enough were generated)
      for (let i = startIndex; i < Math.min(startIndex + 4, sceneBlocks.length); i++) {
        if (sceneBlocks[i] && sceneBlocks[i].trim()) {
          const sceneDescription = sceneBlocks[i].trim();
          scenes.push(sceneDescription);
        }
      }
      
      // If no scenes were extracted, create generic ones
      if (scenes.length === 0) {
        scenes.push("A day in the life scene with the main character");
        scenes.push("The main character interacting with supporting characters");
        scenes.push("A challenge or conflict the main character faces");
        scenes.push("Resolution scene showing the outcome of the day");
      }
      
      // Generate visuals for each scene
      const sceneData: SceneData[] = [];
      
      const negativePrompt = "realistic, photograph, 3d, detailed, ugly, deformed, low quality, low resolution, bad anatomy, worst quality, text, watermark";
      
      // Process each scene
      for (let i = 0; i < scenes.length; i++) {
        try {
          // Create a visual prompt that incorporates character descriptions
          const visualPrompt = `
            Create a colorful cartoon scene for: ${scenes[i]}
            Main character: ${characters.mainCharacterDescription}
            Style: Friendly, modern cartoon with simple lines and vibrant colors
            Background: Detailed setting relevant to the scene
          `;
          
          let sceneImagePath;
          
          // Try Stability AI first for higher quality images
          try {
            console.log(`Generating scene ${i+1} with Stability AI...`);
            
            // Generate scene with Stability
            const sceneImage = await generateStabilityImage(
              visualPrompt,
              negativePrompt
            );
            
            // Save scene image
            const sceneImageId = nanoid(8);
            sceneImagePath = await saveBinaryImage(
              sceneImage,
              `scene-${i+1}-${sceneImageId}.png`
            );
          } catch (stabError) {
            console.error(`Stability AI error for scene ${i+1}, falling back to Hugging Face:`, stabError);
            
            // Fall back to Hugging Face
            try {
              const sceneImageResponse = await hf.textToImage({
                model: "stabilityai/stable-diffusion-2",
                inputs: visualPrompt,
                parameters: {
                  negative_prompt: negativePrompt
                }
              });
              
              // Save scene image
              const sceneImageId = nanoid(8);
              sceneImagePath = await saveBase64Image(
                Buffer.from(await sceneImageResponse.arrayBuffer()).toString('base64'),
                `scene-${i+1}-${sceneImageId}.png`
              );
            } catch (hfError) {
              console.error(`Hugging Face error for scene ${i+1}, using fallback:`, hfError);
              // Use fallback image
              sceneImagePath = `/generated/fallback-scene-${i+1}.svg`;
            }
          }
          
          // Add scene data
          sceneData.push({
            imageUrl: sceneImagePath,
            description: scenes[i]
          });
        } catch (error) {
          console.error(`Error generating scene ${i+1}:`, error);
          
          // Use fallback image
          sceneData.push({
            imageUrl: `/generated/fallback-scene-${i+1}.svg`,
            description: scenes[i] || `Scene ${i+1} of the story`
          });
        }
      }
      
      // Ensure we have at least 4 scenes by adding fallbacks if needed
      while (sceneData.length < 4) {
        const sceneIndex = sceneData.length + 1;
        sceneData.push({
          imageUrl: `/generated/fallback-scene-${sceneIndex}.svg`,
          description: `Scene ${sceneIndex} of the story`
        });
      }
      
      console.log(`Generated ${sceneData.length} scenes`);
      
      // Return the visual data
      return {
        scenes: sceneData
      };
    } catch (error) {
      console.error('Error in visuals generation:', error);
      
      // Fallback with static URLs
      return {
        scenes: [
          {
            imageUrl: `/generated/fallback-scene-1.svg`,
            description: "Morning scene - Starting the day"
          },
          {
            imageUrl: `/generated/fallback-scene-2.svg`,
            description: "Mid-day scene - Main activity"
          },
          {
            imageUrl: `/generated/fallback-scene-3.svg`,
            description: "Afternoon scene - Challenge or conflict"
          },
          {
            imageUrl: `/generated/fallback-scene-4.svg`,
            description: "Evening scene - Resolution"
          }
        ]
      };
    }
  }
};