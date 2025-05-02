import { genAI, MODEL_NAME } from '../utils/ai';
import { ScriptData } from '@shared/schema';

// Function to generate dynamic script based on the user's day
function generateDynamicScript(dayDescription: string): ScriptData {
  // Extract key events or topics from the description
  const topics = extractTopics(dayDescription);
  
  // Generate a meaningful title based on the day's description
  const title = generateTitle(dayDescription, topics);
  
  // Create scenes based on the day's flow
  const scenes = generateScenes(dayDescription, topics);
  
  // Build the complete script
  const content = `Title: "${title}"\n\n${scenes.join('\n\n')}`;
  
  // Create a summary
  const summary = generateSummary(title, scenes, dayDescription);
  
  return {
    content,
    summary,
    title
  };
}

// Extract potential topics/themes from the day description
function extractTopics(description: string): string[] {
  const topics = [];
  
  // Check for common activities
  if (description.toLowerCase().includes('work')) topics.push('work');
  if (description.toLowerCase().includes('meeting')) topics.push('meetings');
  if (description.toLowerCase().includes('friend')) topics.push('friendship');
  if (description.toLowerCase().includes('family')) topics.push('family');
  if (description.toLowerCase().includes('eat') || description.toLowerCase().includes('food') || 
      description.toLowerCase().includes('lunch') || description.toLowerCase().includes('dinner')) 
    topics.push('food');
  if (description.toLowerCase().includes('game') || description.toLowerCase().includes('play')) 
    topics.push('recreation');
  if (description.toLowerCase().includes('walk') || description.toLowerCase().includes('exercise') || 
      description.toLowerCase().includes('gym') || description.toLowerCase().includes('workout'))
    topics.push('exercise');
  if (description.toLowerCase().includes('read') || description.toLowerCase().includes('book')) 
    topics.push('reading');
  if (description.toLowerCase().includes('movie') || description.toLowerCase().includes('tv') || 
      description.toLowerCase().includes('show') || description.toLowerCase().includes('watch')) 
    topics.push('entertainment');
  if (description.toLowerCase().includes('shop')) topics.push('shopping');
  
  // If we couldn't identify specific topics, add some general ones
  if (topics.length === 0) {
    const generalTopics = ['daily life', 'routine', 'unexpected events', 'reflection'];
    topics.push(...generalTopics.slice(0, 2 + Math.floor(Math.random() * 3)));
  }
  
  return topics;
}

// Generate a title based on day description and extracted topics
function generateTitle(description: string, topics: string[]): string {
  const titleFormats = [
    "A Day of {topic}",
    "The {topic} Adventure",
    "When {topic} Happens",
    "{topic} Diaries",
    "Life's {topic} Moments",
    "The Unexpected {topic}",
    "Finding Joy in {topic}",
    "{topic} Chronicles",
    "The {topic} Experience",
    "Journey Through {topic}"
  ];
  
  // Pick a random format and topic
  const format = titleFormats[Math.floor(Math.random() * titleFormats.length)];
  const topic = topics[Math.floor(Math.random() * topics.length)];
  
  // Capitalize the first letter of the topic
  const capitalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
  
  return format.replace('{topic}', capitalizedTopic);
}

