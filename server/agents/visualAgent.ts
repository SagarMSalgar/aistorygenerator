import { genAI, MODEL_NAME } from '../utils/ai';
import { nanoid } from 'nanoid';
import { generateStabilityImage, saveBinaryImage } from '../utils/imageUtils';
import { VisualData, SceneData } from '@shared/schema';

export const visualAgent = {
  async generateVisuals(script: string, characters: any, dialogue: any): Promise<VisualData> {
    try {
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

      // Use Gemini to analyze script and extract scene descriptions
      const scenePrompt = `
        Analyze this cartoon script and create detailed scene descriptions:
        "${script}"

        Characters involved:
        Main character: ${characters.mainCharacterDescription}
        Supporting characters: ${characters.supportingCharactersDescription}

        Extract exactly 4 key scenes. For each scene provide:
        1. Detailed visual description
        2. Setting and environment
        3. Character positions and actions
        4. Mood and lighting
        5. Important visual elements

        Format as:
        Scene 1:
        Description: [detailed visual description]
        Setting: [setting details]
        Characters: [character details]
        Mood: [mood description]

        [Repeat for all 4 scenes]
      `;

      const result = await model.generateContent(scenePrompt);
      const sceneAnalysis = result.response.text();

      // Parse scenes
      const sceneBlocks = sceneAnalysis.split(/Scene \d+:/g).filter(block => block.trim());
      const scenes: SceneData[] = [];

      // Generate visuals for each scene using Stability AI
      for (let i = 0; i < sceneBlocks.length; i++) {
        const sceneBlock = sceneBlocks[i];
        
        // Extract scene components
        const descriptionMatch = sceneBlock.match(/Description:\s*(.+?)(?=Setting:|$)/s);
        const settingMatch = sceneBlock.match(/Setting:\s*(.+?)(?=Characters:|$)/s);
        const moodMatch = sceneBlock.match(/Mood:\s*(.+?)(?=\n|$)/s);

        const description = descriptionMatch?.[1]?.trim() || '';
        const setting = settingMatch?.[1]?.trim() || '';
        const mood = moodMatch?.[1]?.trim() || '';

        // Create Stability AI prompt
        const visualPrompt = `
          Cartoon animation style scene:
          ${description}
          Setting: ${setting}
          Mood: ${mood}
          Style: Clean lines, vibrant colors, animation-ready composition
          Characters: Include the main character (${characters.mainCharacterDescription})
          Quality: High detail, professional animation look
        `.trim();

        try {
          console.log(`Generating scene ${i + 1} with Stability AI...`);
          
          // Generate scene image
          const sceneImage = await generateStabilityImage(
            visualPrompt,
            "ugly, deformed, distorted, disfigured, low quality, blurry, realistic photograph"
          );

          // Save the image
          const sceneImageId = nanoid(8);
          const imageUrl = await saveBinaryImage(
            sceneImage,
            `scene-${i + 1}-${sceneImageId}.png`
          );

          // Add scene to collection
          scenes.push({
            imageUrl,
            description: description
          });

        } catch (error) {
          console.error(`Error generating scene ${i + 1}:`, error);
          throw error;
        }
      }

      // Ensure we have exactly 4 scenes
      while (scenes.length < 4) {
        const sceneIndex = scenes.length + 1;
        throw new Error(`Failed to generate all required scenes. Only generated ${scenes.length} of 4 scenes.`);
      }

      return { scenes };

    } catch (error) {
      console.error('Error in visual generation:', error);
      throw error;
    }
  }
};