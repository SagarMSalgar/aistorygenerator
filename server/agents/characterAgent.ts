import { genAI, MODEL_NAME } from '../utils/ai';
import { nanoid } from 'nanoid';
import { generateStabilityImage, saveBinaryImage } from '../utils/imageUtils';

export const characterAgent = {
  /**
   * Generates cartoon character designs based on the script
   */
  async generateCharacters(script: string) {
    try {
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

      // Get character descriptions using Gemini
      const characterPrompt = `
        Analyze this cartoon script and create detailed character descriptions:
        "${script}"

        Provide:
        1. Main character's appearance, personality, and style
        2. Supporting characters' appearances, personalities, and styles

        Format as:
        Main character: [detailed description]
        Supporting characters: [detailed description]
      `;

      const result = await model.generateContent(characterPrompt);
      const characterText = result.response.text();

      // Parse character descriptions
      const mainMatch = characterText.match(/Main character:\s*(.+?)(?=Supporting characters:|$)/s);
      const supportingMatch = characterText.match(/Supporting characters:\s*(.+?)$/s);

      const mainCharacterDescription = mainMatch?.[1]?.trim() || "A friendly protagonist";
      const supportingCharactersDescription = supportingMatch?.[1]?.trim() || "Supporting cast";

      // Generate character images using Stability AI
      const mainCharacterPrompt = `
        Cartoon character design, ${mainCharacterDescription}, 
        friendly animation style, clean lines, vibrant colors, 
        white background, full body view
      `;

      const mainCharImage = await generateStabilityImage(mainCharacterPrompt);
      const mainCharacterUrl = await saveBinaryImage(
        mainCharImage,
        `character-main-${nanoid(6)}.png`
      );

      const supportingPrompt = `
        Group of cartoon characters, ${supportingCharactersDescription}, 
        friendly animation style, clean lines, vibrant colors, 
        white background, group composition
      `;

      const supportingImage = await generateStabilityImage(supportingPrompt);
      const supportingCharactersUrl = await saveBinaryImage(
        supportingImage,
        `character-supporting-${nanoid(6)}.png`
      );

      return {
        mainCharacterUrl,
        mainCharacterDescription,
        supportingCharactersUrl,
        supportingCharactersDescription
      };

    } catch (error) {
      console.error('Error in character generation:', error);
      throw error;
    }
  }
};