// Generate scenes based on the day description
function generateScenes(description: string, topics: string[]): string[] {
  // Analyze the description for time of day indicators
  const hasMorning = description.toLowerCase().includes('morning') || description.toLowerCase().includes('wake up') || description.toLowerCase().includes('breakfast');
  const hasAfternoon = description.toLowerCase().includes('afternoon') || description.toLowerCase().includes('lunch');
  const hasEvening = description.toLowerCase().includes('evening') || description.toLowerCase().includes('dinner') || description.toLowerCase().includes('night');
  
  const scenes = [];
  
  // Morning scene
  if (hasMorning) {
    scenes.push('Scene 1: Morning Beginnings\nThe day starts with energy and possibility as our character prepares for what lies ahead.');
  } else {
    scenes.push('Scene 1: The Day Begins\nOur character starts the day, setting the tone for what\'s to come.');
  }
  
  // Create middle scenes based on topics
  const middleSceneCount = 2 + Math.floor(Math.random() * 2); // 2-3 middle scenes
  
  for (let i = 0; i < middleSceneCount && i < topics.length; i++) {
    const sceneIndex = i + 2;
    const topic = topics[i];
    
    let sceneDescription;
    switch (topic) {
      case 'work':
        sceneDescription = 'Our character tackles work challenges with determination and creativity.';
        break;
      case 'meetings':
        sceneDescription = 'An important meeting brings new insights and opportunities.';
        break;
      case 'friendship':
        sceneDescription = 'A moment with friends brings laughter and connection.';
        break;
      case 'family':
        sceneDescription = 'Family time creates warmth and meaningful interactions.';
        break;
      case 'food':
        sceneDescription = 'A delicious meal provides a welcome break in the day.';
        break;
      case 'recreation':
        sceneDescription = 'Taking time for fun and games adds joy to the routine.';
        break;
      case 'exercise':
        sceneDescription = 'Physical activity energizes our character and clears their mind.';
        break;
      case 'reading':
        sceneDescription = 'Getting lost in a good book transports our character to another world.';
        break;
      case 'entertainment':
        sceneDescription = 'Screen time provides relaxation and escape from daily pressures.';
        break;
      case 'shopping':
        sceneDescription = 'Browsing and buying brings small pleasures and practical necessities.';
        break;
      default:
        sceneDescription = 'An unexpected moment adds interest to the day\'s journey.';
    }
    
    scenes.push(`Scene ${sceneIndex}: ${capitalizeFirstLetter(topic)} Time\n${sceneDescription}`);
  }
  
  // Create a challenge/obstacle scene if we have room
  if (scenes.length < 5) {
    scenes.push(`Scene ${scenes.length + 1}: Overcoming Obstacles\nA small challenge presents itself, requiring creativity and perseverance.`);
  }
  
  // Evening/conclusion scene
  const finalSceneIndex = scenes.length + 1;
  if (hasEvening) {
    scenes.push(`Scene ${finalSceneIndex}: Evening Reflections\nAs the day comes to a close, our character reflects on the day's experiences and looks forward to tomorrow.`);
  } else {
    scenes.push(`Scene ${finalSceneIndex}: Day's End\nThe journey concludes with a sense of accomplishment and anticipation for what's next.`);
  }
  
  return scenes;
}

// Generate a summary of the script
function generateSummary(title: string, scenes: string[], description: string): string {
  // Extract the main theme from the title
  const theme = title.split(' ').slice(2).join(' ');
  
  // Count scenes
  const sceneCount = scenes.length;
  
  // Create a dynamic summary based on the scenes
  return `This cartoon tells the story of a day filled with ${theme.toLowerCase() || 'memorable moments'}, showing ${sceneCount} key moments from the protagonist's experiences. From the energetic morning start through various activities and challenges, to the reflective conclusion, the animation captures the essence of the day described as: "${description.substring(0, 40)}..."`;
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const scriptAgent = {
  /**
   * Generates a script based on the user's day description
   * @param dayDescription - The user's description of their day
   * @returns A script object containing the content and summary
   */
  async generateScript(dayDescription: string): Promise<ScriptData> {
    try {
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

      const prompt = `
        Create a 1-minute animated cartoon script based on this person's day:
        "${dayDescription}"

        The script should include:
        1. A creative title that captures the essence of the day
        2. 4-5 brief scenes with clear descriptions
        3. Natural scene transitions
        4. Character interactions and emotions
        5. A satisfying conclusion

        Format the output as:
        Title: [The creative title]

        Summary: [A brief one-paragraph summary]

        Scene 1: [Scene heading]
        [Scene description]

        Scene 2: [Scene heading]
        [Scene description]

        [Continue for all scenes]
      `;

      const result = await model.generateContent(prompt);
      const scriptText = result.response.text();

      // Parse the generated script
      const titleMatch = scriptText.match(/Title:\s*(.+?)(?:\n|$)/);
      const summaryMatch = scriptText.match(/Summary:\s*(.+?)(?:\n\n|$)/s);

      return {
        content: scriptText,
        summary: summaryMatch?.[1]?.trim() || "A day in the life story",
        title: titleMatch?.[1]?.trim() || "My Daily Cartoon"
      };

    } catch (error) {
      console.error('Error in script generation:', error);
      throw error;
    }
  }
};
